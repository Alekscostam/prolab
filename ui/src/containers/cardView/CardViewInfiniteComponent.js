import React, {PureComponent} from 'react';
import {DataGridUtils} from '../../utils/component/DataGridUtils';
import {Breadcrumb} from '../../utils/BreadcrumbUtils';
import {CardViewUtils} from '../../utils/CardViewUtils';
import AppPrefixUtils from '../../utils/AppPrefixUtils';
import PropTypes from 'prop-types';
import CrudService from '../../services/CrudService';
import ConsoleHelper from '../../utils/ConsoleHelper';
import CardInfiniteLoaderWrapper from './CardInfiniteLoaderWrapper';
import WindowSizeListener from 'react-window-size-listener';
import DataCardStore from '../dao/DataCardStore';
import OperationsButtons from '../../components/prolab/OperationsButtons';
import {EditSpecUtils} from '../../utils/EditSpecUtils';
import {compress} from 'int-compress-string';
import {TreeListUtils} from '../../utils/component/TreeListUtils';
import {StringUtils} from '../../utils/StringUtils';
import ImageViewerDialog from '../../components/ImageViewerDialog';
import {MenuWithButtons} from '../../components/prolab/MenuWithButtons';
import {SelectedRowKeysUtils} from '../../utils/SelectedRowKeysUtils';
import {SessionStoreUtils} from '../../utils/SessionStoreUtils';
import UrlUtils from '../../utils/UrlUtils';
import {handleEdit} from '../../utils/handler/EditHandler';

