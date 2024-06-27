import React from 'react';
import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';
import GridViewComponent from '../../containers/dataGrid/GridViewComponent';
import {Button} from 'primereact/button';
import {DataGridUtils} from '../../utils/component/DataGridUtils';
import LocUtils from '../../utils/LocUtils';
import {OperationType} from '../../model/OperationType';

export default class EditListComponent extends React.Component {
    constructor(props) {
        super(props);
        this.refDataGrid = {};
    }
    componentDidMount() {
        if (typeof this.props?.blockUiIfNeccessery === 'function') {
            this.props.blockUiIfNeccessery();
        }
    }
    componentDidUpdate() {
        if (typeof this.props?.blockUiIfNeccessery === 'function') {
            this.props.blockUiIfNeccessery();
        }
    }

    render() {
        const width = this.props.parsedGridView?.info?.windowSize?.width || '50vw';
        const height = this.props.parsedGridView?.info?.windowSize?.height || '150vw';
        const opSelect = DataGridUtils.getOpButton(this.props.parsedGridView?.operations, OperationType.OP_SELECT);
        return (
            <React.Fragment>
                <Dialog
                    id='editListDialog'
                    header={LocUtils.loc(this.props.labels, 'Selection_List_Label', 'Lista podpowiedzi')}
                    footer={
                        opSelect ? (
                            <Button
                                type='button'
                                onClick={() => {
                                    const setFields = this.props.parsedGridView?.setFields || [];
                                    const separatorJoin = this.props.parsedGridView?.options?.separatorJoin || ',';
                                    let selectedRowData = this.props.selectedRowData || [];
                                    const setFieldsLength = setFields.length;
                                    const isEditMode = !!this.props.selectedRowData.find(el => el.length === setFieldsLength);
                                    if(isEditMode){
                                            setFields.forEach((field) => {
                                                const fieldKey = field.fieldList;
                                                let values = [];
                                                selectedRowData.forEach((row) => {
                                                    for (const item in row) {
                                                        const object = row[item];
                                                        const firstObjKey = Object.keys(object)[0];
                                                        if (firstObjKey === fieldKey) {
                                                            const foundValue = object[firstObjKey];
                                                            values.push(foundValue === 'null' ? '' : '' + foundValue);
                                                            break;
                                                        }
                                                    }
                                                });
                                                field.fieldValue =
                                                    values.join(separatorJoin) === undefined || null
                                                        ? ''
                                                        : values.join(separatorJoin);
                                            });
                                            this.props.handleOnChosen(setFields, this.props.field);
                                    }
                                    this.props.onHide();
                                }}
                                label={opSelect?.label}
                            />
                        ) : <div></div>
                    }
                    visible={this.props.visible}
                    resizable={false}
                    breakpoints={{'960px': '75vw', '640px': '100vw'}}
                    // style={{width: width, height: height, minWidth: width, minHeight: height}}
                    style={{width: width, height: height}}
                    onHide={() => this.props.onHide()}
                >
                    <GridViewComponent
                    altAndLeftClickEnabled={true}
                        id={this.props.id}
                        elementSubViewId={null}
                        handleOnDataGrid={(ref) => (this.refDataGrid = ref)}
                        parsedGridView={this.props.parsedGridView}
                        parsedGridViewData={this.props.parsedGridViewData}
                        gridViewColumns={this.props.gridViewColumns}
                        packageRows={this.props.parsedGridView?.info?.dataPackageSize}
                        handleBlockUi={() => {
                            this.props.handleBlockUi();
                        }}
                        getRef={() => {
                            return this.refDataGrid;
                        }}
                        handleUnblockUi={() => {
                            this.props.handleUnblockUi();
                        }}
                        showSelection={true}
                        handleUnselectAll={() => {
                            if (this.props.unselectAllDataGrid) {
                                this.props.unselectAllDataGrid();
                            }
                        }}
                        defaultSelectedRowKeys={this.props.defaultSelectedRowKeys}
                        handleSelectedRowKeys={(e) => this.props.handleSelectedRowData(e)}
                        showFilterRow={true}
                        showErrorMessages={(err) => this.props.showErrorMessages(err)}
                        dataGridStoreSuccess={this.props.dataGridStoreSuccess}
                        allowSelectAll={false}
                    />
                </Dialog>
            </React.Fragment>
        );
    }
}

EditListComponent.defaultProps = {
    visible: true,
    dataGridStoreSuccess: true,
};

EditListComponent.defaultProps = {
    id: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    parsedGridView: PropTypes.object.isRequired,
    parsedGridViewData: PropTypes.object.isRequired,
    gridViewColumns: PropTypes.object.isRequired,
    handleOnChosen: PropTypes.func.isRequired,
    handleBlockUi: PropTypes.func.isRequired,
    handleUnblockUi: PropTypes.func.isRequired,
    blockIfNeccessery: PropTypes.func,
    showErrorMessages: PropTypes.func.isRequired,
    selectedRowData: PropTypes.object.isRequired,
    defaultSelectedRowKeys: PropTypes.object.isRequired,
    handleSelectedRowData: PropTypes.func.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    field: PropTypes.object,
    dataGridStoreSuccess: PropTypes.bool,
};
