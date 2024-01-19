import PropTypes from 'prop-types';
import React from 'react';
import BaseContainer from '../baseContainers/BaseContainer';
import HeadPanel from '../components/prolab/HeadPanel';
import ShortcutsButton from '../components/prolab/ShortcutsButton';
import CrudService from '../services/CrudService';
import {Breadcrumb} from '../utils/BreadcrumbUtils';
import {DataGridUtils} from '../utils/component/DataGridUtils';
import {ViewValidatorUtils} from '../utils/parser/ViewValidatorUtils';
import UrlUtils from '../utils/UrlUtils';
import Constants from '../utils/Constants';
import ConsoleHelper from '../utils/ConsoleHelper';
import DataTreeStore from './dao/DataTreeStore';
import AppPrefixUtils from '../utils/AppPrefixUtils';
import ActionButton from '../components/ActionButton';
import DivContainer from '../components/DivContainer';
import GridViewComponent from './dataGrid/GridViewComponent';
import BatchService from '../services/BatchService';
import {EntryResponseUtils} from '../utils/EntryResponseUtils';
import {ViewResponseUtils} from '../utils/ViewResponseUtils';
import ActionButtonWithMenu from '../components/prolab/ActionButtonWithMenu';
import {ConfirmationEditQuitDialog} from '../components/prolab/ConfirmationEditQuitDialog';

//
//    https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/React/Light/
//
export class BatchContainer extends BaseContainer {
    _isMounted = false;

    constructor(props) {
        ConsoleHelper('EditSpecContainer -> constructor');
        super(props);
        this.batchService = new BatchService();
        this.crudService = new CrudService();
        this.dataTreeStore = new DataTreeStore();
        this.refTreeList = React.createRef();
        this.refDataGrid = React.createRef();
        this.messages = React.createRef();
        this.state = {
            loading: true,
            isChanged: undefined,
            packageRows: 30,
            levelId: undefined,
            renderConfirmationEditQuitDialog: false,
            visibleAddSpec: false,
            elementParentId: null,
            elementBatchId: null,
            elementFilterId: null,
            dataGridStoreSuccess: false,
            parsedData: null,
            columns: [],
            selectedRowKeys: [],
        };
        this.getViewById = this.getViewById.bind(this);
        this.downloadData = this.downloadData.bind(this);
        this.handleSelectedRowData = this.handleSelectedRowData.bind(this);
        this.blockUi();
    }

