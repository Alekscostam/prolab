import React from 'react';
import TileView from 'devextreme-react/tile-view';
import {DataGridUtils} from '../../utils/component/DataGridUtils';
import {Breadcrumb} from '../../utils/BreadcrumbUtils';
import $ from 'jquery';
import {CardViewUtils} from '../../utils/CardViewUtils';
import ShortcutButton from '../../components/prolab/ShortcutButton';
import ActionButtonWithMenu from '../../components/prolab/ActionButtonWithMenu';
import AppPrefixUtils from '../../utils/AppPrefixUtils';
import PropTypes from 'prop-types';
import CrudService from '../../services/CrudService';
import ConsoleHelper from '../../utils/ConsoleHelper';
import ActionButtonWithMenuUtils from '../../utils/ActionButtonWithMenuUtils';
import {OperationType} from '../../model/OperationType';

class DashboardCardViewComponent extends React.Component {
    constructor(props) {
        super(props);
        this.crudService = new CrudService();
        this.labels = this.props;
        ConsoleHelper('CardViewComponent -> constructor');
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
    render() {
        const padding = 2;
        const cardWidth = this.props.parsedGridView?.cardOptions?.width ?? 300;
        const cardHeight = this.props.parsedGridView?.cardOptions?.height ?? 200;
        const cardBgColor1 = this.props.parsedGridView?.cardOptions?.bgColor1;
        const cardBgColor2 = this.props.parsedGridView?.cardOptions?.bgColor2;
        const fontColor = this.props.parsedGridView?.cardOptions?.fontColor;
        return (
            <TileView
                onInitialized={(e) => {
                    this.props.handleOnInitialized(e.component);
                }}
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
                            showEditButton = showEditButton || operation.type === OperationType.OP_EDIT;
                            showSubviewButton = showSubviewButton || operation.type === OperationType.OP_SUBVIEWS;
                            if (
                                operation.type === OperationType.OP_PUBLIC ||
                                operation.type === OperationType.OP_HISTORY ||
                                operation.type === OperationType.OP_ATTACHMENTS
                            ) {
                                menuItems.push(operation);
                            }
                        });
                        showMenu = menuItems.length > 0;
                    }
                    const oppEdit = DataGridUtils.getOpButton(
                        this.props.parsedGridView?.operations,
                        OperationType.OP_EDIT
                    );
                    const oppSubview = DataGridUtils.getOpButton(
                        this.props.parsedGridView?.operations,
                        OperationType.OP_SUBVIEWS
                    );
                    const canRenderEdit = !!(showEditButton && oppEdit);
                    const elementSubViewId = this.props.elementSubViewId;
                    const elementKindView = this.props.elementKindView;
                    const elementId = this.props.id;
                    const viewId = DataGridUtils.getRealViewId(elementSubViewId, elementId);
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
                            className={`dx-tile-image ${
                                this.isSelectionEnabled()
                                    ? this.props.selectedRowKeys.includes(recordId)
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
                                    {showEditButton || showMenu || showSubviewButton ? (
                                        <div className='card-grid-header-buttons'>
                                            {oppEdit && (
                                                <ShortcutButton
                                                    id={`${recordId}_menu_button`}
                                                    className={`action-button-with-menu`}
                                                    iconName={'mdi-pencil'}
                                                    label={''}
                                                    title={oppEdit?.label}
                                                    handleClick={() => {
                                                        let result = this.props.handleBlockUi();
                                                        if (result) {
                                                            this.crudService
                                                                .edit(viewId, recordId, subviewId, elementKindView)
                                                                .then((editDataResponse) => {
                                                                    this.setState(
                                                                        {
                                                                            editData: editDataResponse,
                                                                        },
                                                                        () => {
                                                                            this.props.handleShowEditPanel(
                                                                                editDataResponse
                                                                            );
                                                                        }
                                                                    );
                                                                })
                                                                .catch((err) => {
                                                                    this.props.showErrorMessages(err);
                                                                });
                                                        }
                                                    }}
                                                    rendered={canRenderEdit}
                                                />
                                            )}
                                            {oppSubview && (
                                                <ShortcutButton
                                                    id={`${recordId}_menu_button`}
                                                    className={`action-button-with-menu`}
                                                    iconName={'mdi-playlist-plus '}
                                                    title={oppSubview?.label}
                                                    rendered={oppSubview}
                                                    href={AppPrefixUtils.locationHrefUrl(
                                                        `/#/grid-view/${viewId}${
                                                            !!recordId ? `?recordId=${recordId}` : ``
                                                        }${!!currentBreadcrumb ? currentBreadcrumb : ``}`
                                                    )}
                                                />
                                            )}
                                            <ActionButtonWithMenu
                                                id={`${recordId}_more_shortcut`}
                                                className={`action-button-with-menu`}
                                                iconName='mdi-dots-vertical'
                                                items={ActionButtonWithMenuUtils.createItemsWithCommand(
                                                    menuItems,
                                                    undefined,
                                                    (e) => {
                                                        this.props.handleOperation(e);
                                                    },
                                                    undefined
                                                )}
                                                rendered={showMenu}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                                <div className='card-grid-body'>
                                    {cardImage?.visible && cardImage?.fieldName && rowData[cardImage?.fieldName]
                                        ? CardViewUtils.cellTemplate(cardImage, rowData, 'card-grid-body-image', 'IMG', (rowData, title)=>{
                                             this.props.onImageClick(rowData, title)
                                         })
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
                    );
                }}
                height='100%'
                baseItemHeight={cardHeight + padding}
                baseItemWidth={cardWidth + padding}
                itemMargin={10}
                showScrollbar='always'
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
                        this.props.handleSelectedRowKeys(selectedRowKeys);
                    }
                }}
            />
        );
    }
}

DashboardCardViewComponent.defaultProps = {
    parsedGridView: true,
    parsedCardViewData: false,
    selectedRowKeys: [],
    cardGrid: null,
    mode: 'view',
};

DashboardCardViewComponent.propTypes = {
    mode: PropTypes.string.isRequired,
    parsedGridView: PropTypes.object.isRequired,
    parsedCardViewData: PropTypes.array.isRequired,
    elementSubViewId: PropTypes.object,
    elementKindView: PropTypes.string,
    handleOnInitialized: PropTypes.func.isRequired,
    handleShowEditPanel: PropTypes.func.isRequired,
    handleBlockUi: PropTypes.func.isRequired,
    showErrorMessages: PropTypes.func.isRequired,
    selectedRowKeys: PropTypes.array,
    handleSelectedRowKeys: PropTypes.func,
};

export default DashboardCardViewComponent;
