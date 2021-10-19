import React from 'react';
import TileView from "devextreme-react/tile-view";
import {GridViewUtils} from "../../utils/GridViewUtils";
import {Breadcrumb} from "../../utils/BreadcrumbUtils";
import $ from "jquery";
import {CardViewUtils} from "../../utils/CardViewUtils";
import ShortcutButton from "../../components/ShortcutButton";
import ActionButtonWithMenu from "../../components/ActionButtonWithMenu";
import AppPrefixUtils from "../../utils/AppPrefixUtils";

function renderCard(rowData, state) {
    const {cardBody, cardHeader, cardImage, cardFooter} = state.parsedGridView;
    let showEditButton = false;
    let showSubviewButton = false;
    let showMenu = false;
    let menuItems = [];
    if (state.parsedGridView?.operations) {
        state.parsedGridView?.operations.forEach((operation) => {
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
    let oppEdit = GridViewUtils.containsOperationButton(state.parsedGridView?.operations, 'OP_EDIT');
    let oppSubview = GridViewUtils.containsOperationButton(state.parsedGridView?.operations, 'OP_SUBVIEWS');
    const viewId = this.getRealViewId();
    const recordId = rowData.ID;
    const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
    setTimeout(() => {
        const cardHeight = state.parsedGridView?.cardOptions?.heigh ?? 200;
        var p = $(`#${rowData.ID} .card-grid-body-content`);
        while ($(p).outerHeight() > cardHeight - 52) {
            $(p).text(function (index, text) {
                return text.replace(/\W*\s(\S)*$/, '...');
            });
        }
    }, 10);
    return (
        <div
            id={rowData.ID}
            className={`dx-tile-image ${
                state.selectedRowKeys.includes(rowData.ID) ? 'card-grid-selected' : ''
            }`}
            style={{backgroundColor: rowData._BGCOLOR, color: rowData._FONT_COLOR}}
        >
            <div className='row'>
                <div className='card-grid-header'>
                    {cardHeader?.visible
                        ? CardViewUtils.cellTemplate(cardHeader, rowData, 'card-grid-header-title', 'HEADER')
                        : null}
                    {showEditButton || showMenu || showSubviewButton ? (
                        <div className='card-grid-header-buttons'>
                            <ShortcutButton
                                id={`${rowData.id}_menu_button`}
                                className={`action-button-with-menu`}
                                iconName={'mdi-pencil'}
                                label={''}
                                title={''}
                                handleClick={() => this.setState({visibleEditPanel: true})}
                                rendered={showEditButton && oppEdit}
                            />
                            <ActionButtonWithMenu
                                id={`${rowData.id}_more_shortcut`}
                                className={`action-button-with-menu`}
                                iconName='mdi-dots-vertical'
                                items={menuItems}
                                remdered={showMenu}
                            />
                            <ShortcutButton
                                id={`${rowData.id}_menu_button`}
                                className={`action-button-with-menu`}
                                iconName={'mdi-playlist-plus '}
                                title={oppSubview?.label}
                                rendered={oppSubview}
                                href={AppPrefixUtils.locationHrefUrl(
                                    `/#/grid-view/${viewId}?recordId=${recordId}${currentBreadcrumb}`
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
}

function CardViewComponent(cardGrid, state) {
    let cardWidth = state.parsedGridView?.cardOptions?.width ?? 300;
    let cardHeight = state.parsedGridView?.cardOptions?.heigh ?? 200;

    return (
        <TileView
            onInitialized={(e) => (cardGrid = e.component)}
            className='card-grid'
            items={state.parsedCardViewData}
            itemRender={(rowData) => renderCard(rowData, state)}
            height='100%'
            baseItemHeight={cardHeight}
            baseItemWidth={cardWidth}
            itemMargin={10}
            showScrollbar
            direction='vertical'
            onItemClick={(item) => {
                let selectedRowKeys = state.selectedRowKeys;
                var index = selectedRowKeys.indexOf(item.itemData.ID);
                if (index !== -1) {
                    selectedRowKeys.splice(index, 1);
                } else {
                    selectedRowKeys.push(item.itemData.ID);
                }
                this.setState({
                    selectedRowKeys: selectedRowKeys,
                });
            }}
        />
    );
}


export default CardViewComponent;
