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

    }

    handleSelectedRowData({selectedRowsData}) {
        this.props.handleSelectedRowData(selectedRowsData)
    }

    render() {
        let width = this.props.parsedGridView?.info?.windowSize?.width || '50vw';
        let height = this.props.parsedGridView?.info?.windowSize?.height || undefined;
        let opADD = GridViewUtils.containsOperationButton(this.props.parsedGridView?.operations, 'OP_ADD');
        //odkomentowac dla mocka
        // let opADD = {label: 'Dodaj'}
        // this.addButtonOptions = {
        //     text: opADD.label,
        //     onClick: () => {
        //         const setFields = this.props.parsedGridView?.setFields;
        //         const separatorJoin = this.props.parsedGridView?.options?.separatorJoin || ',';
        //         let selectedRowData = this.props.selectedRowData;
        //         if (!!setFields) {
        //             setFields.forEach((field) => {
        //                 let fieldKey = field.fieldList;
        //                 let values = [];
        //                 selectedRowData.forEach((row) => {
        //                     for (const item in row) {
        //                         const object = row[item]
        //                         const firstObjKey = Object.keys(object)[0];
        //                         if (firstObjKey === fieldKey) {
        //                             values.push('' + object[firstObjKey]);
        //                             break;
        //                         }
        //                     }
        //                 })
        //                 field.fieldValue = values.join(separatorJoin);
        //             })
        //             this.props.handleOnChosen(setFields);
        //         }
        //         this.props.onHide();
        //     },
        // };
        return (
            <React.Fragment>
                {/*<Popup*/}
                {/*    visible={this.props.visible}*/}
                {/*    onHiding={() => this.props.onHide()}*/}
                {/*    dragEnabled={true}*/}
                {/*    closeOnOutsideClick={true}*/}
                {/*    showCloseButton={true}*/}
                {/*    showTitle={true}*/}
                {/*    title="Lista podpowiedzi"*/}
                {/*    container=".dx-viewport"*/}
                {/*    width={width}*/}
                {/*    height={height}*/}
                {/*    resizeEnabled={true}*/}
                {/*>*/}
                {/*    /!*selectedRowData: {JSON.stringify(this.props.selectedRowData)}*!/*/}
                {/*    /!*<br/>*!/*/}
                {/*    /!*selectedRowDataSize: {this.props.selectedRowData?.length}*!/*/}
                {/*    <GridViewComponent*/}
                {/*        id={this.props.id}*/}
                {/*        elementSubViewId={null}*/}
                {/*        handleOnInitialized={(ref) => this.dataGrid = ref}*/}
                {/*        parsedGridView={this.props.parsedGridView}*/}
                {/*        parsedGridViewData={this.props.parsedGridViewData}*/}
                {/*        gridViewColumns={this.props.gridViewColumns}*/}
                {/*        packageRows={this.props.parsedGridView?.info?.dataPackageSize}*/}
                {/*        handleBlockUi={() => {*/}
                {/*            this.props.handleBlockUi()*/}
                {/*        }}*/}
                {/*        handleUnblockUi={() => {*/}
                {/*            this.props.handleUnblockUi()*/}
                {/*        }}*/}
                {/*        showSelection={true}*/}
                {/*        defaultSelectedRowKeys={this.props.defaultSelectedRowKeys}*/}
                {/*        handleSelectedRowKeys={(e) => this.handleSelectedRowData(e)}*/}
                {/*        handleSelectAll={(e) => {*/}
                {/*        }}*/}
                {/*        showFilterRow={true}*/}
                {/*        showErrorMessages={(err) => this.props.showErrorMessages(err)}*/}
                {/*        dataGridStoreSuccess={this.props.dataGridStoreSuccess}*/}
                {/*        allowSelectAll={false}*/}
                {/*    />*/}
                {/*    <ToolbarItem*/}
                {/*        widget="dxButton"*/}
                {/*        toolbar="bottom"*/}
                {/*        location="after"*/}
                {/*        options={this.addButtonOptions}*/}
                {/*    />*/}
                {/*</Popup>*/}
                <Dialog header="Lista podpowiedzi"
                        footer={opADD ?
                            <Button
                                type="button"
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
                                                    const object = row[item]
                                                    const firstObjKey = Object.keys(object)[0];
                                                    if (firstObjKey === fieldKey) {
                                                        values.push('' + object[firstObjKey]);
                                                        break;
                                                    }
                                                }
                                            })
                                            field.fieldValue = values.join(separatorJoin);
                                        })
                                        this.props.handleOnChosen(setFields);
                                    }
                                    this.props.onHide();
                                }}
                                label={opADD?.label}/> : null
                        }
                        visible={this.props.visible}
                        resizable={false}
                        breakpoints={{'960px': '75vw', '640px': '100vw'}}
                        style={{width: width, height: height, minWidth: width, minHeight: height}}
                        onHide={() => this.props.onHide()}
                >
                    {/*selectedRowData: {JSON.stringify(this.props.selectedRowData)}*/}
                    {/*<br/>*/}
                    {/*selectedRowDataSize: {this.props.selectedRowData?.length}*/}
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
                        defaultSelectedRowKeys={this.props.defaultSelectedRowKeys}
                        handleSelectedRowKeys={(e) => this.handleSelectedRowData(e)}
                        handleSelectAll={(e) => {
                        }}
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
    dataGridStoreSuccess: PropTypes.bool,
    selectedRowData: PropTypes.object.isRequired,
    defaultSelectedRowKeys: PropTypes.object.isRequired,
    handleSelectedRowData: PropTypes.func.isRequired,
};

