import React from 'react';
import {DataGridUtils} from '../../utils/component/DataGridUtils';
import {Breadcrumb} from '../../utils/BreadcrumbUtils';
import $ from 'jquery';
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

class CardViewInfiniteComponent extends React.Component {
    constructor(props) {
        super(props);
        this.crudService = new CrudService();
        this.labels = this.props;
        this.dataCardStore = new DataCardStore();
        this.state = {
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
            let windowSizeWidth = window.innerWidth;
            let cardWidth = this.props.parsedCardView?.cardOptions?.width ?? 300;
            this.setState({columnCount: this.calculateColumns(windowSizeWidth, cardWidth)});
        }
    }

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

    refresh(noLoadNextPage) {
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
        //
    }
    canLoadNextPage() {
        return (this.props?.elementSubViewId && !this.state.isNextPageLoading) || this.state.items.length < 5;
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
                                for (var key in item) {
                                    var upper = key.toUpperCase();
                                    // check if it already wasn't uppercase
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
                                }),
                                () => {
                                    this.props.handleUnblockUi();
                                }
                            );
                        });
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

    calculateColumns(windowWidth, cardWidth) {
        return Math.floor(
            (windowWidth - (windowWidth <= 768 ? 0 : this.props.collapsed ? 70 : 320)) / (cardWidth + 10)
        );
    }

    render() {
        let cardWidth = this.props.parsedCardView?.cardOptions?.width ?? 300;
        let cardHeight = this.props.parsedCardView?.cardOptions?.height ?? 200;
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
                                    Array.from(rowData).map((data) =>
                                        this.renderSingleTile(data, index, cardWidth, cardHeight)
                                    )
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
                        this.setState({columnCount: this.calculateColumns(windowSize.windowWidth, cardWidth)});
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
            </React.Fragment>
        );
    }

    renderSingleTile(rowData, index, cardWidth, cardHeight) {
        let cardBgColor1 = this.props.parsedCardView?.cardOptions?.bgColor1;
        let cardBgColor2 = this.props.parsedCardView?.cardOptions?.bgColor2;
        let fontColor = this.props.parsedCardView?.cardOptions?.fontColor;
        const {cardBody, cardHeader, cardImage, cardFooter} = this.props.parsedCardView;
        const elementSubViewId = this.props.elementSubViewId;
        const elementKindView = this.props.elementKindView;
        const elementId = this.props.id;
        const parentId = this.props?.elementRecordId;
        const viewId = DataGridUtils.getRealViewId(elementSubViewId, elementId);
        const recordId = rowData.ID;
        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
        const subviewId = elementSubViewId ? elementId : undefined;
        setTimeout(() => {
            const cardHeight = this.props.parsedCardView?.cardOptions?.heigh ?? 200;
            var p = $(`#${recordId} .card-grid-body-content`);
            while ($(p).outerHeight() > cardHeight - 52) {
                $(p).text(function (index, text) {
                    return text.replace(/\W*\s(\S)*$/, '...');
                });
            }
        }, 10);
        let selectedRowKeys = this.props.selectedRowKeys;
        return (
            <React.Fragment>
                <div
                    key={index}
                    className={`dx-item dx-tile`}
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
                            className={`dx-tile-image ${
                                this.isSelectionEnabled()
                                    ? selectedRowKeys.findIndex((item) => item.ID === recordId) > -1
                                        ? 'card-grid-selected'
                                        : ''
                                    : ''
                            }`}
                            style={this.styleTile(
                                rowData,
                                cardBgColor1,
                                cardBgColor2,
                                fontColor,
                                cardWidth,
                                cardHeight
                            )}
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
                                            labels={this.labels}
                                            operations={this.props.parsedCardView.operationsRecord}
                                            operationList={this.props.parsedCardView.operationsRecordList}
                                            info={null}
                                            handleEdit={() => {
                                                const result = this.props.handleBlockUi();
                                                if (result) {
                                                    this.crudService
                                                        .edit(viewId, recordId, subviewId, elementKindView)
                                                        .then((editDataResponse) => {
                                                            this.setState(
                                                                {
                                                                    editData: editDataResponse,
                                                                },
                                                                () => {
                                                                    this.props.handleShowEditPanel(editDataResponse);
                                                                }
                                                            );
                                                        })
                                                        .catch((err) => {
                                                            this.props.showErrorMessages(err);
                                                        });
                                                }
                                            }}
                                            handleEditSpec={() => {
                                                const prevUrl = window.location.href;
                                                sessionStorage.setItem('prevUrl', prevUrl);
                                                TreeListUtils.openEditSpec(
                                                    viewId,
                                                    TreeListUtils.isKindViewSpec(this.props.parsedGridView)
                                                        ? parentId
                                                        : recordId,
                                                    TreeListUtils.isKindViewSpec(this.props.parsedGridView)
                                                        ? [recordId]
                                                        : [],
                                                    currentBreadcrumb,
                                                    () => this.props.handleUnblockUi(),
                                                    (err) => this.props.showErrorMessages(err)
                                                );
                                            }}
                                            hrefSpecView={EditSpecUtils.editSpecUrl(
                                                viewId,
                                                TreeListUtils.isKindViewSpec(this.props.parsedGridView)
                                                    ? parentId
                                                    : recordId,
                                                compress(
                                                    TreeListUtils.isKindViewSpec(this.props.parsedGridView)
                                                        ? [recordId]
                                                        : []
                                                ),
                                                currentBreadcrumb
                                            )}
                                            hrefSubview={AppPrefixUtils.locationHrefUrl(
                                                `/#/grid-view/${viewId}${!!recordId ? `?recordId=${recordId}` : ``}${
                                                    !!currentBreadcrumb ? currentBreadcrumb : ``
                                                }`
                                            )}
                                            handleHrefSubview={() => {
                                                let newUrl = AppPrefixUtils.locationHrefUrl(
                                                    `/#/grid-view/${viewId}${
                                                        !!recordId ? `?recordId=${recordId}` : ``
                                                    }${!!currentBreadcrumb ? currentBreadcrumb : ``}`
                                                );
                                                window.location.assign(newUrl);
                                            }}
                                            handleArchive={() => {
                                                this.props.handleArchiveRow(recordId);
                                            }}
                                            handleDownload={() => {
                                                this.props.handleDownloadRow(recordId);
                                            }}
                                            handleAttachments={() => {
                                                this.props.handleAttachmentRow(recordId);
                                            }}
                                            handleCopy={() => {
                                                this.props.handleCopyRow(recordId);
                                            }}
                                            handleDelete={() => {
                                                this.props.handleDeleteRow(recordId);
                                            }}
                                            handleHistory={() => {
                                                this.props.handleHistoryLogRow(recordId);
                                            }}
                                            handleFormula={() => {
                                                this.props.handleFormulaRow(recordId);
                                            }}
                                            handleRestore={() => {
                                                this.props.handleRestoreRow(recordId);
                                            }}
                                            handlePublish={() => {
                                                this.props.handlePublishRow(recordId);
                                            }}
                                            handleBlockUi={() => {
                                                this.props.handleBlockUi();
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className='card-grid-body'>
                                    {/* <div className='row'> */}
                                    {cardImage?.visible && cardImage?.fieldName && rowData[cardImage?.fieldName] // <div className={cardBody?.visible ? 'col-3' : 'col-12'}>
                                        ? CardViewUtils.cellTemplate(cardImage, rowData, 'card-grid-body-image', 'IMG') // </div>
                                        : null}
                                    {cardBody?.visible // <div className={cardImage?.visible ? 'col-9' : 'col-12'}>
                                        ? CardViewUtils.cellTemplate(
                                              cardBody,
                                              rowData,
                                              'card-grid-body-content',
                                              cardImage?.visible &&
                                                  cardImage?.fieldName &&
                                                  rowData[cardImage?.fieldName]
                                                  ? 'BODY_WITH_IMG'
                                                  : 'BODY'
                                          ) // </div>
                                        : null}
                                    {/* </div> */}
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
    parsedCardViewData: false,
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
    kindView: PropTypes.string.isRequired,
    parentId: PropTypes.string.isRequired,
    filterId: PropTypes.string.isRequired,
    elementSubViewId: PropTypes.object,
    elementKindView: PropTypes.string,
    selectedRowKeys: PropTypes.object,
    handleSelectedRowKeys: PropTypes.func, //buttons
    handleArchiveRow: PropTypes.func.isRequired,
    handleDownload: PropTypes.func.isRequired,
    handleAttachmentRow: PropTypes.func.isRequired,
    handleCopyRow: PropTypes.func.isRequired,
    handleDeleteRow: PropTypes.func.isRequired,
    handleHistory: PropTypes.func.isRequired,
    handleRestoreRow: PropTypes.func.isRequired,
    handlePublishRow: PropTypes.func.isRequired,
};

export default CardViewInfiniteComponent;
