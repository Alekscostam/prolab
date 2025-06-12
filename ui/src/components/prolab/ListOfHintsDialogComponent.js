import React from 'react';
import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';
import GridViewComponent from '../../containers/dataGrid/GridViewComponent';
import {Button} from 'primereact/button';
import LocUtils from '../../utils/LocUtils';
import {OperationType} from '../../enum/OperationType';
import {TranslationUtils} from '../../utils/TranslationUtils';
import EditListUtils from '../../utils/EditListUtils';
import EditListDataStore from '../../containers/dao/DataEditListStore';

export default class ListOfHintsDialogComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isGridInitialized: false,
            canViewSelect: false,
            parsedGridViewData: undefined,
            selectedRowData: props.selectedRowData || [],
            dataGridStoreSuccess: undefined,
            editListRecordId: undefined,
            editListVisible: undefined,
            defaultSelectedRowKeys: this.props.defaultSelectedRowKeys,
        };
        this.refDataGrid = {};
        this.editListDataStore = new EditListDataStore();
    }

    componentDidMount() {
        if (typeof this.props?.blockUiIfNeccessery === 'function') {
            this.props.blockUiIfNeccessery();
        }
        this.fetchEditListData();
    }
    componentDidUpdate() {
        if (typeof this.props?.blockUiIfNeccessery === 'function') {
            this.props.blockUiIfNeccessery();
        }
    }

    handleSelectedRowData(e) {
        const setFields = this.props.parsedGridView.setFields;
        const prevSelectedRowData = this.state.selectedRowData;
        const multiSelect = this.props?.parsedGridView?.gridOptions?.multiSelect;
        const result = EditListUtils.selectedRowData(e, setFields, prevSelectedRowData, multiSelect);
        this.setState({selectedRowData: result.rowsData, defaultSelectedRowKeys: result.rowsCrc});
    }

    fetchAllEditListData = () => {
        const {viewId, parentId, field, recordId} = this.props;
        this.editListDataStore.getAllEditListDataStore(
            viewId,
            'gridView',
            parentId,
            null,
            recordId,
            null,
            field.id,
            null,
            () => {}
        );
    };
    fetchEditListData = () => {
        const {viewId, parentId, field, editListBody, recordId, parsedGridView, selectedRowData} = this.props;
        try {
            const res = this.editListDataStore.getEditListDataStore(
                viewId,
                'gridView',
                recordId,
                field?.id,
                parentId,
                null,
                null,
                editListBody,
                parsedGridView.setFields,
                (err) => {
                    this.props.showErrorMessages(err);
                },
                () => {
                    this.setState({
                        dataGridStoreSuccess: true,
                    });
                },
                () => {
                    return {selectAll: this.state.selectAll};
                },
                selectedRowData
            );
            this.setState(
                {
                    parsedGridViewData: res,
                    editListRecordId: recordId,
                },
                () => {
                    this.setState({
                        editListVisible: true,
                    });
                }
            );
        } finally {
            if (this.props.handleUnblockUi) {
                this.props.handleUnblockUi();
            }
        }
    };

    render() {
        const name = this.props.parsedGridView?.info?.fieldLabel;
        const width = this.props.parsedGridView?.info?.windowSize?.width || '50vw';
        const height = this.props.parsedGridView?.info?.windowSize?.height || '150vw';
        const opSelect = TranslationUtils.getOpButton(this.props.parsedGridView?.operations, OperationType.OP_SELECT);
        return (
            <React.Fragment>
                <Dialog
                    id='editListDialog'
                    header={
                        <div>
                            {LocUtils.locFromStoreWithDefault('Selection_List_Label', 'Lista podpowiedzi')} - {name}
                        </div>
                    }
                    footer={
                        <div style={{height: '40px'}}>
                            {opSelect && this.state.canViewSelect && (
                                <Button
                                    type='button'
                                    onClick={() => {
                                        const setFields = this.props.parsedGridView?.setFields || [];
                                        const separatorJoin = this.props.parsedGridView?.options?.separatorJoin || ',';
                                        let selectedRowData = this.state.selectedRowData || [];
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
                                        this.props.onHide();
                                    }}
                                    label={opSelect?.label}
                                />
                            )}
                        </div>
                    }
                    visible={this.state.editListVisible}
                    resizable={false}
                    breakpoints={{'960px': '75vw', '640px': '100vw'}}
                    style={{width: width, height: height}}
                    onHide={() => this.props.onHide()}
                >
                    <GridViewComponent
                        altAndLeftClickEnabled={true}
                        id={this.props.id}
                        elementSubViewId={null}
                        handleOnDataGrid={(ref) => (this.refDataGrid = ref)}
                        parsedGridView={this.props.parsedGridView}
                        parsedGridViewData={this.state.parsedGridViewData}
                        gridViewColumns={this.props.gridViewColumns}
                        packageRows={this.props.parsedGridView?.info?.dataPackageSize}
                        handleBlockUi={() => {
                            this.props.handleBlockUi();
                        }}
                        onContentReady={(ref) => {
                            if (!this.state.isGridInitialized) {
                                const visibleRows = ref.component.getVisibleRows();
                                const canViewSelect = visibleRows.length !== 0;
                                this.setState({
                                    canViewSelect,
                                    isGridInitialized: true,
                                });
                            }
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
                        defaultSelectedRowKeys={this.state.defaultSelectedRowKeys}
                        handleSelectAll={() => {}}
                        handleSelectedRowKeys={(e) => {
                            this.handleSelectedRowData(e);
                        }}
                        showFilterRow={true}
                        showErrorMessages={(err) => this.props.showErrorMessages(err)}
                        dataGridStoreSuccess={this.state.dataGridStoreSuccess}
                        allowSelectAll={false}
                    />
                </Dialog>
            </React.Fragment>
        );
    }
}

ListOfHintsDialogComponent.defaultProps = {
    visible: true,
    dataGridStoreSuccess: true,
};

ListOfHintsDialogComponent.defaultProps = {
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
    field: PropTypes.object,
    dataGridStoreSuccess: PropTypes.bool,
};
