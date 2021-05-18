/* eslint-disable react/jsx-handler-names */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

class UIMessage extends Component {
	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
		this.onClose = this.onClose.bind(this);
	}

	componentDidMount() {
		const { message } = this.props;
		if (!message.sticky) {
			this.timeout = setTimeout(() => {
				this.onClose(null);
			}, message.life || 5000);
		}
	}

	componentWillUnmount() {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
	}

	onClose(event) {
		const { message, onClose } = this.props;
		if (this.timeout) {
			clearTimeout(this.timeout);
		}

		if (onClose) {
			onClose(message);
		}

		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
	}

	onClick() {
		const { message, onClick } = this.props;
		if (onClick) {
			onClick(message);
		}
	}

	renderCloseIcon() {
		const { message } = this.props;
		if (message.closable !== false) {
			return (
				<button type="button" className="p-messages-close p-link" onClick={this.onClose}>
					<i className="p-messages-close-icon pi pi-times" />
				</button>
			);
		} else {
			return null;
		}
	}

	renderMessages() {
		const { message } = this.props;
		if (message) {
			return (
				<ul>
					<li key={message.id}>
						<span className="p-messages-summary">{message.summary}</span>
						<span className="p-messages-detail">{message.detail}</span>
					</li>
				</ul>
			);
		} else {
			return null;
		}
	}

	render() {
		const { message } = this.props;
		const className = `p-messages p-component p-messages-${message.severity}`;
		const icon = classNames('p-messages-icon pi ', {
			'pi-info-circle': message.severity === 'info',
			'pi-exclamation-triangle': message.severity === 'warn',
			'pi-times': message.severity === 'error',
			'pi-check': message.severity === 'success',
		});
		const closeIcon = this.renderCloseIcon();
		const messages = this.renderMessages();

		return (
			<div
				ref={el => {
					this.container = el;
				}}
				className={className}
				onClick={this.onClick}
			>
				<div className="p-messages-wrapper">
					{closeIcon}
					<span className={icon} />
					{messages}
				</div>
			</div>
		);
	}
}

UIMessage.defaultProps = {
	message: null,
	onClose: null,
	onClick: null,
};

UIMessage.propTypes = {
	message: PropTypes.object,
	onClick: PropTypes.func,
	onClose: PropTypes.func,
};

export default UIMessage;
