/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import ShortcutButton from './ShortcutButton';
import SimpleReactValidator from '../validator';
import {Sidebar} from 'primereact/sidebar';
import {Toast} from 'primereact/toast';
import LocUtils from '../../utils/LocUtils';
import CrudService from '../../services/CrudService';
import BaseRowComponent from '../../baseContainers/BaseRowComponent';
import {ColumnType} from '../../model/ColumnType';

export class DocumentRowComponent extends BaseRowComponent {
    constructor(props) {
        super(props);
        this.service = new CrudService();
        this.state = {
            loading: true,
            preventSave: false,
        };

        this.messages = React.createRef();
        this.handleCancel = this.handleCancel.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const visibleDocumentPanelPrevious = prevProps.visibleDocumentPanel;
        const visibleDocumentPanel = this.props.visibleDocumentPanel;
        console.log(
            'visibleDocumentPanelPrevious %s %visibleDocumentPanel',
            visibleDocumentPanelPrevious,
            visibleDocumentPanel
        );
        //wykrycie eventu wysunięcia panelu z edycją
        if (visibleDocumentPanelPrevious === false && visibleDocumentPanel === true) {
            this.setState({preventSave: false});
        }
        super.componentDidUpdate();
    }

    createObjectToSave(rowArray) {
        let arrayTmp = [];
        for (let row of rowArray) {
            if (row.type === ColumnType.B) {
                row.value = row.value === null ? false : row.value;
            }
            arrayTmp.push({fieldName: row.fieldName, value: row.value});
        }
        return arrayTmp;
    }

    render() {
        const visibleDocumentPanel = this.props.visibleDocumentPanel;
        let inputDataFields = this.props.documentInfo.inputDataFields;

        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />

                <Sidebar
                    id='right-sidebar'
                    visible={visibleDocumentPanel}
                    modal={true}
                    position='right'
                    onHide={() => {
                        this.props.onHide();
                    }}
                    icons={() => (
                        <React.Fragment>
                            <div id='label' className='label' style={{flex: 'auto'}}>
                                {LocUtils.loc(this.props.labels, '', 'Zatwierdzanie kryteriów')}
                            </div>
                            <div id='buttons' style={{textAlign: 'right'}}>
                                <ShortcutButton
                                    id={'opSave'}
                                    className={`grid-button-panel inverse mt-1 mb-1 mr-1`}
                                    handleClick={this.handleFormSubmit}
                                    title={'Zatwierdzanie kryteriów'}
                                    label={LocUtils.loc(this.props.labels, '', 'Zatwierdź')}
                                />
                                <ShortcutButton
                                    id={'opCancel'}
                                    className={`grid-button-panel inverse mt-1 mb-1 mr-1`}
                                    handleClick={this.handleCancel}
                                    title={'Anulowanie'}
                                    label={LocUtils.loc(this.props.labels, '', 'Anuluj')}
                                />
                            </div>
                        </React.Fragment>
                    )}
                >
                    <form onSubmit={this.handleFormSubmit} noValidate>
                        <div id='row-edit' className='row-edit-container'>
                            {this.state.preventSave ? (
                                <div id='validation-panel' className='validation-panel'>
                                    {this.fieldsMandatoryLabel}
                                </div>
                            ) : null}
                            {inputDataFields?.map((field, index) => {
                                return this.renderField(field, index, undefined);
                            })}
                        </div>
                    </form>
                </Sidebar>
            </React.Fragment>
        );
    }

    handleValidForm() {
        const data = this.createObjectToSave(this.props.documentInfo.inputDataFields);
        const info = this.props.documentInfo.info;
        const parentIdArg = info.parentId ? `${info.parentId}` : null;
        this.props.onSave(data, `${info.viewId}`, `${info.viewObjectId}`, parentIdArg);
    }
}

DocumentRowComponent.defaultProps = {};

DocumentRowComponent.propTypes = {
    visibleDocumentPanel: PropTypes.bool.isRequired,
    editData: PropTypes.object.isRequired,
    kindView: PropTypes.string,
    showErrorMessages: PropTypes.func.isRequired,
    onAfterStateChange: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    onSave: PropTypes.func.isRequired,
    onAutoFill: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onEditList: PropTypes.func,
    onHide: PropTypes.func.isRequired,
    validator: PropTypes.instanceOf(SimpleReactValidator).isRequired,
    onError: PropTypes.func,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
};

export default DocumentRowComponent;
