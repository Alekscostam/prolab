import React from 'react';
import TileView from "devextreme-react/tile-view";
import {GridViewUtils} from "../../utils/GridViewUtils";
import {Breadcrumb} from "../../utils/BreadcrumbUtils";
import $ from "jquery";
import {CardViewUtils} from "../../utils/CardViewUtils";
import ShortcutButton from "../../components/ShortcutButton";
import ActionButtonWithMenu from "../../components/ActionButtonWithMenu";
import AppPrefixUtils from "../../utils/AppPrefixUtils";
import PropTypes from "prop-types";

class CardViewComponent extends React.Component {

    constructor(props) {
        super(props);
        this.labels = this.props;
        console.log('CardViewComponent -> constructor');
    }

    isSelectionEnabled() {
        return !!this.props.handleSelectedRowKeys && !!this.props.selectedRowKeys;
    }

    isDashboard(){
        return this.props.mode == 'dashboard'
    }

    styleTile(rowData, cardBgColor1, cardBgColor2, fontColor) {
        let styleTile;
        if (this.isDashboard()) {
            styleTile = {
                backgroundImage: `linear-gradient(to bottom right, ${cardBgColor1}, ${cardBgColor2})`,
                color: fontColor
            };
        } else {
            styleTile = {backgroundColor: rowData._BGCOLOR, color: rowData._FONT_COLOR};
        }
        return styleTile;
    }

    render() {
        let cardWidth = this.isDashboard() ? this.props.parsedGridView?.cardOptions?.width - 10 : this.props.parsedGridView?.cardOptions?.width ?? 300;
        let cardHeight = this.isDashboard() ? this.props.parsedGridView?.cardOptions?.height - 10 : this.props.parsedGridView?.cardOptions?.height ?? 200;
        let cardBgColor1 = this.props.parsedGridView?.cardOptions?.bgColor1;
        let cardBgColor2 = this.props.parsedGridView?.cardOptions?.bgColor2;
        let fontColor = this.props.parsedGridView?.cardOptions?.fontColor;
        return (
            <TileView
                onInitialized={(e) => (this.props.handleOnInitialized(e.component))}
                className='card-grid'
                style={this.isDashboard() ? {width: cardWidth + 10, height: cardHeight + 10} : null}
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
                    const elementId = this.props.id;
                    const viewId = GridViewUtils.getRealViewId(elementSubViewId, elementId);
                    const recordId = rowData.ID;
                    const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
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
                            style={this.styleTile(rowData, cardBgColor1, cardBgColor2, fontColor)}
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
                                                title={''}
                                                handleClick={() => this.props.handleShowEditPanel()}
                                                rendered={showEditButton && oppEdit}
                                            />
                                            <ActionButtonWithMenu
                                                id={`${recordId}_more_shortcut`}
                                                className={`action-button-with-menu`}
                                                iconName='mdi-dots-vertical'
                                                items={menuItems}
                                                rendered={showMenu}
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
                baseItemHeight={cardHeight}
                baseItemWidth={cardWidth}
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
    selectedRowKeys: PropTypes.object.isRequired,
    elementSubViewId: PropTypes.object.isRequired,
    handleOnInitialized: PropTypes.func.isRequired,
    handleShowEditPanel: PropTypes.func.isRequired,
    handleSelectedRowKeys: PropTypes.func,
};

export default CardViewComponent;
