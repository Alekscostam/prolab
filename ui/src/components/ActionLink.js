/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-script-url */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';

export const ActionLink = (props) => {
	const { alt, className, colClass, disabled, downloadFile, handleClick, href, iconSize, iconColor, iconName, iconSide, id, inputLikeStyle, label, openInNewTab, params, rendered, size, title, variant } = props;
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
							<label className='p-label' style={{ width: '100%', margin: '0px' }}>
								{''}
							</label>
							<a
								tabIndex='0'
								className={`${className !== undefined ? className : 'p-link'} ${iconName !== undefined ? 'link-icon' : ''} ${variant} ${size}`}
								href={disabled ? undefined : href ? href : 'javascript:;'}
								onClick={(e) => (disabled || !handleClick ? false : handleClick(e, params))}
								id={id}
								title={`${title !== undefined ? title : alt !== undefined ? alt : ''}${ariaLabel}`}
								key={id === undefined ? `actionLink-${label}` : id}
								target={openInNewTab ? '_blank' : undefined}>
								<span className={`${iconName !== undefined ? 'icon_text' : ''} p-button-text p-c ${iconName !== undefined ? iconColor : ''}`}>
									{iconSide === 'left' && iconName !== undefined ? <i alt='' className={`icon mdi ${iconName} ${iconSize}`} /> : null}
									{label}
									{iconSide === 'right' && iconName !== undefined ? <i alt='' className={`icon mdi ${iconName} ${iconSize}`} /> : null}
								</span>
							</a>
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<a
					tabIndex='0'
					className={`${className !== undefined ? className : 'p-link'} ${iconName !== undefined ? 'link-icon' : ''} ${variant} ${size} ${disabled ? 'p-disabled disabled' : ''}`}
					href={href ? href : 'javascript:;'}
					onClick={(e) => (handleClick ? handleClick(e, params) : false)}
					id={id}
					title={`${title !== undefined ? title : alt !== undefined ? alt : ''}${ariaLabel}`}
					key={id === undefined ? `actionLink-${label}` : id}
					target={openInNewTab ? '_blank' : undefined}>
					<span className={`${iconName !== undefined ? 'icon_text' : ''} p-button-text p-c ${iconName !== undefined ? iconColor : ''}`}>
						{iconSide === 'left' && iconName !== undefined ? <i alt='' className={`icon mdi ${iconName} ${iconSize}`} /> : null}
						{label}
						{iconSide === 'right' && iconName !== undefined ? <i alt='' className={`icon mdi ${iconName} ${iconSize}`} /> : null}
					</span>
				</a>
			);
		}
	} else {
		return null;
	}
};

ActionLink.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disabled: false,
	downloadFile: false,
	iconSide: 'right',
	inputLikeStyle: false,
	openInNewTab: false,
	rendered: true,
	params: {},
	size: 'none',
	variant: 'none',
};

ActionLink.propTypes = {
	alt: PropTypes.string,
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

export default ActionLink;
