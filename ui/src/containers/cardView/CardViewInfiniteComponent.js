import React from 'react';
import {GridViewUtils} from "../../utils/GridViewUtils";
import {Breadcrumb} from "../../utils/BreadcrumbUtils";
import $ from "jquery";
import {CardViewUtils} from "../../utils/CardViewUtils";
import ShortcutButton from "../../components/prolab/ShortcutButton";
import ActionButtonWithMenu from "../../components/prolab/ActionButtonWithMenu";
import AppPrefixUtils from "../../utils/AppPrefixUtils";
import PropTypes from "prop-types";
import EditService from "../../services/EditService";
import ConsoleHelper from "../../utils/ConsoleHelper";
import CardInfiniteLoaderWrapper from "./CardInfiniteLoaderWrapper";
import DataGridStore from "../dao/DataGridStore";
import WindowSizeListener from "react-window-size-listener";

class CardViewInfiniteComponent extends React.Component {

    constructor(props) {
        super(props);
        this.editService = new EditService();
        this.labels = this.props;
        this.dataGridStore = new DataGridStore();
        this.state = {
            hasNextPage: true,
            isNextPageLoading: false,
            items: [],
            cardSkip: 0,
            cardScrollLoading: false,
            columnCount: 1
        }
        ConsoleHelper('CardViewComponent -> constructor');
    }

