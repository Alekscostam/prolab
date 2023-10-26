import React from 'react';
import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';
import GridViewComponent from '../../containers/dataGrid/GridViewComponent';
import {Button} from 'primereact/button';
import LocUtils from '../../utils/LocUtils';
import {Toast} from 'primereact/toast';

export default class HistoryLogListComponent extends React.Component {
    constructor(props) {
        super(props);
        this.refDataGrid = {};
        this.state = {
            selectedRowKeys: [],
            preventSave: false,
        };
        this.onHide = this.onHide.bind(this);
        this.handleSelectedRowData = this.handleSelectedRowData.bind(this);
    }

    handleSelectedRowData(selectedRowData) {
        this.setState({selectedRowKeys: selectedRowData.selectedRowKeys});
    }

    onHide() {
        this.setState({
            selectedRowKeys: [],
        });
        this.props.onHide();
    }

    render() {
        const parsedHistoryLogView = this.props.parsedHistoryLogView;

        const width = parsedHistoryLogView?.info?.windowSize?.width || '50vw';
        const height = parsedHistoryLogView?.info?.windowSize?.height || undefined;

        let convertedParsedView = {...parsedHistoryLogView};
        /** Przemapowanie viewOptions na gridOptions */
        if (parsedHistoryLogView?.viewOptions) {
            let gridOptions = parsedHistoryLogView.viewOptions;
            delete convertedParsedView.viewOptions;
            convertedParsedView.gridOptions = gridOptions;
        }
        const isVisible = this.props.visible === true;
        return (
            <div>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />
                <Dialog
                    id='HistoryLogListDialog'
                    header={this.props.parsedHistoryLogView?.info?.title}
                    footer={
                        <React.Fragment>
                            <Button
                                type='button'
                                onClick={() => {
                                    this.onHide();
                                }}
                                label={LocUtils.loc(this.props.labels, 'Close_dialog', 'Zamknij okno')}
                            />
                        </React.Fragment>
                    }
                    visible={isVisible}
                    resizable={false}
                    breakpoints={{'960px': '75vw', '640px': '100vw'}}
                    style={{width: width, height: height, minWidth: width, minHeight: height}}
                    onHide={() => this.onHide()}
                >
                    <GridViewComponent
                        id={this.props.id}
                        showRenderingViewMode={false}
                        elementSubViewId={null}
                        handleOnDataGrid={(ref) => (this.refDataGrid = ref)}
                        parsedGridView={convertedParsedView}
                        parsedGridViewData={this.props.parsedHistoryLogViewData}
                        gridViewColumns={this.props.parsedHistoryLogView?.viewColumns}
                        packageRows={this.props.parsedHistoryLogView?.info?.dataPackageSize}
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
                        selectedRowKeys={this.state.selectedRowKeys}
                        handleUnselectAll={() => {
                            if (this.unselectAllDataGrid) {
                                this.unselectAllDataGrid();
                                return;
                            }
                            if (this.props?.unselectAllDataGrid) {
                                this.props.unselectAllDataGrid();
                                return;
                            }
                        }}
                        handleSelectedRowKeys={(e) => {
                            this.handleSelectedRowData(e);
                        }}
                        showFilterRow={true}
                        showErrorMessages={(err) => this.props.showErrorMessages(err)}
                        dataGridStoreSuccess={this.props.dataHistoryLogStoreSuccess}
                        allowSelectAll={false}
                    />
                </Dialog>
            </div>
        );
    }
}

HistoryLogListComponent.defaultProps = {
    visible: true,
    dataPluginStoreSuccess: true,
};

HistoryLogListComponent.defaultProps = {
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
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
};
