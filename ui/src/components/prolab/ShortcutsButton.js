/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import ShortcutButton from "./ShortcutButton";
import ActionButtonWithMenu from "./ActionButtonWithMenu";
import ActionButtonWithMenuUtils from '../../utils/ActionButtonWithMenuUtils';

export class ShortcutsButton extends React.Component {

    constructor(props) {
        super(props);
        this.menuItems = ActionButtonWithMenuUtils.createItemsWithCommand(this.props.items, this.props.maxShortcutButtons,this.props.handleClick);
    }

    render() {
        return <React.Fragment>
            {this.props.items?.length > this.props.maxShortcutButtons ?
                <div id="right-panel-buttons" className="float-right ml-2">
                    <ActionButtonWithMenu 
                                            id="more_shortcut"
                                          iconName='mdi-dots-horizontal'
                                          items={this.menuItems}/>
                </div> : null}
            {this.props.items?.map((info, index) => {
                
                if (index < this.props.maxShortcutButtons)
                    return <div className="float-right">
                        <ShortcutButton 
                            item = {info}
                            handleClick = {() =>  {this.props.handleClick(info)}}
                            className="ml-1 mb-1" 
                            label={info.label}
                        />
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