    componentDidMount() {
        $(document).on('mousedown', '.dx-item.dx-tile', function () {
            $(this).addClass('dx-state-active');
        });
        $(document).on('click', '.dx-item.dx-tile', function () {
            $(this).removeClass('dx-state-active');
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.collapsed !== prevProps.collapsed) {
            let windowSizeWidth = window.innerWidth;
            let cardWidth = this.props.parsedGridView?.cardOptions?.width ?? 300;
            this.setState({columnCount: this.calculateColumns(windowSizeWidth, cardWidth)})
        }
    }

    isSelectionEnabled() {
        return !!this.props.handleSelectedRowKeys && !!this.props.selectedRowKeys;
    }

    isDashboard() {
        return this.props.mode === 'dashboard'
    }

    styleTile(rowData, cardBgColor1, cardBgColor2, fontColor, width, height) {
        let styleTile;
        if (this.isDashboard()) {
            styleTile = {
                backgroundImage: `linear-gradient(to bottom right, ${cardBgColor1}, ${cardBgColor2})`,
                color: fontColor,
                width: width,
                height: height
            };
        } else {
            styleTile = {backgroundColor: rowData._BGCOLOR, color: rowData._FONT_COLOR, width: width, height: height};
        }
        return styleTile;
    }

    _loadNextPage = (...args) => {
        const dataPackageSize = 30;
        const packageCount = (!!dataPackageSize || dataPackageSize === 0) ? 30 : dataPackageSize;
        this.setState({
            isNextPageLoading: true,
            cardScrollLoading: true,
            cardSkip: this.state.cardSkip + packageCount
        }, () => {
            const columnCount = this.state.columnCount;
            let skip = args[0] * columnCount;
            if ((args[0] * columnCount) % packageCount !== 0) {
                let divide = args[0] * columnCount;
                skip = Math.ceil(divide / packageCount) * dataPackageSize
            }
            this.dataGridStore
                .getDataForCard(this.props.id, {
                        skip: skip,
                        take: packageCount
                    },
                    this.props.parentId,
                    this.props.filterId,
                    this.props.kindView
                )
                .then((res) => {
                    let parsedCardViewData = [];
                    res.data.forEach((item) => {
                        for (var key in item) {
                            var upper = key.toUpperCase();
                            // check if it already wasn't uppercase
                            if (upper !== key) {
                                item[upper] = item[key];
                                delete item[key];
                            }
                        }
                        parsedCardViewData.push(item);
                    });
                    this.setState(state => ({
                        hasNextPage: state.items.length < res.totalCount,
                        isNextPageLoading: false,
                        items: [...state.items].concat(
                            parsedCardViewData
                        )
                    }));
                });
        });
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
        return Math.floor((windowWidth - (windowWidth <= 768 ? 0 : (this.props.collapsed ? 70 : 320))) / (cardWidth + 10));
    }

    render() {
        let cardWidth = this.props.parsedGridView?.cardOptions?.width ?? 300;
        let cardHeight = this.props.parsedGridView?.cardOptions?.height ?? 200;
        const isItemLoaded = index => !this.state.hasNextPage || index < this.state.items.length;
        const Item = ({index, style}) => {
            let rowData = this.state.items
            rowData = this.chunkData(rowData, this.state.columnCount);
            rowData = rowData[index];
            if (!isItemLoaded(index)) {
                return <div id={'row'} className={'tiles'} style={style}/>
            } else {
                return (<React.Fragment>
                    {!!rowData ?
                        <div id={'row'} className={'tiles'} style={style}>
                            {React.Children.toArray(
                                Array.from(rowData).map((data) => this.renderSingleTile(data, index, cardWidth, cardHeight))
                            )}
                        </div> : null}
                </React.Fragment>);
            }
        };
        return (
            <React.Fragment>
                {this.state.items.length}
                <WindowSizeListener onResize={(windowSize) => {
                    this.setState({columnCount: this.calculateColumns(windowSize.windowWidth, cardWidth)})
                }}>
                    <CardInfiniteLoaderWrapper
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
        )
    }

    renderSingleTile(rowData, index, cardWidth, cardHeight) {
        let cardBgColor1 = this.props.parsedGridView?.cardOptions?.bgColor1;
        let cardBgColor2 = this.props.parsedGridView?.cardOptions?.bgColor2;
        let fontColor = this.props.parsedGridView?.cardOptions?.fontColor;
        let showEditButton = false;
        let showSubviewButton = false;
        let showMenu = false;
        let menuItems = [];
        if (this.props.parsedGridView?.operations) {
            this.props.parsedGridView?.operations.forEach((operation) => {
                showEditButton = showEditButton || operation.type === 'OP_EDIT';
                showSubviewButton = showSubviewButton || operation.type === 'OP_SUBVIEWS';
                if (
                    operation.type === 'OP_PUBLIC' ||
                    operation.type === 'OP_HISTORY' ||
                    operation.type === 'OP_ATTACHMENTS'
                ) {
                    menuItems.push(operation);
                }
            });
            showMenu = menuItems.length > 0;
        }
        let oppEdit = GridViewUtils.containsOperationButton(this.props.parsedGridView?.operations, 'OP_EDIT');
        let oppSubview = GridViewUtils.containsOperationButton(this.props.parsedGridView?.operations, 'OP_SUBVIEWS');
        const {cardBody, cardHeader, cardImage, cardFooter} = this.props.parsedGridView;
        const elementSubViewId = this.props.elementSubViewId;
        const elementKindView = this.props.elementKindView;
        const elementId = this.props.id;
        const viewId = GridViewUtils.getRealViewId(elementSubViewId, elementId);
        const recordId = rowData.ID;
        const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
        const subviewId = elementSubViewId ? elementId : undefined;
        setTimeout(() => {
            const cardHeight = this.props.parsedGridView?.cardOptions?.heigh ?? 200;
            var p = $(`#${recordId} .card-grid-body-content`);
            while ($(p).outerHeight() > cardHeight - 52) {
                $(p).text(function (index, text) {
                    return text.replace(/\W*\s(\S)*$/, '...');
                });
            }
        }, 10);
        let selectedRowKeys = this.props.selectedRowKeys;
        return (<React.Fragment>
            <div key={index}
                 className={`dx-item dx-tile`}
                 onClick={() => {
                     if (this.isSelectionEnabled()) {
                         var index = selectedRowKeys.findIndex(item => item.ID === rowData.ID);
                         if (index !== -1) {
                             selectedRowKeys.splice(index, 1);
                         } else {
                             selectedRowKeys.push({ID: rowData.ID});
                         }
                         this.props.handleSelectedRowKeys(selectedRowKeys)
                     }
                 }}>
                <div className={'dx-item-content dx-tile-content'}>
                    <div id={recordId}
                         className={`dx-tile-image ${this.isSelectionEnabled() ? (
                             selectedRowKeys.findIndex(item => item.ID === recordId) > -1 ? 'card-grid-selected' : '') : ''
                         }`}
                         style={this.styleTile(rowData, cardBgColor1, cardBgColor2, fontColor, cardWidth, cardHeight)}
                    >
                        <div className='row'>
                            <div className='card-grid-header'>
                                {cardHeader?.visible
                                    ? CardViewUtils.cellTemplate(cardHeader, rowData, 'card-grid-header-title', 'HEADER')
                                    : null}
                                {showEditButton || showMenu || showSubviewButton ? (
                                    <div className='card-grid-header-buttons'>
                                        <ShortcutButton
                                            id={`${recordId}_menu_button`}
                                            className={`action-button-with-menu`}
                                            iconName={'mdi-pencil'}
                                            label={''}
                                            title={oppEdit?.label}
                                            handleClick={() => {
                                                let result = this.props.handleBlockUi();
                                                if (result) {
                                                    this.editService
                                                        .getEdit(viewId, recordId, subviewId, elementKindView)
                                                        .then((editDataResponse) => {
                                                            this.props.handleShowEditPanel(editDataResponse);
                                                        })
                                                        .catch((err) => {
                                                            this.props.showErrorMessages(err);
                                                        });
                                                }
                                            }}
                                            rendered={showEditButton && oppEdit}
                                        />
                                        <ShortcutButton
                                            id={`${recordId}_menu_button`}
                                            className={`action-button-with-menu`}
                                            iconName={'mdi-playlist-plus '}
                                            title={oppSubview?.label}
                                            rendered={oppSubview}
                                            href={AppPrefixUtils.locationHrefUrl(
                                                `/#/grid-view/${viewId}${!!recordId ? `?recordId=${recordId}` : ``}${!!currentBreadcrumb ? currentBreadcrumb : ``}`
                                            )}
                                        />
                                        <ActionButtonWithMenu
                                            id={`${recordId}_more_shortcut`}
                                            className={`action-button-with-menu`}
                                            iconName='mdi-dots-vertical'
                                            items={menuItems}
                                            rendered={showMenu}
                                        />
                                    </div>
                                ) : null}
                            </div>
                            <div className='card-grid-body'>
                                {/* <div className='row'> */}
                                {cardImage?.visible && cardImage?.fieldName && rowData[cardImage?.fieldName]
                                    ? // <div className={cardBody?.visible ? 'col-3' : 'col-12'}>
                                    CardViewUtils.cellTemplate(cardImage, rowData, 'card-grid-body-image', 'IMG')
                                    : // </div>
                                    null}
                                {cardBody?.visible
                                    ? // <div className={cardImage?.visible ? 'col-9' : 'col-12'}>
                                    CardViewUtils.cellTemplate(
                                        cardBody,
                                        rowData,
                                        'card-grid-body-content',
                                        cardImage?.visible && cardImage?.fieldName && rowData[cardImage?.fieldName]
                                            ? 'BODY_WITH_IMG'
                                            : 'BODY'
                                    )
                                    : // </div>
                                    null}
                                {/* </div> */}
                            </div>
                            <div className='card-grid-footer'>
                                {cardFooter?.visible
                                    ? CardViewUtils.cellTemplate(cardFooter, rowData, 'card-grid-footer-content', 'FOOTER')
                                    : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>);
    }

}

CardViewInfiniteComponent.defaultProps = {
    parsedGridView: true,
    parsedCardViewData: false,
    selectedRowKeys: [],
    cardGrid: null,
    mode: 'view'
};

CardViewInfiniteComponent.propTypes = {
    id: PropTypes.number.isRequired,
    mode: PropTypes.string.isRequired,
    parsedGridView: PropTypes.object.isRequired,
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
    handleSelectedRowKeys: PropTypes.func,

};

export default CardViewInfiniteComponent;
