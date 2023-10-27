import React from 'react';
import PropTypes from "prop-types";
import ConsoleHelper from "../../utils/ConsoleHelper";

class GridViewMinimizeComponent extends React.Component {

    constructor(props) {
        super(props);
        this.labels = this.props;
        ConsoleHelper('GridViewMinimalizedComponent -> constructor');
    }

    render() {
        let fieldName = '';
        let fieldValue = '';
        try {
            fieldName = this.props.subView?.headerColumns[0].label;
            fieldValue = this.props.subView?.headerData[0][this.props.subView.headerColumns[0].fieldName];
        } catch (e) {
        }
        return (
            <React.Fragment>
                <div className='minimize-sub-view'>
                    <div className='d-inline-flex p-1' style={{color: '#707890'}}>{fieldName}</div>
                    <div className='d-inline-flex p-1' style={{color: '#333'}}>{fieldValue}</div>
                    <div className="arrow-close" onClick={this.props.onClick}/>
                </div>
            </React.Fragment>
        );
    }
}

GridViewMinimizeComponent.defaultProps = {};

GridViewMinimizeComponent.propTypes = {
    subView: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired
};

export default GridViewMinimizeComponent;