class CardViewInfiniteComponent extends PureComponent {
    constructor(props) {
        super(props);
        this.cachedRequest = undefined;
        this.lastFetchDate = new Date();
        this.crudService = new CrudService();
        this.clickedPosition = React.createRef();
        this.menuRef = React.createRef();
        this.selectedRecordIdRef = React.createRef();
        this.selectedRowDataRef = React.createRef();
        this.dataCardStore = new DataCardStore();
        this.state = {
            imageViewer: {
                imageViewDialogVisible: false,
                imageBase64: undefined,
                header: undefined,
            },
            endLoadedData: false,
            hasNextPage: true,
            isNextPageLoading: false,
            items: [],
            cardSkip: 0,
            cardScrollLoading: false,
            columnCount: 1,
        };
        this.cardViewRef = React.createRef();
        ConsoleHelper('CardViewComponent -> constructor');
    }
    componentDidMount() {}
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.collapsed !== prevProps.collapsed) {
            const windowSizeWidth = window.innerWidth;
            const cardWidth = this.props.parsedCardView?.cardOptions?.width ?? 300;
            this.setState({columnCount: this.calculateColumns(windowSizeWidth, cardWidth)});
        }
    }
    selectRowKeys = (currentSelectedRowKeys, recordId, callback) => {
        const selectedRowKeys = SelectedRowKeysUtils.mergeKeysWithRecordId(recordId, currentSelectedRowKeys, false);
        this.props.handleSelectedRowKeys(selectedRowKeys, () => {
            if (callback) {
                callback();
            }
        });
    };
    isSelectionEnabled() {
        return !!this.props.handleSelectedRowKeys && !!this.props.selectedRowKeys;
    }

    isDashboard() {
        return this.props.mode === 'dashboard';
    }
    styleTile(rowData, cardBgColor1, cardBgColor2, fontColor, width, height) {
        let styleTile;
        if (this.isDashboard()) {
            styleTile = {
                backgroundImage: `linear-gradient(to bottom right, ${cardBgColor1}, ${cardBgColor2})`,
                color: fontColor,
                width: width,
                height: height,
            };
        } else {
            styleTile = {backgroundColor: rowData._BGCOLOR, color: rowData._FONT_COLOR, width: width, height: height};
        }
        return styleTile;
    }
    refresh() {
        this.setState(
            {
                hasNextPage: true,
                isNextPageLoading: false,
                items: [],
                cardSkip: 0,
                cardScrollLoading: false,
            },
            () => {
                if (this.canLoadNextPage()) {
                    this._loadNextPage(0);
                }
            }
        );
    }
    canLoadNextPage() {
        return (this.props?.elementSubViewId && !this.state.isNextPageLoading) || this.state.items.length < 5;
    }

    canFetchData(currentRequest) {
        let result = true;
        if (JSON.stringify(currentRequest) === JSON.stringify(this.cachedRequest || {})) {
            const now = new Date();
            const diffInMs = now - this.lastFetchDate;
            if (diffInMs < 1000) {
                result = false;
            }
        }
        this.cachedRequest = currentRequest;
        return result;
    }

    createRequestToCache(skip, packageCount) {
        const obj = {
            id: this.props.id,
            pagination: {
                skip: skip,
                take: packageCount,
            },
            parentId: this.props.parentId,
            filterId: this.props.filterId,
            kindView: this.props.kindView,
            parentViewId: this.props?.parentViewId,
            parentKindViewSpec: this.props?.parentKindViewSpec,
        };
        return obj;
    }

    _loadNextPage = (...args) => {
        const dataPackageSize = 30;
        const packageCount = !!dataPackageSize || dataPackageSize === 0 ? 30 : dataPackageSize;
        if (!this.state.isNextPageLoading) {
            this.props.handleBlockUi();
            this.setState(
                {
                    isNextPageLoading: true,
                    cardScrollLoading: true,
                    cardSkip: this.state.cardSkip + packageCount,
                },
                () => {
                    const columnCount = this.state.columnCount;
                    let skip = args[0] * columnCount;
                    if ((args[0] * columnCount) % packageCount !== 0) {
                        let divide = args[0] * columnCount;
                        skip = Math.ceil(divide / packageCount) * dataPackageSize;
                    }
                    const currentCached = this.createRequestToCache(skip, packageCount);
                    const canFetchData = this.canFetchData(currentCached);
                    this.lastFetchDate = new Date();
                    if (canFetchData) {
                        this.dataCardStore
                            .getDataForCard(
                                this.props.id,
                                {
                                    skip: skip,
                                    take: packageCount,
                                },
                                this.props.parentId,
                                this.props.filterId,
                                this.props.kindView,
                                this.props?.parentViewId,
                                this.props?.parentKindViewSpec
                            )
                            .then((res) => {
                                let parsedCardViewData = [];
                                let items = this.state.items;
                                res.data.forEach((item) => {
                                    for (let key in item) {
                                        let upper = key.toUpperCase();
                                        if (upper !== key) {
                                            item[upper] = item[key];
                                            delete item[key];
                                        }
                                    }
                                    for (let i = 0; i < items.length; i++) {
                                        if (items[i].ID === item.ID) {
                                            items.splice(i, 1);
                                            i--;
                                        }
                                    }
                                    parsedCardViewData.push(item);
                                });
                                items = items.concat(parsedCardViewData);
                                this.setState(
                                    (state) => ({
                                        hasNextPage: state.items.length < res.totalCount,
                                        isNextPageLoading: false,
                                        items: items,
                                        totalCount: res.totalCount,
                                    }),
                                    () => {
                                        this.setState(
                                            {
                                                endLoadedData: true,
                                            },
                                            () => {
                                                setTimeout(() => {
                                                    this.setState({
                                                        endLoadedData: false,
                                                    });
                                                }, 3000);
                                            }
                                        );

                                        this.props.handleTotalCounts(res.totalCount);
                                        this.props.handleUnblockUi();
                                    }
                                );
                            });
                    }
                }
            );
        }
    };
    chunkData = (array, size = 1) => {
        size = Math.max(parseInt(size), 0);
        const length = array == null ? 0 : array.length;
        if (!length || size < 1) {
            return [];
        }
        let index = 0;
        let resIndex = 0;
        const result = new Array(Math.ceil(length / size));

        while (index < length) {
            result[resIndex++] = array.slice(index, (index += size));
        }
        return result;
    };
    calculateColumns(windowWidth) {
        const cardWidth = this.props.parsedCardView?.cardOptions?.width ?? 300;
        return Math.floor(
            (windowWidth - (windowWidth <= 768 ? 0 : this.props.collapsed ? 70 : 320)) / (cardWidth + 10)
        );
    }
    onHideImageViewer = () => {
        this.setState({
            imageViewer: {
                imageViewDialogVisible: false,
                imageBase64: '',
            },
        });
    };

    handleEdit = (rowData) => {
        const elementId = this.props.id;
        const recordId = rowData.ID;
        const elementSubViewId = this.props.elementSubViewId;
        const subviewId = elementSubViewId ? elementId : undefined;
        const elementKindView = this.props.elementKindView;
        const viewId = DataGridUtils.getRealViewId(elementSubViewId, elementId);
        const result = this.props.handleBlockUi();
        if (result) {
            handleEdit(
                this.crudService,
                viewId,
                recordId,
                subviewId,
                elementKindView,
                (editDataResponse) => {
                    this.setState(
                        {
                            editData: editDataResponse,
                        },
                        () => {
                            SessionStoreUtils.saveClickedRowFromView(recordId);
                            this.props.handleShowEditPanel(editDataResponse);
                        }
                    );
                },
                () => this.props.handleUnblockUi(),
                (err) => this.props.showErrorMessages(err)
            );
        }
    };

    handleEditSpec = (rowData) => {
        const elementSubViewId = this.props.elementSubViewId;
        const elementId = this.props.id;
        const parentId = this.props?.elementRecordId;
        const viewId = DataGridUtils.getRealViewId(elementSubViewId, elementId);
        const recordId = rowData.ID;
        TreeListUtils.openEditSpec(
            viewId,
            TreeListUtils.isKindViewSpec(this.props.parsedGridView) ? parentId : recordId,
            TreeListUtils.isKindViewSpec(this.props.parsedGridView) ? [recordId] : [],
            () => this.props.handleUnblockUi(),
            (err) => this.props.showErrorMessages(err)
        );
    };
    handleHrefSubview = (rowData) => {
        const newUrl = this.hrefSubview(rowData);
        window.location.assign(newUrl);
    };

    hrefSubview = (rowData) => {
        const elementSubViewId = this.props.elementSubViewId;
        const elementId = this.props.id;
        const viewId = DataGridUtils.getRealViewId(elementSubViewId, elementId);
        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
        const recordId = rowData.ID;
        const parentId = StringUtils.isBlank(this.props.elementRecordId) ? 0 : this.props.elementRecordId;
        return AppPrefixUtils.locationHrefUrl(
            `/#/grid-view/${viewId}${!!recordId ? `?recordId=${recordId}` : ``}&parentId=${parentId}${
                !!currentBreadcrumb ? currentBreadcrumb : ``
            }`
        );
    };

    hrefSpecView = (rowData) => {
        const parentId = this.props?.elementRecordId;
        const elementSubViewId = this.props.elementSubViewId;
        const elementId = this.props.id;
        const viewId = DataGridUtils.getRealViewId(elementSubViewId, elementId);
        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
        const recordId = rowData.ID;
        return EditSpecUtils.editSpecUrl(
            viewId,
            TreeListUtils.isKindViewSpec(this.props.parsedGridView) ? parentId : recordId,
            compress(TreeListUtils.isKindViewSpec(this.props.parsedGridView) ? [recordId] : []),
            currentBreadcrumb
        );
    };
    render() {
        const cardHeight = this.props.parsedCardView?.cardOptions?.height ?? 200;
        const imageViewer = this.state.imageViewer;
        const isItemLoaded = (index) => !this.state.hasNextPage || index < this.state.items.length;
        const Item = ({index, style}) => {
            let rowData = this.state.items;
            rowData = this.chunkData(rowData, this.state.columnCount);
            rowData = rowData[index];
            if (!isItemLoaded(index)) {
                return <div id={'row'} className={'tiles'} style={style} />;
            } else {
                return (
                    <React.Fragment>
                        {!!rowData ? (
                            <div id={'row'} className={'tiles'} style={style}>
                                {React.Children.toArray(
                                    Array.from(rowData).map((data) => this.renderSingleTile(data, index))
                                )}
                            </div>
                        ) : null}
                    </React.Fragment>
                );
            }
        };
        return (
            <React.Fragment>
                <WindowSizeListener
                    onResize={(windowSize) => {
                        this.setState({columnCount: this.calculateColumns(windowSize.windowWidth)});
                    }}
                >
                    <CardInfiniteLoaderWrapper
                        viewHeight={this.props.viewHeight}
                        hasNextPage={this.state.hasNextPage}
                        isNextPageLoading={this.state.isNextPageLoading}
                        items={this.state.items}
                        loadNextPage={this._loadNextPage}
                        item={Item}
                        columnCount={this.state.columnCount}
                        cardHeight={cardHeight}
                    />
                </WindowSizeListener>
                {this.props.parsedCardView?.operationsPPM && this.props.parsedCardView.operationsPPM.length !== 0 && (
                    <MenuWithButtons
                        target='div.dx-item.dx-tile'
                        menuRef={this.menuRef}
                        gridView={this.props.parsedCardView}
                        handleEdit={(e) => {
                            this.preOperationAction(e, () => this.handleEdit(this.selectedRowDataRef.current));
                        }}
                        handleEditSpec={(e) => {
                            this.preOperationAction(e, () => this.handleEditSpec(this.selectedRowDataRef.current));
                        }}
                        handlePlugins={(e) => this.preOperationAction(e, () => this.props.handlePluginRow(e.id))}
                        handleDocuments={(e) => {
                            this.preOperationAction(e, () => this.props.handleDocumentRow(e.id));
                        }}
                        handleAdd={() => this.props.addButtonFunction()}
                        handleAddSpec={() => this.props.addButtonFunction()}
                        handleHrefSubview={() => {
                            this.handleHrefSubview(this.selectedRowDataRef.current);
                        }}
                        handleCopy={(e) => {
                            this.preOperationAction(e, () => this.props.handleCopyRow());
                        }}
                        handleArchive={(e) => this.preOperationAction(e, () => this.props.handleArchiveRow())}
                        handleDownload={(e) => this.preOperationAction(e, () => this.props.handleDownloadRow())}
                        handleAttachments={(e) => this.preOperationAction(e, () => this.props.handleAttachmentRow())}
                        handleDelete={(e) => this.preOperationAction(e, () => this.props.handleDeleteRow())}
                        handleFormula={(e) => this.preOperationAction(e, () => this.props.handleFormulaRow())}
                        handleHistory={(e) => this.preOperationAction(e, () => this.props.handleHistoryLogRow())}
                        handleRestore={(e) => this.preOperationAction(e, () => this.props.handleRestoreRow())}
                        handlePublish={(e) => this.preOperationAction(e, () => this.props.handlePublishRow())}
                        operationList={this.props.parsedCardView.operationsPPM}
                    />
                )}
                {imageViewer.imageViewDialogVisible && (
                    <ImageViewerDialog
                        editable={false}
                        header={imageViewer.header}
                        onHide={() => {
                            this.onHideImageViewer();
                        }}
                        base64={
                            StringUtils.isBlank(imageViewer.imageBase64)
                                ? ''
                                : imageViewer.imageBase64.replace('data:image/jpeg;base64,', '')
                        }
                        viewBase64={imageViewer.imageBase64}
                        visible
                    />
                )}
            </React.Fragment>
        );
    }
    preOperationAction = (operation, callback, recordId = this.selectedRecordIdRef.current) => {
        if (this.isSelectionEnabled()) {
            const onlyOneRecord = operation?.onlyOneRecord;
            if (onlyOneRecord) {
                this.selectRowKeys([], recordId, () => callback());
                return;
            }
        }
        callback();
    };

    canHighlightBackground(rowData) {
        const clickedRowFromView = SessionStoreUtils.getClickedRowFromView();
        if (clickedRowFromView) {
            if (clickedRowFromView?.view?.id !== UrlUtils.getIdFromUrl()) {
                SessionStoreUtils.clearClickedRowFromView();
            }
            const id = rowData?.ID?.toString();
            if (
                clickedRowFromView?.row?.id?.toString() === id &&
                !this.props.editHeaderIsVisible &&
                this.state.endLoadedData
            ) {
                setTimeout(() => {
                    SessionStoreUtils.clearClickedRowFromView();
                }, 3000);
                return 'highlight-row';
            }
        }
        return '';
    }
    renderSingleTile(rowData, index) {
        const parsedCardView = this.props.parsedCardView;
        const {cardBody, cardHeader, cardImage, cardFooter, cardOptions = {}} = parsedCardView;
        const {width = 300, height = 200, bgColor1, bgColor2, fontColor} = cardOptions;
        const recordId = rowData.ID;
        const selectedRowKeys = this.props.selectedRowKeys;
        const highlighBackground = this.canHighlightBackground(rowData);
        return (
            <React.Fragment>
                <div
                    onContextMenu={(e) => {
                        this.selectedRecordIdRef.current = rowData.ID;
                        this.selectedRowDataRef.current = rowData;
                    }}
                    key={'tile-' + index}
                    className={`dx-item dx-tile `}
                    onClick={() => {
                        if (this.isSelectionEnabled()) {
                            const index = selectedRowKeys.findIndex((item) => item.ID === rowData.ID);
                            if (index !== -1) {
                                selectedRowKeys.splice(index, 1);
                            } else {
                                selectedRowKeys.push({ID: rowData.ID});
                            }
                            this.props.handleSelectedRowKeys(selectedRowKeys);
                        }
                    }}
                >
                    <div className={'dx-item-content dx-tile-content'}>
                        <div
                            id={recordId}
                            className={`dx-tile-image ${highlighBackground} ${
                                this.isSelectionEnabled()
                                    ? selectedRowKeys.findIndex((item) => item.ID === recordId) > -1
                                        ? 'card-grid-selected'
                                        : ''
                                    : ''
                            }`}
                            style={this.styleTile(rowData, bgColor1, bgColor2, fontColor, width, height)}
                        >
                            <div className='row'>
                                <div className='card-grid-header'>
                                    {cardHeader?.visible
                                        ? CardViewUtils.cellTemplate(
                                              cardHeader,
                                              rowData,
                                              'card-grid-header-title',
                                              'HEADER'
                                          )
                                        : null}
                                    <div className='card-grid-header-buttons'>
                                        <OperationsButtons
                                            margin={'mr-0'}
                                            inverseColor={false}
                                            buttonShadow={false}
                                            operations={this.props.parsedCardView.operationsRecord}
                                            operationList={this.props.parsedCardView.operationsRecordList}
                                            info={null}
                                            handleEdit={(e) =>
                                                this.preOperationAction(e, () => this.handleEdit(rowData), recordId)
                                            }
                                            handleEditSpec={() => this.handleEditSpec(rowData)}
                                            hrefSpecView={this.hrefSpecView(rowData)}
                                            hrefSubview={this.hrefSubview(rowData)}
                                            handleHrefSubview={() => {
                                                this.handleHrefSubview(rowData);
                                            }}
                                            handleArchive={(e) =>
                                                this.preOperationAction(
                                                    e,
                                                    () => this.props.handleArchiveRow(recordId),
                                                    recordId
                                                )
                                            }
                                            handleDownload={(e) =>
                                                this.preOperationAction(
                                                    e,
                                                    () => this.props.handleDownloadRow(recordId),
                                                    recordId
                                                )
                                            }
                                            handleAttachments={(e) =>
                                                this.preOperationAction(
                                                    e,
                                                    () => this.props.handleAttachmentRow(recordId),
                                                    recordId
                                                )
                                            }
                                            handleCopy={(e) =>
                                                this.preOperationAction(
                                                    e,
                                                    () => this.props.handleCopyRow(recordId),
                                                    recordId
                                                )
                                            }
                                            handleDelete={(e) =>
                                                this.preOperationAction(
                                                    e,
                                                    () => this.props.handleDeleteRow(recordId),
                                                    recordId
                                                )
                                            }
                                            handleHistory={(e) =>
                                                this.preOperationAction(
                                                    e,
                                                    () => this.props.handleHistoryLogRow(recordId),
                                                    recordId
                                                )
                                            }
                                            handleFormula={(e) =>
                                                this.preOperationAction(
                                                    e,
                                                    () => this.props.handleFormulaRow(recordId),
                                                    recordId
                                                )
                                            }
                                            handleRestore={(e) =>
                                                this.preOperationAction(
                                                    e,
                                                    () => this.props.handleRestoreRow(recordId),
                                                    recordId
                                                )
                                            }
                                            handlePublish={(e) =>
                                                this.preOperationAction(
                                                    e,
                                                    () => this.props.handlePublishRow(recordId),
                                                    recordId
                                                )
                                            }
                                            handleDocuments={(e) =>
                                                this.preOperationAction(
                                                    e,
                                                    () => this.props.handleDocumentRow(e.id, recordId),
                                                    recordId
                                                )
                                            }
                                            handlePlugins={(e) =>
                                                this.preOperationAction(
                                                    e,
                                                    () => this.props.handlePluginRow(e.id, recordId),
                                                    recordId
                                                )
                                            }
                                            handleBlockUi={() => this.props.handleBlockUi()}
                                        />
                                    </div>
                                </div>
                                <div className='card-grid-body'>
                                    {cardImage?.visible && cardImage?.fieldName && rowData[cardImage?.fieldName]
                                        ? CardViewUtils.cellTemplate(
                                              cardImage,
                                              rowData,
                                              'card-grid-body-image',
                                              'IMG',
                                              (rowData, title) => {
                                                  this.setState({
                                                      imageViewer: {
                                                          imageViewDialogVisible: true,
                                                          imageBase64: 'data:image/jpeg;base64,' + rowData,
                                                          header: title,
                                                      },
                                                  });
                                              }
                                          )
                                        : null}
                                    {cardBody?.visible
                                        ? CardViewUtils.cellTemplate(
                                              cardBody,
                                              rowData,
                                              'card-grid-body-content',
                                              cardImage?.visible &&
                                                  cardImage?.fieldName &&
                                                  rowData[cardImage?.fieldName]
                                                  ? 'BODY_WITH_IMG'
                                                  : 'BODY'
                                          )
                                        : null}
                                </div>
                                <div className='card-grid-footer'>
                                    {cardFooter?.visible
                                        ? CardViewUtils.cellTemplate(
                                              cardFooter,
                                              rowData,
                                              'card-grid-footer-content',
                                              'FOOTER'
                                          )
                                        : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

CardViewInfiniteComponent.defaultProps = {
    parsedCardView: true,
    parsedCardViewData: undefined,
    selectedRowKeys: [],
    cardGrid: null,
    mode: 'view',
};

CardViewInfiniteComponent.propTypes = {
    id: PropTypes.number.isRequired,
    mode: PropTypes.string.isRequired,
    parsedCardView: PropTypes.object.isRequired,
    parsedCardViewData: PropTypes.object.isRequired,
    handleOnInitialized: PropTypes.func.isRequired,
    handleShowEditPanel: PropTypes.func.isRequired,
    handleBlockUi: PropTypes.func.isRequired,
    showErrorMessages: PropTypes.func.isRequired,
    collapsed: PropTypes.bool.isRequired,
    kindView: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    parentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    filterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    elementSubViewId: PropTypes.object,
    elementKindView: PropTypes.string,
    selectedRowKeys: PropTypes.array,
    handleSelectedRowKeys: PropTypes.func, //buttons
    handleArchiveRow: PropTypes.func,
    handleDownload: PropTypes.func,
    handleAttachmentRow: PropTypes.func,
    handleCopyRow: PropTypes.func,
    handleDeleteRow: PropTypes.func,
    handleHistory: PropTypes.func,
    handleRestoreRow: PropTypes.func,
    handlePublishRow: PropTypes.func,
};

export default CardViewInfiniteComponent;
