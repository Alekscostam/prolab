import React from 'react';
import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';
import GridViewComponent from '../../containers/dataGrid/GridViewComponent';
import {Button} from 'primereact/button';
import {DataGridUtils} from '../../utils/component/DataGridUtils';
import LocUtils from '../../utils/LocUtils';

export default class EditListComponent extends React.Component {
    constructor(props) {
        super(props);
        this.refDataGrid = {};
    }

    handleSelectedRowData({selectedRowsData}) {
        this.props.handleSelectedRowData(selectedRowsData);
    }

    render() {
        let width = this.props.parsedGridView?.info?.windowSize?.width || '50vw';
        let height = this.props.parsedGridView?.info?.windowSize?.height || undefined;
        let opSelect = DataGridUtils.containsOperationsButton(this.props.parsedGridView?.operations, 'OP_SELECT');
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
                                    const setFields = this.props.parsedGridView?.setFields;
                                    const separatorJoin = this.props.parsedGridView?.options?.separatorJoin || ',';
                                    let selectedRowData = this.props.selectedRowData;
                                    if (!!setFields) {
                                        setFields.forEach((field) => {
                                            let fieldKey = field.fieldList;
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
                        ) : null
                    }
                    visible={this.props.visible}
                    resizable={false}
                    breakpoints={{'960px': '75vw', '640px': '100vw'}}
                    style={{width: width, height: height, minWidth: width, minHeight: height}}
                    onHide={() => this.props.onHide()}
                >
                    <GridViewComponent
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
                        handleUnblockUi={() => {
                            this.props.handleUnblockUi();
                        }}
                        showSelection={true}
                        defaultSelectedRowKeys={this.props.defaultSelectedRowKeys}
                        handleSelectedRowKeys={(e) => this.handleSelectedRowData(e)}
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
    showErrorMessages: PropTypes.func.isRequired,
    selectedRowData: PropTypes.object.isRequired,
    defaultSelectedRowKeys: PropTypes.object.isRequired,
    handleSelectedRowData: PropTypes.func.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    field: PropTypes.object,
    dataGridStoreSuccess: PropTypes.bool,
};