    componentDidMount() {
        this._isMounted = true;
        let id = UrlUtils.getViewIdFromURL();
        if (id === undefined) {
            id = this.props.id;
        }
        this.props.handleRenderNoRefreshContent(false);
        const parentId = UrlUtils.getURLParameter('parentId');
        const batchId = UrlUtils.getURLParameter('batchId');
        const filterId = UrlUtils.getURLParameter('filterId');
        ConsoleHelper(
            `BatchContainer::componentDidMount -> id=${id}, parentId = ${parentId} batchId = ${batchId} filterId = ${filterId}`
        );
        this.setState({
            elementParentId: parentId,
            elementBatchId: batchId,
            elementFilterId: filterId,
            dataGridStoreSuccess: false,
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        let id = UrlUtils.getViewIdFromURL();
        if (id === undefined) {
            id = this.props.id;
        }

        const parentId = UrlUtils.getURLParameter('parentId');
        const batchId = UrlUtils.getURLParameter('batchId');
        const filterId = UrlUtils.getURLParameter('filterId');
        const s1 = !DataGridUtils.equalNumbers(this.state.elementId, id);
        const s2 = !DataGridUtils.equalNumbers(this.state.elementFilterId, filterId);
        const s3 = !DataGridUtils.equalString(this.state.elementBatchId, batchId);

        const updatePage = s1 || s2 || s3;
        ConsoleHelper(
            'BatchContainer::componentDidUpdate -> updateData={%s} updatePage={%s} id={%s} id={%s} s1={%s} s2={%s} s3={%s}',
            updatePage,
            prevProps.id,
            this.props.id,
            s1,
            s2,
            s3
        );
        if (updatePage) {
            this.setState(
                {
                    elementId: id,
                    elementParentId: parentId,
                    elementBatchId: batchId,
                    dataGridStoreSuccess: false,
                    elementFilterId: filterId, //z dashboardu
                },
                () => {
                    this.downloadData(
                        id,
                        this.state.elementParentId,
                        this.state.elementBatchId,
                        this.state.elementFilterId
                    );
                }
            );
        } else {
            return false;
        }
    }

    downloadData(viewId, parentId, batchId, filterId) {
        ConsoleHelper(
            `BatchContainer::downloadData: viewId=${viewId}, parentId=${parentId}, batchId=${batchId}, filterId=${filterId}`
        );
        this.getViewById(viewId, parentId, batchId, filterId);
    }

    getViewById(viewId, parentId, batchId) {
        this.setState({loading: true}, () => {
            this.batchService
                .getViewEntry(viewId, parentId)
                .then((entryResponse) => {
                    EntryResponseUtils.run(
                        entryResponse,
                        () => {
                            if (!!entryResponse.next) {
                                this.batchService
                                    .getView(viewId, parentId)
                                    .then((responseView) => {
                                        const transformedResponse = ViewResponseUtils.editInfoToViewInfo(
                                            responseView,
                                            'gridView',
                                            null
                                        );
                                        this.processingViewResponse(transformedResponse, parentId, batchId);
                                    })
                                    .catch((err) => {
                                        console.error('Error getView in Batch. Exception = ', err);
                                        this.setState({loading: false}, () => {
                                            this.showGlobalErrorMessage(err); //'Nie udało się pobrać danych strony o id: ' + viewId);
                                        });
                                    })
                                    .finally(() => {
                                        this.unblockUi();
                                    });
                            } else {
                                this.unblockUi();
                            }
                        },
                        () => this.unblockUi()
                    );
                })
                .catch((err) => {
                    console.error('Error getViewEntry in BatchSpec. Exception = ', err);
                    this.setState({loading: false}, () => {
                        this.showGlobalErrorMessage(err); //'Nie udało się pobrać danych strony o id: ' + viewId);
                    });
                })
                .finally(() => {
                    this.unblockUi();
                });
        });
    }

    processingViewResponse(responseView, parentId, batchId) {
        if (this._isMounted) {
            ViewValidatorUtils.validation(responseView);
            let id = UrlUtils.getViewIdFromURL();
            if (id === undefined) {
                id = this.props.id;
            }
            Breadcrumb.updateView(responseView.viewInfo, id, batchId);
            let columnsTmp = [];
            let columnOrderCounter = 0;
            new Array(responseView.gridColumns).forEach((gridColumns) => {
                gridColumns?.forEach((group) => {
                    group.columns?.forEach((column) => {
                        column.groupName = group.groupName;
                        column.freeze = group.freeze;
                        column.columnOrder = columnOrderCounter++;
                        columnsTmp.push(column);
                    });
                });
            });

            Breadcrumb.currentBreadcrumbAsUrlParam();
            this.setState(
                () => ({
                    parsedView: responseView,
                    columns: columnsTmp,
                }),
                () => {
                    const viewIdArg = this.state.elementId;
                    this.batchService.getData(viewIdArg, parentId).then((res) => {
                        this.handleResponseFromGetData(res);
                    });
                }
            );
        }
    }

    handleResponseFromGetData(res) {
        this.setState({
            loading: false,
            dataGridStoreSuccess: true,
            parsedData: res.data,
        });
    }
    componentWillUnmount() {
        super.componentWillUnmount();
    }

    // //override
    renderGlobalTop() {
        return <React.Fragment></React.Fragment>;
    }

    //override
    renderHeaderLeft() {
        return (
            <React.Fragment>
                <DivContainer id='header-left'>
                    <div className='font-medium mb-4'>{this.state.parsedView.editInfo?.viewName}</div>
                </DivContainer>
            </React.Fragment>
        );
    }

    //override
    renderHeaderRight() {
        const operations = [];
        operations.push({type: 'OP_SAVE', label: 'Zapisz'});
        operations.push({type: 'OP_CANCEL', label: 'Anuluj'});
        const opSave = DataGridUtils.containsOperationsButton(operations, 'OP_SAVE');
        const opCancel = DataGridUtils.containsOperationsButton(operations, 'OP_CANCEL');
        return (
            <React.Fragment>
                <div id='global-top-components'>
                    <ActionButton
                        rendered={!!opSave}
                        label={opSave?.label}
                        className='ml-2'
                        handleClick={() => {
                            const viewIdArg = this.state.elementId;
                            const parentIdArg = this.state.elementParentId;
                            const globalComponents = document.getElementById('global-top-components');
                            globalComponents.click();
                            this.handleBatchSave(viewIdArg, parentIdArg, () => {
                                this.refreshView();
                                this.refreshTable();
                            });
                        }}
                    />
                    <ActionButton
                        rendered={!!opCancel}
                        label={opCancel?.label}
                        className='ml-2'
                        handleClick={() => {
                            this.setState({
                                renderConfirmationEditQuitDialog: true,
                            });
                        }}
                    />
                </div>
            </React.Fragment>
        );
    }

    handleBatchSave(viewId, parentId, fncRedirect) {
        this.blockUi();
        ConsoleHelper(`handlebatchSave: viewId = ${viewId} parentId = ${parentId}`);
        const saveElement = this.createObjectToSave(this.state.parsedData);
        ConsoleHelper(`handlebatchSave: element to save = ${JSON.stringify(saveElement)}`);
        this.batchSave(viewId, parentId, saveElement, false, fncRedirect);
    }

    getByNagId(nagId) {
        return this.state.parsedData.filter((el) => el.NAG_ID === nagId);
    }
    shouldBeNegative(el) {
        return el === '0' || el === 0 || el === undefined || el === null || el === false || el === '';
    }
    //override
    createObjectToSave(rowArray) {
        const booleanLogicColumns = this.state.columns.filter((el) => el.type === 'L');
        const booleanNumberColumns = this.state.columns.filter((el) => el.type === 'B');
        const imageColumns = this.state.columns.filter((el) => el.type === 'I');
        let arrayTmp = [];
        for (let row of rowArray) {
            Object.keys(row).forEach((el) => {
                imageColumns.forEach((image) => {
                    if (image.fieldName === el) {
                        row[el] = this.shouldBeNegative(row[el]) ? null : row[el];
                    }
                });
            });
            Object.keys(row).forEach((el) => {
                booleanLogicColumns.forEach((bool) => {
                    if (bool.fieldName === el) {
                        if (!(row[el] === 'T' || row[el] === 'N')) {
                            row[el] ? (row[el] = 'T') : (row[el] = 'N');
                        }
                    }
                });
            });
            Object.keys(row).forEach((el) => {
                booleanNumberColumns.forEach((bool) => {
                    if (bool.fieldName === el) {
                        row[el] = this.shouldBeNegative(row[el]) ? 0 : 1;
                    }
                });
            });
            let rowArray = [];
            for (let field in row) {
                rowArray.push({fieldName: field, value: row[field]});
            }
            arrayTmp.push(rowArray);
        }
        return arrayTmp;
    }
    unselectAllDataGrid() {}
    //override
    renderHeaderContent() {
        return <React.Fragment />;
    }
    leftHeadPanelContent = () => {
        return (
            <React.Fragment>
                {this.state.parsedView?.operations?.map((operation, index) => {
                    return <div key={index}>{this.renderButton(operation, index)}</div>;
                })}
            </React.Fragment>
        );
    };
    rightHeadPanelContent = () => {
        return (
            <React.Fragment>
                <ShortcutsButton
                    handleClick={(e) => this.handleRightHeadPanelContent(e)}
                    items={this.state.parsedView?.shortcutButtons}
                    maxShortcutButtons={5}
                />
            </React.Fragment>
        );
    };

    renderButton(operation, index) {
        const margin = Constants.DEFAULT_MARGIN_BETWEEN_BUTTONS;
        if (!!operation.type) {
            switch (operation.type?.toUpperCase()) {
                case 'OP_FORMULA':
                    return (
                        <React.Fragment>
                            {operation.showAlways && (
                                <ActionButtonWithMenu
                                    id={`button_formula_` + index}
                                    className={`${margin}`}
                                    customEventClick={() => alert('Czekamy na API dla Calculate')}
                                    iconName={operation?.iconCode || 'mdi-cogs'}
                                    title={operation?.label}
                                />
                            )}
                        </React.Fragment>
                    );
                case 'OP_FILL':
                    return (
                        <React.Fragment>
                            {operation.showAlways && (
                                <ActionButtonWithMenu
                                    id={`button_fill_` + index}
                                    className={`${margin}`}
                                    customEventClick={() => alert('Czekamy na API dla fill')}
                                    iconName={operation?.iconCode || 'mdi-cogs'}
                                    title={operation?.label}
                                />
                            )}
                        </React.Fragment>
                    );
                default:
                    return null;
            }
        }
    }
    renderHeadPanel = () => {
        return (
            <React.Fragment>
                <HeadPanel
                    elementId={this.state.elementId}
                    elementRecordId={this.state.elementRecordId}
                    elementSubViewId={this.state.elementSubViewId}
                    elementKindView={this.state.elementKindView}
                    labels={this.props.labels}
                    selectedRowKeys={this.state.selectedRowKeys}
                    operations={this.state.parsedView?.operations}
                    leftContent={this.leftHeadPanelContent()}
                    rightContent={this.rightHeadPanelContent()}
                    handleFormula={() => {
                        alert('Czekamy na API dla Calculate');
                        // this.prepareCalculateFormula();
                    }}
                    handleFill={() => {
                        alert('Czekamy na API dla FILL');
                        // this.fill();
                    }}
                    handleUnblockUi={() => this.unblockUi()}
                    showErrorMessages={(err) => this.showErrorMessages(err)}
                    handleBlockUi={() => this.blockUi()}
                />
            </React.Fragment>
        );
    };

    handleSelectedRowData(selectedRowData) {
        this.setState({selectedRowKeys: selectedRowData.selectedRowKeys});
    }
    //override
    renderContent = () => {
        return (
            <React.Fragment>
                {this.state.loading ? null : (
                    <React.Fragment>
                        <ConfirmationEditQuitDialog
                            onHide={() => {
                                this.setState({
                                    renderConfirmationEditQuitDialog: false,
                                });
                            }}
                            visible={this.state.renderConfirmationEditQuitDialog}
                            labels={this.props.labels}
                            onAccept={this.batchCancel}
                        />
                        <GridViewComponent
                            id={this.props.id}
                            elementParentId={this.state.elementParentId}
                            unblockUi={() => this.unblockUi()}
                            elementSubViewId={null}
                            handleOnDataGrid={(ref) => (this.refDataGrid = ref)}
                            parsedGridView={this.state.parsedView}
                            parsedGridViewData={this.state.parsedData}
                            gridViewColumns={this.state.columns}
                            cellModeEnabled={true}
                            handleMaxPackgeCount={() => {
                                this.setState({packageRows: 500});
                            }}
                            handleFillDownParsedData={(parsedData) => {
                                this.setState({
                                    parsedData,
                                    packageRows: Constants.DEFAULT_DATA_PACKAGE_COUNT,
                                });
                            }}
                            packageRows={this.state.packageRows}
                            labels={this.props.labels}
                            focusedRowEnabled={true}
                            hoverStateEnabled={true}
                            modifyParsedGridViewData={(newCopyRow) => {
                                const replacedParsedData = [];
                                this.state.parsedData.forEach((el) => {
                                    if (el.ID === newCopyRow.ID) {
                                        el = newCopyRow;
                                    }
                                    replacedParsedData.push(el);
                                });
                                this.setState({
                                    parsedData: replacedParsedData,
                                });
                            }}
                            handleBlockUi={() => {
                                this.blockUi();
                            }}
                            getRef={() => {
                                return this.refDataGrid;
                            }}
                            handleUnblockUi={() => {
                                this.unblockUi();
                            }}
                            showSelection={true}
                            handleUnselectAll={() => {}}
                            defaultSelectedRowKeys={this.props.defaultSelectedRowKeys}
                            handleSelectedRowKeys={(e) => this.handleSelectedRowData(e)}
                            showFilterRow={true}
                            showErrorMessages={(err) => this.showErrorMessages(err)}
                            dataGridStoreSuccess={this.state.dataGridStoreSuccess}
                            allowSelectAll={false}
                            handleFormulaRow={(id) => {
                                alert('Czekamy na API dla Calculate');
                                // this.prepareCalculateFormula(id);
                            }}
                            handleFillRow={(id) => {
                                alert('Czekamy na API dla FILL');
                                // this.fill(id);
                            }}
                        />
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    };
    batchCancel = () => {
        this.blockUi();
        const viewIdArg = this.state.elementId;
        const parentIdArg = this.state.elementParentId;
        const ids = this.state.parsedData.map((el) => el.ID);
        this.setState({
            renderConfirmationEditQuitDialog: false,
        });
        this.batchService
            .cancel(viewIdArg, parentIdArg, ids)
            .then(() => {
                window.history.back();
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            })
            .finally(() => {
                this.unblockUi();
            });
    };
    //override
    handleEditRowChange(inputType, event, rowId, info) {}

    getMessages() {
        return this.messages;
    }
}

BatchContainer.defaultProps = {
    viewMode: 'VIEW',
};

BatchContainer.propTypes = {
    id: PropTypes.string.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    collapsed: PropTypes.bool.isRequired,
};
