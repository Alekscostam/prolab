/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import {sessionPrelongFnc} from '../../App';

export const ShortcutButton = (props) => {
    const {
        active,
        className,
        disabled,
        handleClick,
        handleBlur,
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
        linkViewMode,
        buttonShadow,
    } = props;
    let ariaLabel = '';
    if (rendered) {
        return (
            <React.Fragment>
                {props.children}
                <a
                    onBlur={(e) => {
                        if (!e?.relatedTarget?.classList?.contains('p-menuitem-link')) {
                            const content = document.getElementById('header-left');
                            if (content) content.click();
                        }
                    }}
                    title={`${title ? title : ''}${ariaLabel}`}
                    tabIndex='0'
                    className={
                        linkViewMode
                            ? `shortcut-link ${className !== undefined ? className : ''} ${
                                  disabled ? 'p-disabled disabled' : ''
                              } ${active ? 'active-shortcut-link' : ''}`
                            : `shortcut ${buttonShadow ? 'shortcut-shadow' : ''} p-button p-component ${
                                  className !== undefined ? className : ''
                              } ${disabled ? 'p-disabled disabled' : ''} ${active ? 'active-shortcut-button' : ''}`
                    }
                    href={disabled ? undefined : href ? href : 'javascript:;'}
                    onClick={(e) => {
                        if (sessionPrelongFnc) {
                            sessionPrelongFnc();
                        }
                        e.stopPropagation();
                        if (disabled || !handleClick) {
                            return false;
                        } else {
                            handleClick(e, params);
                        }
                    }}
                    id={id}
                    type='submit'
                    key={id === undefined ? `actionButton-${label}` : id}
                >
                    <span
                        className={`${iconName !== undefined ? 'icon_text ' : ''}shortcut-text p-c ${
                            iconName !== undefined ? iconColor : ''
                        }`}
                    >
                        {iconSide === 'left' && iconName !== undefined ? (
                            <i className={`icon mdi ${iconName} ${iconSize}`} />
                        ) : null}
                        {label}
                        {iconSide === 'right' && iconName !== undefined ? (
                            <i className={`icon mdi ${iconName} ${iconSize}`} />
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
    active: false,
    linkViewMode: false,
    buttonShadow: true,
};

ShortcutButton.propTypes = {
    className: PropTypes.string,
    buttonShadow: PropTypes.bool,
    colClass: PropTypes.string,
    disabled: PropTypes.bool,
    handleClick: PropTypes.func,
    handleBlur: PropTypes.func,
    href: PropTypes.string,
    iconColor: PropTypes.string,
    iconLabel: PropTypes.string,
    iconName: PropTypes.string,
    iconSide: PropTypes.string,
    iconSize: PropTypes.string,
    id: PropTypes.string,
    label: PropTypes.string,
    params: PropTypes.object,
    rendered: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    size: PropTypes.string,
    active: PropTypes.bool,
    linkViewMode: PropTypes.bool,
};

export default ShortcutButton;
