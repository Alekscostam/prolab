/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disabButtonWithMenuComponentle react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import ShortcutButton from './ShortcutButton';
import {Menu} from 'primereact/menu';

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
                <div id='action-button-with-menu-contant'></div>
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
                    handleClick={(event) => {
                        const content = document.getElementById('action-button-with-menu-contant');
                        content.click();
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
    iconColor: PropTypes.string,
    iconLabel: PropTypes.string,
    iconName: PropTypes.string,
    iconSide: PropTypes.string,
    iconSize: PropTypes.string,
    params: PropTypes.object,
    rendered: PropTypes.bool,
};

export default ActionButtonWithMenu;
