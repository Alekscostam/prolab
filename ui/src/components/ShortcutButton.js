/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';


export const ShortcutButton = props => {
    const {
        className,
        disabled,
        handleClick,
        href,
        iconColor,
        iconName,
        iconSide,
        iconSize,
        id,
        label,
        params,
        rendered,
        title,
    } = props;
    let ariaLabel = '';
    if (rendered) {
        return (
            <React.Fragment>
                {props.children}
                <a
                    title={`${title ? title : ''}${ariaLabel}`}
                    tabIndex="0"
                    className={`shortcut p-button p-component ${className !== undefined ? className : ''} ${disabled ? 'p-disabled disabled' : ''}`}
                    href={disabled ? undefined : href ? href : 'javascript:;'}
                    onClick={e => (disabled || !handleClick ? false : handleClick(e, params))}
                    id={id}
                    key={id === undefined ? `actionButton-${label}` : id}
                >
					<span
                        className={`${iconName !== undefined ? 'icon_text' : ''} shortcut-text p-c ${
                            iconName !== undefined ? iconColor : ''
                        }`}
                    >
						{iconSide === 'left' && iconName !== undefined ? (
                            <i className={`icon mdi ${iconName} ${iconSize}`}></i>
                        ) : null}
                        {label}
                        {iconSide === 'right' && iconName !== undefined ? (

                            <i className={`icon mdi ${iconName} ${iconSize}`}></i>
                        ) : null}
					</span>
                </a>
            </React.Fragment>
        );
    } else {
        return null;
    }
};

ShortcutButton.defaultProps = {
    colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
    downloadFile: false,
    iconSide: 'right',
    rendered: true,
    disabled: false,
    params: {},
};

ShortcutButton.propTypes = {
    className: PropTypes.string,
    colClass: PropTypes.string,
    disabled: PropTypes.bool,
    handleClick: PropTypes.func,
    href: PropTypes.string,
    iconColor: PropTypes.string,
    iconLabel: PropTypes.string,
    iconName: PropTypes.string,
    iconSide: PropTypes.string,
    iconSize: PropTypes.string,
    id: PropTypes.string,
    label: PropTypes.string.isRequired,
    params: PropTypes.object,
    rendered: PropTypes.bool,
    size: PropTypes.string,
    label: PropTypes.string,
};

export default ShortcutButton;
