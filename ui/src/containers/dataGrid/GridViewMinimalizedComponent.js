import React from 'react';
import PropTypes from "prop-types";
import ConsoleHelper from "../../utils/ConsoleHelper";
import DivContainer from "../../components/DivContainer";

class GridViewMinimalizedComponent extends React.Component {

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
                <div className='minimalize-sub-view'>
                    <DivContainer colClass='row'>
                        <DivContainer
                            colClass='col-4'>{fieldName}</DivContainer>
                        <DivContainer
                            colClass='col-7'>{fieldValue}</DivContainer>
                        <div className="arrow-close" onClick={this.props.onClick}></div>
                    </DivContainer>
                </div>
            </React.Fragment>
        );
    }
}

GridViewMinimalizedComponent.defaultProps = {};

GridViewMinimalizedComponent.propTypes = {
    subView: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired
};

export default GridViewMinimalizedComponent;
