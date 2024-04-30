import React from 'react';
import PropTypes from 'prop-types';
import ConsoleHelper from '../../utils/ConsoleHelper';
import {ColumnType} from '../../model/ColumnType';

class GridViewMinimizeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.labels = this.props;
        ConsoleHelper('GridViewMinimalizedComponent -> constructor');
    }

    render() {
        let fieldName = '';
        let fieldValue = '';
        let fieldType = '';
        try {
            fieldName = this.props.subView?.headerColumns[0].label;
            fieldValue = this.props.subView?.headerData[0][this.props.subView.headerColumns[0].fieldName];
            fieldType = this.props.subView?.headerColumns[0].type;
        } catch (e) {}

        switch (fieldType) {
            case ColumnType.I:
            case ColumnType.IM:
                fieldValue = (
                    <div>
                        {' '}
                        <img
                            onClick={(e) => {
                                this.props.onImageClick(e.currentTarget.currentSrc, fieldName);
                            }}
                            src={`data:image/jpeg;base64,${fieldValue}`}
                            alt=''
                            style={{cursor: 'pointer', maxWidth: '50px', padding: '3px'}}
                        />
                    </div>
                );
                break;
            default:
                break;
        }

        return (
            <React.Fragment>
                <div className='minimize-sub-view'>
                    <div className='d-inline-flex p-1' style={{color: '#707890'}}>
                        {fieldName}
                    </div>
                    <div className='d-inline-flex p-1' style={{color: '#333'}}>
                        {fieldValue}
                    </div>
                    <div className='arrow-close' onClick={this.props.onClick} />
                </div>
            </React.Fragment>
        );
    }
}

GridViewMinimizeComponent.defaultProps = {};

GridViewMinimizeComponent.propTypes = {
    subView: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default GridViewMinimizeComponent;
