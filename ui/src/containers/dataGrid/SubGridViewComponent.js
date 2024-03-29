import React from 'react';
import PropTypes from 'prop-types';
import DataGrid, {Column} from 'devextreme-react/data-grid';
import {DataGridUtils} from '../../utils/component/DataGridUtils';
import ReactDOM from 'react-dom';
import ShortcutButton from '../../components/prolab/ShortcutButton';
import ActionButtonWithMenu from '../../components/prolab/ActionButtonWithMenu';
import ConsoleHelper from '../../utils/ConsoleHelper';
import GridViewMinimizeComponent from './GridViewMinimizeComponent';
import {
    readObjFromCookieGlobal,
    readValueCookieGlobal,
    removeCookieGlobal,
    saveObjToCookieGlobal,
} from '../../utils/Cookie';
import ActionButtonWithMenuUtils from '../../utils/ActionButtonWithMenuUtils';
import UrlUtils from '../../utils/UrlUtils';
import ImageViewerComponent from '../../components/ImageViewerComponent';
import {MenuWithButtons} from '../../components/prolab/MenuWithButtons';
import {sessionPrelongFnc} from '../../App';
import {EditorDialog} from '../../components/prolab/EditorDialog';
import {OperationType} from '../../model/OperationType';

class SubGridViewComponent extends React.Component {
    constructor(props) {
        super(props);
        ConsoleHelper('subGridViewComponent::constructor');

        this.menuSubGrid = React.createRef();
        let minimizeCache = readObjFromCookieGlobal('SUB_GRID_VIEW_MINIMIZE');
        this.state = {
            minimize: minimizeCache === true,
            imageViewer: {
                imageViewDialogVisisble: false,
                editable: false,
                imageBase64: undefined,
                header: undefined,
            },
            editorViewer: {
                editorDialogVisisble: false,
                editable: false,
                value: undefined,
                header: undefined,
            },
        };
    }
    showMenu(e) {
        const menu = this.menuSubGrid.current;
        const actionButtonWithMenuContant = document.getElementById('action-button-with-menu-contant');
        if (actionButtonWithMenuContant) {
            actionButtonWithMenuContant.click();
        }
        if (menu !== null && e.row.rowType === 'data') {
            const mouseX = e.event.clientX;
            const mouseY = e.event.clientY;
            e.event.stopPropagation();
            e.event.preventDefault();
            menu.toggle(e.event);
            this.setState({selectedRecordId: e.row.data.ID}, () => {
                const menu = document.getElementById('menu-with-buttons');
                menu.style.left = mouseX + 'px';
                menu.style.top = mouseY + 'px';
            });
        }
    }
    //very important !!!
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        const refreshSubView = readValueCookieGlobal('refreshSubView');
        if (refreshSubView) {
            return true;
        }
        if (!!window.performance) {
            if (performance.navigation.type === 1) {
                return true;
            }
        }
        const viewId = this.props.subView?.viewInfo?.id;
        const nextViewId = nextProps.subView?.viewInfo?.id;
        const currentUrl = window.location.href;
        if (viewId === nextViewId || currentUrl.includes('force=')) {
            ConsoleHelper('subGridViewComponent::shouldComponentUpdate update=false');
            return false;
        }
        ConsoleHelper('subGridViewComponent::shouldComponentUpdate update=true');
        return true;
    }
    componentDidMount() {
        saveObjToCookieGlobal('refreshSubView', true);
    }
    componentDidUpdate() {}
    componentWillUnmount() {
        removeCookieGlobal('refreshSubView');
    }
    render() {
        const {imageViewer, editorViewer} = this.state;
        //TODO jak będzie potrzeba przepiąć guziki na OperationsRecordButtons
        const {labels} = this.props;
        let showEditButton = false;
        let menuItems = [];
        this.props.subView?.headerOperations.forEach((operation) => {
            showEditButton = showEditButton || operation.type === 'OP_EDIT';
            if (
                operation.type === 'OP_PUBLIC' ||
                operation.type === 'OP_HISTORY' ||
                operation.type === 'OP_EDIT' ||
                operation.type === 'OP_ATTACHMENTS'
            ) {
                operation.icon = 'mdi ' + operation.iconCode;
                menuItems.push(operation);
            }
        });

        const showMenu = menuItems.length > 0;
        let widthTmp = 0;
        if (showMenu) {
            widthTmp += 38;
        }
        if (showEditButton) {
            widthTmp += 38;
        }
        const rowAutoHeight = false;
        const columnAutoWidth = true;
        const subViewMode = !!this.props.subView;
        const viewId = this.props.subView?.viewInfo?.id;
        const recordId = this.props?.subView?.headerData[0]?.ID;
        this.props.subView?.headerColumns
            ?.filter((c) => c.visible === true)
            .map((c) => {
                return c;
            });
        return (
            <React.Fragment>
                {imageViewer?.imageViewDialogVisisble && (
                    <ImageViewerComponent
                        editable={imageViewer.editable}
                        onHide={() => {
                            this.setState({
                                imageViewer: {
                                    imageViewDialogVisisble: false,
                                    editable: false,
                                    imageBase64: undefined,
                                },
                            });
                        }}
                        base64={imageViewer.imageBase64}
                        viewBase64={imageViewer.imageBase64}
                        header={imageViewer.header}
                        labels={this.labels}
                        visible
                    />
                )}
                {editorViewer?.editorDialogVisisble && (
                    <EditorDialog
                        header={editorViewer.header}
                        editable={editorViewer.editable}
                        value={editorViewer.value}
                        visible={editorViewer?.editorDialogVisisble}
                        onHide={() => {
                            this.setState({
                                editorViewer: {
                                    editorDialogVisisble: false,
                                    editable: false,
                                    value: undefined,
                                    header: undefined,
                                },
                            });
                        }}
                    />
                )}
                {subViewMode ? (
                    <div id='selection-row' className='float-left width-100'>
                        {this.state.minimize ? (
                            <GridViewMinimizeComponent
                                subView={this.props.subView}
                                onClick={() => {
                                    this.setState({minimize: false}, () => {
                                        saveObjToCookieGlobal('SUB_GRID_VIEW_MINIMIZE', false);
                                        this.forceUpdate();
                                    });
                                }}
                            />
                        ) : (
                            <div className='maximalized-sub-view' style={{minHeight: this.props?.minHeight}}>
                                <DataGrid
                                    onContextMenuPreparing={(e) => this.showMenu(e)}
                                    id='selection-data-grid'
                                    // handleOnDataGrid={(ref) => (this.refDataGrid = ref)}
                                    ref={(ref) => this.props.handleOnInitialized(ref)}
                                    dataSource={this.props.subView?.headerData}
                                    wordWrapEnabled={rowAutoHeight}
                                    columnAutoWidth={columnAutoWidth}
                                    allowColumnReordering={true}
                                    allowColumnResizing={true}
                                    columnHidingEnabled={false}
                                >
                                    {this.props.subView?.headerColumns
                                        ?.filter((c) => c.visible === true)
                                        .map((c) => {
                                            return (
                                                <Column
                                                    allowFixing={true}
                                                    caption={c.label}
                                                    dataType={DataGridUtils.specifyColumnType(c?.type)}
                                                    format={DataGridUtils.specifyColumnFormat(c?.type)}
                                                    cellTemplate={DataGridUtils.cellTemplate(
                                                        c,
                                                        null,
                                                        (base64, header) => {
                                                            this.setState({
                                                                imageViewer: {
                                                                    imageViewDialogVisisble: true,
                                                                    editable: false,
                                                                    imageBase64: base64,
                                                                    header: header,
                                                                },
                                                            });
                                                        },
                                                        (value, header) => {
                                                            this.setState({
                                                                editorViewer: {
                                                                    editorDialogVisisble: true,
                                                                    editable: false,
                                                                    value: value,
                                                                    header: header,
                                                                },
                                                            });
                                                        }
                                                    )}
                                                    dataField={c.fieldName}
                                                />
                                            );
                                        })}
                                    {showEditButton || showMenu ? (
                                        <Column
                                            allowFixing={true}
                                            caption=''
                                            width={widthTmp}
                                            fixed={true}
                                            fixedPosition='right'
                                            cellTemplate={(element, info) => {
                                                ReactDOM.render(
                                                    <div>
                                                        <ShortcutButton
                                                            id={`${info.column.headerId}_menu_button`}
                                                            className={`action-button-with-menu`}
                                                            iconName={'mdi-pencil'}
                                                            handleClick={(e) => {
                                                                if (sessionPrelongFnc) {
                                                                    sessionPrelongFnc();
                                                                }
                                                                e.viewId = viewId;
                                                                e.recordId = recordId;
                                                                e.parentId = UrlUtils.getURLParameter('parentId');
                                                                this.props.handleOnEditClick(e);
                                                            }}
                                                            rendered={showEditButton}
                                                        />

                                                        <ActionButtonWithMenu
                                                            id='more_shortcut'
                                                            iconName='mdi-dots-vertical'
                                                            className={``}
                                                            items={ActionButtonWithMenuUtils.createItemsWithCommand(
                                                                menuItems,
                                                                undefined,
                                                                this.props.handleRightHeadPanelContent,
                                                                undefined,
                                                                true
                                                            )}
                                                            rendered={showMenu}
                                                            title={labels ? labels['View_AdditionalOptions'] : ''}
                                                        />
                                                    </div>,
                                                    element
                                                );
                                            }}
                                        />
                                    ) : null}
                                </DataGrid>
                                {this.props.subView?.headerOperationsPPM && (
                                    <MenuWithButtons
                                        handleEdit={() =>
                                            this.props.handleOnEditClick({
                                                viewId: viewId,
                                                recordId: recordId,
                                                parentId: UrlUtils.getURLParameter('parentId'),
                                            })
                                        }
                                        handleAttachments={() =>
                                            this.props.handleRightHeadPanelContent(
                                                menuItems.find((el) => el.type === OperationType.OP_ATTACHMENTS)
                                            )
                                        }
                                        handleHistory={() =>
                                            this.props.handleRightHeadPanelContent(
                                                menuItems.find((el) => el.type === OperationType.OP_HISTORY)
                                            )
                                        }
                                        operationList={this.props.subView?.headerOperationsPPM || []}
                                        menu={this.menuSubGrid}
                                    />
                                )}

                                <div
                                    className='arrow-open'
                                    onClick={() => {
                                        this.setState(
                                            {
                                                minimize: true,
                                            },
                                            () => {
                                                saveObjToCookieGlobal('SUB_GRID_VIEW_MINIMIZE', true);
                                                this.forceUpdate();
                                            }
                                        );
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ) : null}
            </React.Fragment>
        );
    }
}

SubGridViewComponent.defaultProps = {};
SubGridViewComponent.propTypes = {
    subView: PropTypes.object.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    handleOnInitialized: PropTypes.func.isRequired,
    handleOnEditClick: PropTypes.func,
};

export default SubGridViewComponent;
