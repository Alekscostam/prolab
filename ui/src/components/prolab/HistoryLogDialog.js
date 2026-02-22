import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';
import GridViewComponent from '../../containers/dataGrid/GridViewComponent';
import {Toast} from 'primereact/toast';
import {useRef, useCallback} from 'react';

const HistoryLogDialog = ({
    id,
    visible,
    onHide,
    parsedHistoryLogView,
    parsedHistoryLogViewData,
    handleBlockUi,
    handleUnblockUi,
    showErrorMessages,
    dataHistoryLogStoreSuccess,
}) => {
    const refDataGrid = useRef(null);
    const toastRef = useRef(null);

    const handleHide = useCallback(() => {
        onHide();
    }, [onHide]);

    const convertedParsedView = {...parsedHistoryLogView};
    if (parsedHistoryLogView?.viewOptions) {
        convertedParsedView.gridOptions = parsedHistoryLogView.viewOptions;
        delete convertedParsedView.viewOptions;
    }

    const width = parsedHistoryLogView?.info?.windowSize?.width || '50vw';
    const height = parsedHistoryLogView?.info?.windowSize?.height || undefined;

    return (
        <div>
            <Toast id='toast-messages' position='top-center' ref={toastRef} />
            <Dialog
                closable={true}
                id='HistoryLogListDialog'
                header={parsedHistoryLogView?.info?.title}
                footer={() => {
                    return <div></div>;
                }}
                visible={visible === true}
                resizable={false}
                breakpoints={{'960px': '75vw', '640px': '100vw'}}
                style={{
                    width: width,
                    height: height,
                    minWidth: width,
                    minHeight: height,
                }}
                onHide={handleHide}
            >
                <GridViewComponent
                    className='history-dialog'
                    altAndLeftClickEnabled={false}
                    id={id}
                    showRenderingViewMode={false}
                    elementSubViewId={null}
                    handleOnDataGrid={(ref) => (refDataGrid.current = ref)}
                    parsedGridView={convertedParsedView}
                    parsedGridViewData={parsedHistoryLogViewData}
                    gridViewColumns={parsedHistoryLogView?.viewColumns}
                    packageRows={parsedHistoryLogView?.info?.dataPackageSize}
                    hoverStateEnabled={true}
                    handleBlockUi={handleBlockUi}
                    getRef={() => refDataGrid.current}
                    handleUnblockUi={handleUnblockUi}
                    showSelection={true}
                    showFilterRow={true}
                    showErrorMessages={showErrorMessages}
                    dataGridStoreSuccess={dataHistoryLogStoreSuccess}
                    allowSelectAll={false}
                />
            </Dialog>
        </div>
    );
};

HistoryLogDialog.defaultProps = {
    visible: true,
    dataHistoryLogStoreSuccess: true,
};

HistoryLogDialog.propTypes = {
    id: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    parsedHistoryLogView: PropTypes.object.isRequired,
    parsedHistoryLogViewData: PropTypes.object.isRequired,
    handleBlockUi: PropTypes.func.isRequired,
    handleUnblockUi: PropTypes.func.isRequired,
    showErrorMessages: PropTypes.func.isRequired,
    dataHistoryLogStoreSuccess: PropTypes.bool,
};

export default HistoryLogDialog;
