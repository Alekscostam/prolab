import React from 'react';
import PropTypes from "prop-types";
import {Dialog} from "primereact/dialog";
import GridViewComponent from "../../containers/dataGrid/GridViewComponent";
import {Button} from "primereact/button";
import {GridViewUtils} from "../../utils/GridViewUtils";

export default class EditListComponent extends React.Component {

    constructor(props) {
        super(props);
        this.dataGrid = {};
        this.state = {
            selectedRowKeys: [],
            selectedRowsData: []
        };
    }

    onSelectionChanged = ({selectedRowsData}) => {
        const data = selectedRowsData;
        this.setState({selectedRowsData: data})
    }

    render() {
        let width = this.props.parsedGridView?.info?.windowSize?.width || '50vw';
        let height = this.props.parsedGridView?.info?.windowSize?.height || undefined;
        let opADD = GridViewUtils.containsOperationButton(this.props.parsedGridView?.operations, 'OP_ADD');
        return (
            <React.Fragment>
                <Dialog header="Lista podpowiedzi"
                        footer={opADD ?
                            <Button
                                type="button"
                                onClick={() => {
                                    const fields = this.props.parsedGridView?.setFields;
                                    const separatorJoin = this.props.parsedGridView?.options?.separatorJoin || ',';
                                    let selectedRows = this.state.selectedRowsData;
                                    if (!!fields) {
                                        fields.forEach((field) => {
                                            let fieldList = field.fieldList;
                                            let values = [];
                                            if (!!selectedRows) {
                                                selectedRows.forEach((row) => {
                                                    values.push(row[fieldList]);
                                                })
                                            }
                                            field.fieldValue = values.join(separatorJoin);
                                        })
                                        this.props.handleOnChosen(fields);
                                    }
                                    this.props.onHide();
                                }}
                                label={opADD?.label}
                                disabled={this.state.selectedRowsData?.length === 0}/> : null
                        }
                        visible={this.props.visible}
                        breakpoints={{'960px': '75vw', '640px': '100vw'}}
                        style={{width: width, height: height}}
                        onHide={() => this.props.onHide()}
                >
                    <GridViewComponent
                        id={this.props.id}
                        elementSubViewId={null}
                        handleOnInitialized={(ref) => this.dataGrid = ref}
                        parsedGridView={this.props.parsedGridView}
                        parsedGridViewData={this.props.parsedGridViewData}
                        gridViewColumns={this.props.gridViewColumns}
                        packageRows={this.props.parsedGridView?.info?.dataPackageSize}
                        handleBlockUi={() => {
                            this.props.handleBlockUi()
                        }}
                        handleUnblockUi={() => {
                            this.props.handleUnblockUi()
                        }}
                        showSelection={true}
                        selectedRowKeys={this.state.selectedRowKeys}
                        handleSelectedRowKeys={this.onSelectionChanged}
                        handleSelectAll={(e) => {
                        }}
                        showFilterRow={true}
                        showErrorMessages={(err) => this.props.showErrorMessages(err)}
                        dataGridStoreSuccess={this.props.dataGridStoreSuccess}
                    />
                </Dialog>
            </React.Fragment>
        );
    }
}

EditListComponent.defaultProps = {
    visible: true,
    dataGridStoreSuccess: true
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
    dataGridStoreSuccess: PropTypes.bool
};

