/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disabButtonWithMenuComponentle react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import ShortcutButton from './ShortcutButton';
import {sessionPrelongFnc} from '../../App';

export class ActionShortcutWithoutMenu extends React.Component {
    render() {
        const {
            className,
            customEventClick,
            disabled,
            iconColor,
            iconName,
            iconSide,
            iconSize,
            id,
            label,
            params,
            rendered,
            operationType,
            title,
        } = this.props;
        return (
            <React.Fragment>
                <ShortcutButton
                    id={`${id}_menu_button`}
                    className={`action-button-with-menu ${className}`}
                    disabled={disabled}
                    handleClick={(event) => {
                        if (sessionPrelongFnc) {
                            sessionPrelongFnc();
                        }
                        const content = document.getElementById('header-left');
                        if (content) content.click();
                        if (customEventClick) {
                            customEventClick({type: operationType});
                            return;
                        }
                    }}
                    iconColor={iconColor}
                    iconName={iconName}
                    iconSide={iconSide}
                    iconSize={iconSize}
                    label={label}
                    params={params}
                    rendered={rendered}
                    title={title}
                />
            </React.Fragment>
        );
    }
}

ActionShortcutWithoutMenu.defaultProps = {
    id: 'action-button-menu',
    className: null,
};

ActionShortcutWithoutMenu.propTypes = {
    items: PropTypes.array,
    label: PropTypes.string,
    title: PropTypes.string,
    id: PropTypes.string,
    className: PropTypes.string,
    colClass: PropTypes.string,
    disabled: PropTypes.bool,
    handleOpenMenu: PropTypes.func,
    customEventClick: PropTypes.func,
    iconColor: PropTypes.string,
    iconLabel: PropTypes.string,
    iconName: PropTypes.string,
    iconSide: PropTypes.string,
    iconSize: PropTypes.string,
    params: PropTypes.object,
    rendered: PropTypes.bool,
};

export default ActionShortcutWithoutMenu;
