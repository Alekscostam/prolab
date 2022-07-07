import React from 'react';
import PropTypes from "prop-types";
import {Dialog} from "primereact/dialog";
import GridViewComponent from "../../containers/dataGrid/GridViewComponent";
import {Button} from "primereact/button";
import LocUtils from "../../utils/LocUtils";
import { Toast } from 'primereact/toast';


export default class PluginListComponent extends React.Component {
    constructor(props) {
        super(props);
        this.refDataGrid = {};
        this.state = {
            selectedRowKeys: [],
            preventSave: false
        };
        this.onHide = this.onHide.bind(this);
        this.handleSelectedRowData = this.handleSelectedRowData.bind(this);
    }

    handleSelectedRowData(selectedRowData) {  
        this.setState({selectedRowKeys: selectedRowData.selectedRowKeys})
    }

    onHide(){
        this.setState({
            selectedRowKeys:[]
        })
        this.props.onHide();
    }

    render() {
        let width = this.props.parsedPluginView?.info?.windowSize?.width || '50vw';
        let height = this.props.parsedPluginView?.info?.windowSize?.height || undefined;
        const parsedPluginView  = this.props.parsedPluginView;
        let convertedParsedView ={...parsedPluginView}
        /** Przemapowanie viewOptions na gridOptions */
        if(parsedPluginView?.viewOptions){
            let gridOptions=  parsedPluginView.viewOptions;
            delete convertedParsedView.viewOptions
            convertedParsedView.gridOptions = gridOptions
        }
  
        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)}/>
                <Dialog id="pluginListDialog"
                        header={this.props.parsedPluginView?.info?.title}
                        footer={
                            <React.Fragment>
                                {this.props.isPluginFirstStep ? 
                                    <div>
                                        <Button
                                            type="button"
                                            onClick={() => {this.onHide();}}
                                            label={LocUtils.loc(this.props.labels, 'Cancle_plugin_grid_dialog', 'Anuluj')}/> 
                                        <Button
                                            type="button"
                                            onClick={() => {
                                            const idRowKeys =  this.props.selectedRowKeys.map(el=>el.ID);
                                            const pluginId = this.props.pluginId;
                                            const idCurrentRowKeys = this.state.selectedRowKeys;
                                            const requestBody = 
                                                    {
                                                        "listId": idRowKeys,
                                                        "returnId": idCurrentRowKeys
                                                    }
                                                    const refreshAll = this.props.parsedPluginView?.viewOptions?.refreshAll;
                                                    this.props.executePlugin(pluginId,requestBody,refreshAll); 
                                                    this.onHide();
                                            }}
                                            label={LocUtils.loc(this.props.labels, 'Confirm_plugin_grid_dialog', 'Zatwierdź')}/> 
                                    </div>
                                    : <Button
                                        type="button"
                                        onClick={() => { this.onHide();}}
                                        label={LocUtils.loc(this.props.labels, 'Close_plugin_grid_dialog', 'Zamknij okno')}/>}

                    </React.Fragment> }
                        visible={this.props.visible}
                        resizable={false}
                        breakpoints={{'960px': '75vw', '640px': '100vw'}}
                        style={{width: width, height: height, minWidth: width, minHeight: height}}
                        onHide={() => this.onHide()}>
              
                    <GridViewComponent
                        id={this.props.id}
                        showRenderingViewMode={false}
                        elementSubViewId={null}
                        handleOnDataGrid={(ref) => this.refDataGrid = ref}
                        parsedGridView={convertedParsedView}
                        parsedGridViewData={this.props.parsedPluginViewData}
                        gridViewColumns={this.props.parsedPluginView?.viewColumns}
                        packageRows={this.props.parsedPluginView?.info?.dataPackageSize}
                        handleBlockUi={() => {
                            this.props.handleBlockUi()
                        }}
                        handleUnblockUi={() => {
                            this.props.handleUnblockUi()
                        }}
                        showSelection={true}
                        selectedRowKeys={this.state.selectedRowKeys}
                        handleSelectedRowKeys={(e) => {this.handleSelectedRowData(e)}}
                        showFilterRow={true}
                        showErrorMessages={(err) => this.props.showErrorMessages(err)}
                        dataGridStoreSuccess={this.props.dataPluginStoreSuccess}
                        allowSelectAll={false}
                    />
                </Dialog>
            </React.Fragment>
        );
    }
}

PluginListComponent.defaultProps = {
    visible: true,
    dataPluginStoreSuccess: true
};

PluginListComponent.defaultProps = {
    id: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    parsedPluginView: PropTypes.object.isRequired,
    parsedPluginViewData: PropTypes.object.isRequired,
    handleBlockUi: PropTypes.func.isRequired,
    handleUnblockUi: PropTypes.func.isRequired,
    showErrorMessages: PropTypes.func.isRequired,
    dataPluginStoreSuccess: PropTypes.bool,
    selectedRowData: PropTypes.object.isRequired,
    handleSelectedRowData: PropTypes.func.isRequired,
    labels: PropTypes.object.isRequired,
};

