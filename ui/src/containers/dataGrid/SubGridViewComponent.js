import React from 'react';
import PropTypes from 'prop-types';
import DataGrid, {Column} from 'devextreme-react/data-grid';
import {DataGridUtils} from '../../utils/component/DataGridUtils';
import ReactDOM from 'react-dom/client';
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
import ImageViewerDialog from '../../components/ImageViewerDialog';
import {MenuWithButtons} from '../../components/prolab/MenuWithButtons';
import {sessionPrelongFnc} from '../../App';
import {EditorDialog} from '../../components/prolab/EditorDialog';
import {OperationType} from '../../enum/OperationType';
import {CookiesName} from '../../enum/CookieName';
import {ResponseUtils} from '../../utils/ResponseUtils';
import {ColumnUtils} from '../../utils/ColumnUtils';
import LocUtils from '../../utils/LocUtils';

class SubGridViewComponent extends React.Component {
    constructor(props) {
        super(props);
        ConsoleHelper('subGridViewComponent::constructor');
        this.menuSubGrid = React.createRef();
        let minimizeCache = readObjFromCookieGlobal('SUB_GRID_VIEW_MINIMIZE');
        this.state = {
            minimize: minimizeCache === true,
            imageViewer: {
                imageViewDialogVisible: false,
                editable: false,
                imageBase64: undefined,
                header: undefined,
            },
            editorViewer: {
                visible: false,
                editable: false,
                value: undefined,
                header: undefined,
                type: undefined,
            },
        };
    }
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        const refreshSubView = readValueCookieGlobal(CookiesName.REFRESH_SUB_VIEW);
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
        saveObjToCookieGlobal(CookiesName.REFRESH_SUB_VIEW, true);
    }
    componentDidUpdate() {}
    componentWillUnmount() {
        removeCookieGlobal(CookiesName.REFRESH_SUB_VIEW);
    }

    isGridViewBands = () => {
        const subView = this.props.subView;
        return subView?.viewInfo?.type === 'gridViewBands' || subView.viewInfo?.headerType === 'gridViewBands';
    };
    // Ujednolici to z tym co jest w komponencie GridViewData
    generateHeaderColumns() {
        if (this.isGridViewBands()) {
            const headerColumns = ResponseUtils.columnsGroupCreate(this.props.subView, 'headerColumns');
            return ColumnUtils.generateGroupColumns(headerColumns);
        }
        return this.generateColumns();
    }

    generateColumns() {
        const headerColumns = ResponseUtils.columnsFromGroupCreate(this.props.subView, 'headerColumns');
        return headerColumns
            ?.filter((c) => c.visible === true)
            .map((c, index) => {
                return (
                    <Column
                        key={c.fieldName + '-' + index}
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
                                        imageViewDialogVisible: true,
                                        editable: false,
                                        imageBase64: base64,
                                        header: header,
                                    },
                                });
                            },
                            (value, header, type) => {
                                this.setState({
                                    editorViewer: {
                                        visible: true,
                                        editable: false,
                                        value: value,
                                        header: header,
                                        type: type,
                                    },
                                });
                            }
                        )}
                        dataField={c.fieldName}
                    />
                );
            });
    }

    render() {
        const {imageViewer, editorViewer} = this.state;
        const allowedTypes = [
            OperationType.OP_PUBLIC,
            OperationType.OP_HISTORY,
            OperationType.OP_EDIT,
            OperationType.OP_ATTACHMENTS,
        ];
        const headerOperations = this.props.subView?.headerOperations || [];
        const menuItems = headerOperations
            .filter((op) => allowedTypes.includes(op.type))
            .map((op) => ({...op, icon: `mdi ${op.iconCode}`}));
        const showEditButton = headerOperations.some((op) => op.type === OperationType.OP_EDIT);
        const showMenu = menuItems.length > 0;
        const widthTmp = showMenu && showEditButton ? 76 : showMenu || showEditButton ? 50 : 0;
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
                {imageViewer?.imageViewDialogVisible && (
                    <ImageViewerDialog
                        editable={imageViewer.editable}
                        onHide={() => {
                            this.setState({
                                imageViewer: {
                                    imageViewDialogVisible: false,
                                    editable: false,
                                    imageBase64: undefined,
                                },
                            });
                        }}
                        base64={imageViewer.imageBase64}
                        viewBase64={imageViewer.imageBase64}
                        header={imageViewer.header}
                        visible
                    />
                )}
                {editorViewer?.visible && (
                    <EditorDialog
                        header={editorViewer.header}
                        editable={editorViewer.editable}
                        value={editorViewer.value}
                        visible={editorViewer?.visible}
                        type={editorViewer?.type}
                        onHide={() => {
                            this.setState({
                                editorViewer: {
                                    visible: false,
                                    editable: false,
                                    value: undefined,
                                    header: undefined,
                                    type: undefined,
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
                                onImageClick={(base64, header) => {
                                    this.setState({
                                        imageViewer: {
                                            imageViewDialogVisible: true,
                                            editable: false,
                                            imageBase64: base64,
                                            header: header,
                                        },
                                    });
                                }}
                                onClick={() => {
                                    this.setState({minimize: false}, () => {
                                        saveObjToCookieGlobal('SUB_GRID_VIEW_MINIMIZE', false);
                                        this.forceUpdate();
                                    });
                                }}
                            />
                        ) : (
                            <div
                                className={`maximalized-sub-view ${this.props?.className ? this.props.className : ''}`}
                            >
                                <DataGrid
                                    onContextMenuPreparing={(e) => {
                                        this.setState({selectedRecordId: e.row.data.ID});
                                    }}
                                    id='selection-data-grid'
                                    ref={(ref) => this.props.handleOnInitialized(ref)}
                                    dataSource={this.props.subView?.headerData}
                                    wordWrapEnabled={rowAutoHeight}
                                    columnAutoWidth={columnAutoWidth}
                                    allowColumnReordering={true}
                                    allowColumnResizing={true}
                                    columnHidingEnabled={false}
                                >
                                    {this.generateHeaderColumns()}
                                    {showEditButton || showMenu ? (
                                        <Column
                                            allowFixing={true}
                                            caption=''
                                            width={widthTmp}
                                            fixed={true}
                                            fixedPosition='right'
                                            cellTemplate={(element, info) => {
                                                ReactDOM.createRoot(element).render(
                                                    <React.Fragment>
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
                                                                e.parentId = UrlUtils.getParentId();
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
                                                                (e) => {
                                                                    if (e.type === OperationType.OP_EDIT) {
                                                                        e.viewId = viewId;
                                                                        e.recordId = recordId;
                                                                        e.parentId = UrlUtils.getParentId();
                                                                    }
                                                                    this.props.handleRightHeadPanelContent(e);
                                                                },
                                                                undefined,
                                                                true
                                                            )}
                                                            rendered={showMenu}
                                                            title={LocUtils.locFromStoreWithDefault(
                                                                'View_AdditionalOptions',
                                                                ''
                                                            )}
                                                        />
                                                    </React.Fragment>
                                                );
                                            }}
                                        />
                                    ) : null}
                                </DataGrid>
                                {this.props.subView?.headerOperationsPPM && !UrlUtils.isEditSpec() && (
                                    <MenuWithButtons
                                        target='.dx-row.dx-data-row.dx-row-lines'
                                        menuRef={this.menuSubGrid}
                                        handleEdit={() =>
                                            this.props.handleOnEditClick({
                                                viewId: viewId,
                                                recordId: recordId,
                                                parentId: UrlUtils.getParentId(),
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
    handleOnInitialized: PropTypes.func.isRequired,
    handleOnEditClick: PropTypes.func,
};

export default SubGridViewComponent;
