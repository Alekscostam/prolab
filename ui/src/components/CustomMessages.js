/* eslint-disable react/jsx-handler-names */
/* eslint-disable react/jsx-max-props-per-line */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { TransitionGroup } from 'react-transition-group';
import UIMessage from './UIMessage';

class CustomMessages extends Component {
	constructor(props) {
		super(props);
		this.state = {
			messages: [],
		};
		this.messageIdx = 0;
		this.onClose = this.onClose.bind(this);
	}

	show(value) {
		const { messages } = this.state;
		if (value) {
			let newMessages = [];

			if (Array.isArray(value)) {
				for (let i = 0; i < value.length; i++) {
					value[i].id = this.messageIdx++;
					newMessages = [...messages, ...value];
				}
			} else {
				value.id = this.messageIdx++;
				newMessages = messages ? [...messages, value] : [value];
			}

			this.setState({
				messages: newMessages,
			});
		}
	}

	clear() {
		this.setState({
			messages: [],
		});
	}

	replace(value) {
		this.setState(
			{
				messages: [],
			},
			() => this.show(value)
		);
	}

	onClose(message) {
		const { onRemove } = this.props;
		const { messages } = this.state;
		const newMessages = messages.filter(msg => msg.id !== message.id);
		this.setState({
			messages: newMessages,
		});

		if (onRemove) {
			onRemove(message);
		}
	}

	render() {
		const { className, id, onClick, style } = this.props;
		const { messages } = this.state;
		return (
			<div aria-live="assertive" id={id} className={className} style={style}>
				<TransitionGroup>
					{messages.map(message => (
						<UIMessage message={message} onClick={onClick} onClose={this.onClose} />
					))}
				</TransitionGroup>
			</div>
		);
	}
}

CustomMessages.defaultProps = {
	id: 'custom-messages',
	className: null,
	style: null,
	onRemove: null,
	onClick: null,
};

CustomMessages.propTypes = {
	className: PropTypes.string,
	id: PropTypes.string,
	onClick: PropTypes.func,
	onRemove: PropTypes.func,
	style: PropTypes.object,
};

export default CustomMessages;
