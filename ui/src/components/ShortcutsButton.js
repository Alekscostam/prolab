/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import ShortcutButton from "./ShortcutButton";
import ActionButtonWithMenu from "./ActionButtonWithMenu";

export class ShortcutsButton extends React.Component {

    constructor(props) {
        super(props);
        this.menuItems = [];
        let index = 1;
        for (let item in this.props.items) {
            if (index > this.props.maxShortcutButtons) {
                this.menuItems.push({
                    id: this.props.items[item].id,
                    label: this.props.items[item].label,
                    /*
                    command:(e) => {
                        alert(e)
                    }
                    */
                });
            }
            index++;
        }
    }

    render() {
        return <React.Fragment>
            {this.props.items?.length > this.props.maxShortcutButtons ?
                <div id="right-panel-buttons" className="float-right ml-2">
                    <ActionButtonWithMenu id="more_shortcut"
                                          iconName='mdi-dots-horizontal'
                                          items={this.menuItems}/>
                </div> : null}
            {this.props.items?.map((button, index) => {
                if (index < this.props.maxShortcutButtons)
                    return <div className="float-right ">
                        <ShortcutButton className="ml-2" label={button.label}/>
                    </div>
                return null;
            })}
        </React.Fragment>
    }
}

ShortcutsButton.defaultProps =
    {
        colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
        maxShortcutButtons: 2,
    }
;

ShortcutsButton.propTypes = {
    items: PropTypes.array.isRequired,
    className: PropTypes.string,
    maxShortcutButtons: PropTypes.number,
};

export default ShortcutsButton;
