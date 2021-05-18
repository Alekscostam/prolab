/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';

export const ActionButton = props => {
	const {
		className,
		colClass,
		disabled,
		downloadFile,
		handleClick,
		href,
		iconColor,
		iconName,
		iconSide,
		iconSize,
		id,
		inputLikeStyle,
		label,
		openInNewTab,
		params,
		rendered,
		size,
		title,
		variant,
	} = props;
	let ariaLabel = '';
	if (openInNewTab) {
		ariaLabel = 'kliknięcie linku spowoduje otworzenie nowej karty w przeglądarce';
	}
	if (downloadFile) {
		if (ariaLabel) {
			ariaLabel = `${ariaLabel} kliknięcie linku spowoduje pobranie pliku`;
		} else {
			ariaLabel = 'kliknięcie linku spowoduje pobranie pliku';
		}
	}
	if (rendered) {
		if (inputLikeStyle) {
			return (
				<div className={colClass}>
					<div className={'row'}>
						<div className={'col-md-12'}>
							<label className="p-label" style={{ width: '100%', margin: '0px' }}>
								{''}
							</label>
							<a
								title={`${title ? title : ''}${ariaLabel}`}
								tabIndex="0"
								className={`p-button p-component p-button-text-only ${
									className !== undefined ? className : ''
								} ${variant !== undefined ? variant : ''} ${size !== undefined ? size : ''} ${
									disabled ? 'p-disabled disabled' : ''
								}`}
								href={disabled ? undefined : href ? href : 'javascript:;'}
								onClick={e => (disabled || !handleClick ? false : handleClick(e, params))}
								id={id}
								key={id === undefined ? `actionButton-${label}` : id}
							>
								<span
									className={`${iconName !== undefined ? 'icon_text' : ''} p-button-text p-c ${
										iconName !== undefined ? iconColor : ''
									}`}
								>
									{iconSide === 'left' && iconName !== undefined ? (
										<i alt="" className={`icon mdi ${iconName} ${iconSize}`} />
									) : null}
									{label}
									{iconSide === 'right' && iconName !== undefined ? (
										<i alt="" className={`icon mdi ${iconName} ${iconSize}`} />
									) : null}
								</span>
							</a>
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<a
					title={`${title ? title : ''}${ariaLabel}`}
					tabIndex="0"
					className={`p-button p-component p-button-text-only ${
						className !== undefined ? className : ''
					} ${variant !== undefined ? variant : ''} ${size !== undefined ? size : ''} ${
						disabled ? 'p-disabled disabled' : ''
					}`}
					href={disabled ? undefined : href ? href : 'javascript:;'}
					onClick={e => (disabled || !handleClick ? false : handleClick(e, params))}
					id={id}
					key={id === undefined ? `actionButton-${label}` : id}
				>
					<span
						className={`${iconName !== undefined ? 'icon_text' : ''} p-button-text p-c ${
							iconName !== undefined ? iconColor : ''
						}`}
					>
						{iconSide === 'left' && iconName !== undefined ? (
							<i alt="" className={`icon mdi ${iconName} ${iconSize}`} />
						) : null}
						{label}
						{iconSide === 'right' && iconName !== undefined ? (
							<i alt="" className={`icon mdi ${iconName} ${iconSize}`} />
						) : null}
					</span>
				</a>
			);
		}
	} else {
		return null;
	}
};

ActionButton.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	downloadFile: false,
	iconSide: 'right',
	rendered: true,
	disabled: false,
	inputLikeStyle: false,
	openInNewTab: false,
	params: {},
	size: 'normal',
	variant: 'dark',
};

ActionButton.propTypes = {
	className: PropTypes.string,
	colClass: PropTypes.string,
	disabled: PropTypes.bool,
	downloadFile: PropTypes.bool,
	handleClick: PropTypes.func,
	href: PropTypes.string,
	iconColor: PropTypes.string,
	iconLabel: PropTypes.string,
	iconName: PropTypes.string,
	iconSide: PropTypes.string,
	iconSize: PropTypes.string,
	id: PropTypes.string,
	inputLikeStyle: PropTypes.bool,
	label: PropTypes.string.isRequired,
	openInNewTab: PropTypes.bool,
	params: PropTypes.object,
	rendered: PropTypes.bool,
	size: PropTypes.string,
	title: PropTypes.string,
	variant: PropTypes.string,
};

export default ActionButton;
