import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Loader from './Loader';
import safeActiveElement from './safeActiveElement';

const defaultProps = {
	tag: 'div',
	renderChildren: true,
	loader: Loader,
};

class BlockUi extends Component {
	constructor(props) {
		super(props);

		this.handleTabbedUpTop = this.handleTabbedUpTop.bind(this);
		this.handleTabbedDownTop = this.handleTabbedDownTop.bind(this);
		this.handleTabbedUpBottom = this.handleTabbedUpBottom.bind(this);
		this.handleTabbedDownBottom = this.handleTabbedDownBottom.bind(this);
		this.setHelper = this.setRef.bind(this, 'helper');
		this.setBlocker = this.setRef.bind(this, 'blocker');
		this.setTopFocus = this.setRef.bind(this, 'topFocus');
		this.setContainer = this.setRef.bind(this, 'container');
		this.setMessageContainer = this.setRef.bind(this, 'messageContainer');
		this.handleScroll = this.handleScroll.bind(this);

		this.state = { top: '50%' };
	}

	componentDidUpdate(nextProps) {
		const { blocking, keepInView } = this.state;
		if (nextProps.blocking !== blocking) {
			if (nextProps.blocking) {
				// blocking started
				if (
					this.helper &&
					this.helper.parentNode &&
					this.helper.parentNode.contains &&
					this.helper.parentNode.contains(safeActiveElement())
				) {
					this.focused = safeActiveElement();
					// https://www.tjvantoll.com/2013/08/30/bugs-with-document-activeelement-in-internet-explorer/#blurring-the-body-switches-windows-in-ie9-and-ie10
					if (this.focused && this.focused !== document.body) {
						(window.setImmediate || setTimeout)(
							() => this.focused && typeof this.focused.blur === 'function' && this.focused.blur()
						);
					}
				}
			} else {
				this.detachListeners();
				const ae = safeActiveElement();
				if (this.focused && (!ae || ae === document.body || ae === this.topFocus)) {
					if (typeof this.focused.focus === 'function') {
						this.focused.focus();
					}
					this.focused = null;
				}
			}
		}
		if (
			nextProps.keepInView &&
			(nextProps.keepInView !== keepInView ||
				(nextProps.blocking && nextProps.blocking !== blocking))
		) {
			this.attachListeners();
			this.keepInView(nextProps);
		}
	}

	componentWillUnmount() {
		this.detachListeners();
	}

	setRef(name, ref) {
		this[name] = ref;
	}

	attachListeners() {
		window.addEventListener('scroll', this.handleScroll);
	}

	detachListeners() {
		window.removeEventListener('scroll', this.handleScroll);
	}

	blockingTab(e, withShift = false) {
		const { blocking } = this.props;
		// eslint-disable-next-line eqeqeq
		return blocking && (e.key === 'Tab' || e.keyCode === 9) && e.shiftKey == withShift;
	}

	handleTabbedUpTop(e) {
		if (this.blockingTab(e)) {
			this.blocker.focus();
		}
	}

	handleTabbedDownTop(e) {
		if (this.blockingTab(e)) {
			e.preventDefault();
			this.blocker.focus();
		}
	}

	handleTabbedUpBottom(e) {
		if (this.blockingTab(e, true)) {
			this.topFocus.focus();
		}
	}

	handleTabbedDownBottom(e) {
		if (this.blockingTab(e, true)) {
			e.preventDefault();
			this.topFocus.focus();
		}
	}

	keepInView(props = this.props) {
		const { top } = this.state;
		if (props.blocking && props.keepInView && this.container) {
			const containerBounds = this.container.getBoundingClientRect();
			const windowHeight = window.innerHeight;
			if (containerBounds.top > windowHeight || containerBounds.bottom < 0) return;
			if (containerBounds.top >= 0 && containerBounds.bottom <= windowHeight) {
				if (top !== '50%') {
					this.setState({ top: '50%' });
				}
				return;
			}

			const messageBoundsHeight = this.messageContainer
				? this.messageContainer.getBoundingClientRect().height
				: 0;
			let calculatedTop =
				Math.max(
					Math.min(windowHeight, containerBounds.bottom) - Math.max(containerBounds.top, 0),
					messageBoundsHeight
				) / 2;
			if (containerBounds.top < 0) {
				calculatedTop = Math.min(
					calculatedTop - containerBounds.top,
					containerBounds.height - messageBoundsHeight / 2
				);
			}
			if (top !== calculatedTop) {
				this.setState({ top: calculatedTop });
			}
		}
	}

	handleScroll() {
		this.keepInView();
	}

	render() {
		const {
			tag: Tag,
			blocking,
			className,
			children,
			message,
			loader,
			renderChildren,
			keepInView,
			waitPanelLabel,
			...attributes
		} = this.props;
		const { top } = this.state;
		const classes = blocking ? `block-ui ${className}` : className;
		const renderChilds = !blocking || renderChildren;

		return (
			<Tag {...attributes} className={classes} aria-busy={blocking}>
				{blocking && (
					<div
						tabIndex="0"
						onKeyUp={this.handleTabbedUpTop}
						onKeyDown={this.handleTabbedDownTop}
						ref={this.setTopFocus}
					/>
				)}
				{renderChilds && children}
				<div
					className={`block-ui-container ${blocking ? 'block' : ''}`}
					tabIndex="0"
					ref={this.setBlocker}
					onKeyUp={this.handleTabbedUpBottom}
					onKeyDown={this.handleTabbedDownBottom}
				>
					<div className="block-ui-overlay" ref={this.setContainer} />
					<div
						className="block-ui-message-container"
						ref={this.setMessageContainer}
						style={{ top: keepInView ? top : undefined }}
					>
						<div className="block-ui-message">
							{message}
							{React.isValidElement(loader) || loader instanceof Function ? (
								loader(waitPanelLabel)
							) : (
								<Loader waitPanelLabel={waitPanelLabel} />
							)}
						</div>
					</div>
				</div>
				<span ref={this.setHelper} />
			</Tag>
		);
	}
}

BlockUi.propTypes = {
	blocking: PropTypes.bool,
	children: PropTypes.node,
	className: PropTypes.string,
	keepInView: PropTypes.bool,
	loader: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
	message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
	renderChildren: PropTypes.bool,
	tag: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.func,
		PropTypes.shape({ $$typeof: PropTypes.symbol, render: PropTypes.func }),
	]),
	waitPanelLabel: PropTypes.string,
};
BlockUi.defaultProps = defaultProps;

export default BlockUi;
