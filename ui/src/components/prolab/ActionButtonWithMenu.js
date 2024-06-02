/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disabButtonWithMenuComponentle react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import ShortcutButton from './ShortcutButton';
import {Menu} from 'primereact/menu';
import {sessionPrelongFnc} from '../../App';

export class ActionButtonWithMenu extends React.Component {
    handleClick = (event) => {
        event.stopPropagation();
        this.menu.toggle(event);
        if (this.props.handleOpenMenu !== undefined && this.props.handleOpenMenu !== null) {
            this.props.handleOpenMenu(event);
        }
    };

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
            items,
            title,
        } = this.props;
        return (
            <React.Fragment>
                <span id='action-button-with-menu-contant' className='action-button-with-menu-contant'></span>
                <Menu
                    appendTo={document.body}
                    id={`${id}_popup_menu`}
                    className='action-button-with-menu-popup'
                    popup
                    ref={(el) => (this.menu = el)}
                    model={items}
                />
                <ShortcutButton
                    id={`${id}_menu_button`}
                    className={`action-button-with-menu ${className}`}
                    disabled={disabled}
                    handleBlur={(e) => {
                        if (!e?.relatedTarget?.classList?.contains('p-menuitem-link')) {
                            const content = document.getElementById('header-left');
                            if (content) content.click();
                        }
                    }}
                    handleClick={(event) => {
                        if (sessionPrelongFnc) {
                            sessionPrelongFnc();
                        }
                        const content = document.getElementById('header-left');
                        if (content) content.click();
                        if (customEventClick) {
                            customEventClick();
                            return;
                        }
                        this.handleClick(event);
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

ActionButtonWithMenu.defaultProps = {
    id: 'action-button-menu',
    className: null,
};

ActionButtonWithMenu.propTypes = {
    items: PropTypes.array.isRequired,
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

export default ActionButtonWithMenu;
