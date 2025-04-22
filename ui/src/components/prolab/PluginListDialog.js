import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';
import GridViewComponent from '../../containers/dataGrid/GridViewComponent';
import {Button} from 'primereact/button';
import LocUtils from '../../utils/LocUtils';
import {Toast} from 'primereact/toast';

const PluginListDialog = (props) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isGridInitialized, setIsGridInitialized] = useState(false);
    const [canViewSelect, setCanViewSelect] = useState(false);
    const refDataGrid = useRef(null);
    const messages = useRef(null);

    useEffect(() => {
        return () => {
            setSelectedRowKeys([]);
        };
    }, []);

    const handleSelectedRowData = (selectedRowData) => {
        if (selectedRowData) {
            setSelectedRowKeys(selectedRowData.selectedRowKeys);
        }
    };

    const onHide = () => {
        setSelectedRowKeys([]);
        props.onHide();
    };

    const unselectAllDataGrid = () => {
        setSelectedRowKeys([]);
    };

    const onConfirm = () => {
        const idRowKeys = props.selectedRowKeys.map((el) => el.ID);
        const idCurrentRowKeys = selectedRowKeys;
        const requestBody = {
            listId: idRowKeys,
            returnId: idCurrentRowKeys,
        };
        const refreshAll = props.parsedPluginView?.viewOptions?.refreshAll;
        props.executePlugin(props.pluginId, requestBody, refreshAll);
        onHide();
    };

    const width = props.parsedPluginView?.info?.windowSize?.width ?? '50vw';
    const height = props.parsedPluginView?.info?.windowSize?.height || undefined;

    let convertedParsedView = {...props.parsedPluginView};
    if (props.parsedPluginView?.viewOptions) {
        let gridOptions = props.parsedPluginView.viewOptions;
        delete convertedParsedView.viewOptions;
        convertedParsedView.gridOptions = gridOptions;
    }

    return (
        <React.Fragment>
            <Toast id='toast-messages' position='top-center' ref={messages} />
            <Dialog
                id='pluginListDialog'
                header={props.parsedPluginView?.info?.title}
                footer={
                    <React.Fragment>
                        {props.isPluginFirstStep && canViewSelect ? (
                            <div>
                                <Button
                                    type='button'
                                    onClick={onConfirm}
                                    label={LocUtils.locFromStoreWithDefault('Confirm', 'Zatwierdź')}
                                />
                            </div>
                        ) : (
                            <Button
                                type='button'
                                onClick={onHide}
                                label={LocUtils.locFromStoreWithDefault('Close', 'Zamknij')}
                            />
                        )}
                    </React.Fragment>
                }
                visible={props.visible}
                resizable={false}
                breakpoints={{'960px': '75vw', '640px': '100vw'}}
                style={{width: width, height: height, minWidth: width, minHeight: height}}
                onHide={onHide}
            >
                <GridViewComponent
                    altAndLeftClickEnabled={true}
                    id={props.id}
                    showRenderingViewMode={false}
                    elementSubViewId={null}
                    handleOnDataGrid={(ref) => (refDataGrid.current = ref)}
                    parsedGridView={convertedParsedView}
                    hoverStateEnabled={true}
                    parsedGridViewData={props.parsedPluginViewData}
                    gridViewColumns={props.parsedPluginView?.viewColumns}
                    packageRows={props.parsedPluginView?.info?.dataPackageSize}
                    handleBlockUi={props.handleBlockUi}
                    getRef={() => refDataGrid.current}
                    handleUnblockUi={props.handleUnblockUi}
                    onContentReady={(ref) => {
                        if (!isGridInitialized) {
                            const visibleRows = ref.component.getVisibleRows();
                            setCanViewSelect(visibleRows.length !== 0);
                            setIsGridInitialized(true);
                        }
                    }}
                    showSelection={true}
                    selectedRowKeys={selectedRowKeys}
                    handleUnselectAll={() => {
                        unselectAllDataGrid();
                        if (props?.unselectAllDataGrid) {
                            props.unselectAllDataGrid();
                        }
                    }}
                    handleSelectedRowKeys={handleSelectedRowData}
                    showFilterRow={true}
                    showErrorMessages={(err) => props.showErrorMessages(err)}
                    dataGridStoreSuccess={props.dataPluginStoreSuccess}
                    allowSelectAll={false}
                />
            </Dialog>
        </React.Fragment>
    );
};

PluginListDialog.propTypes = {
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
    isPluginFirstStep: PropTypes.bool.isRequired,
    executePlugin: PropTypes.func.isRequired,
    pluginId: PropTypes.number.isRequired,
    selectedRowKeys: PropTypes.array.isRequired,
    unselectAllDataGrid: PropTypes.func,
};

PluginListDialog.defaultProps = {
    visible: true,
    dataPluginStoreSuccess: true,
    isPluginFirstStep: false,
};

export default PluginListDialog;
