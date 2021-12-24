import React from 'react';
import TileView from "devextreme-react/tile-view";
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

class CardViewComponent extends React.Component {

    constructor(props) {
        super(props);
        this.editService = new EditService();
        this.labels = this.props;
        ConsoleHelper('CardViewComponent -> constructor');
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


    render() {
        const padding = 2;
        let cardWidth = this.props.parsedGridView?.cardOptions?.width ?? 300;
        let cardHeight = this.props.parsedGridView?.cardOptions?.height ?? 200;
        let cardBgColor1 = this.props.parsedGridView?.cardOptions?.bgColor1;
        let cardBgColor2 = this.props.parsedGridView?.cardOptions?.bgColor2;
        let fontColor = this.props.parsedGridView?.cardOptions?.fontColor;
        return (
            <TileView
                onInitialized={(e) => (this.props.handleOnInitialized(e.component))}
                className='card-grid'
                items={this.props.parsedCardViewData}
                itemRender={(rowData) => {
                    const {cardBody, cardHeader, cardImage, cardFooter} = this.props.parsedGridView;
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
                    return (
                        <div
                            id={recordId}
                            className={`dx-tile-image ${this.isSelectionEnabled() ? (
                                this.props.selectedRowKeys.includes(recordId) ? 'card-grid-selected' : '') : ''
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
                    );
                }}
                height='100%'
                baseItemHeight={cardHeight + padding}
                baseItemWidth={cardWidth + padding}
                itemMargin={10}
                showScrollbar
                direction='vertical'
                onItemClick={(item) => {
                    if (this.isSelectionEnabled()) {
                        let selectedRowKeys = this.props.selectedRowKeys;
                        var index = selectedRowKeys.indexOf(item.itemData.ID);
                        if (index !== -1) {
                            selectedRowKeys.splice(index, 1);
                        } else {
                            selectedRowKeys.push(item.itemData.ID);
                        }
                        this.props.handleSelectedRowKeys(selectedRowKeys)
                    }
                }}
            />
        );
    }
}

CardViewComponent.defaultProps = {
    parsedGridView: true,
    parsedCardViewData: false,
    selectedRowKeys: [],
    cardGrid: null,
    mode: 'view'
};

CardViewComponent.propTypes = {
    mode: PropTypes.string.isRequired,
    parsedGridView: PropTypes.object.isRequired,
    parsedCardViewData: PropTypes.object.isRequired,
    elementSubViewId: PropTypes.object,
    elementKindView: PropTypes.string,
    handleOnInitialized: PropTypes.func.isRequired,
    handleShowEditPanel: PropTypes.func.isRequired,
    handleBlockUi: PropTypes.func.isRequired,
    showErrorMessages: PropTypes.func.isRequired,
    selectedRowKeys: PropTypes.object,
    handleSelectedRowKeys: PropTypes.func,
};

export default CardViewComponent;
