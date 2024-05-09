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
import EntryResponseUtils from '../utils/EntryResponseUtils';
import {ViewResponseUtils} from '../utils/ViewResponseUtils';
import ActionButtonWithMenu from '../components/prolab/ActionButtonWithMenu';
import {ConfirmationEditQuitDialog} from '../components/prolab/ConfirmationEditQuitDialog';
import {OperationType} from '../model/OperationType';

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
        const parentId = UrlUtils.getParentId();
        const batchId = UrlUtils.getBatchId();
        const filterId = UrlUtils.getFilterId();
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

        const parentId = UrlUtils.getParentId();
        const batchId = UrlUtils.getBatchId();
        const filterId = UrlUtils.getFilterId();
        const s1 = !DataGridUtils.equalNumbers(this.state.elementId, id);
        const s2 = !DataGridUtils.equalNumbers(this.state.elementFilterId, filterId);
        const s3 = !DataGridUtils.equalString(this.state.elementBatchId, batchId);
        const isBatch = UrlUtils.isBatch();
        const updatePage = (s1 || s2 || s3) && isBatch;
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
            const columnsTmp = this.columnsFromGroupCreate(responseView);
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
                    <div className='font-medium mb-4'>{this.state.parsedView?.editInfo?.viewName}</div>
                </DivContainer>
            </React.Fragment>
        );
    }

    //override
    renderHeaderRight() {
        const {labels} = this.props;
        const operations = [];
        const opSave = DataGridUtils.getOrCreateOpButton(operations, labels, OperationType.OP_SAVE, 'Zapisz');
        const opCancel = DataGridUtils.getOrCreateOpButton(operations, labels, OperationType.OP_CANCEL, 'Anuluj');
        return (
            <React.Fragment>
                <div id='global-top-components'>
                    <ActionButton
                        rendered={!!opSave}
                        label={opSave?.label}
                        className='ml-2'
                        handleClick={() => {
                            this.handleSaveAction();
                        }}
                    />
                    <ActionButton
                        rendered={!!opCancel}
                        label={opCancel?.label}
                        className='ml-2 inverse'
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

    handleSaveAction() {
        const viewIdArg = this.state.elementId;
        const parentIdArg = this.state.elementParentId;
        const globalComponents = document.getElementById('global-top-components');
        globalComponents.click();
        this.handleBatchSave(viewIdArg, parentIdArg, () => {
            this.refreshView();
            this.refreshTable();
        });
    }

    handleBatchSave(viewId, parentId, fncRedirect) {
        this.blockUi();
        const saveElement = this.createObjectToSave(this.state.parsedData);
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
            const rowArray = [];
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
                case OperationType.OP_FORMULA:
                    return (
                        <React.Fragment>
                            {operation.showAlways && (
                                <ActionButtonWithMenu
                                    id={`button_formula_` + index}
                                    className={`${margin}`}
                                    customEventClick={() => this.calculateData()}
                                    iconName={operation?.iconCode || 'mdi-cogs'}
                                    title={operation?.label}
                                />
                            )}
                        </React.Fragment>
                    );
                case OperationType.OP_FILL:
                    return (
                        <React.Fragment>
                            {operation.showAlways && (
                                <ActionButtonWithMenu
                                    id={`button_fill_` + index}
                                    className={`${margin}`}
                                    customEventClick={() => {
                                        this.fillData();
                                    }}
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
        const operations = this.state?.parsedView?.operations;
        if (operations?.length === 0) {
            return <React.Fragment />;
        }
        return (
            <React.Fragment>
                <HeadPanel
                    elementId={this.state.elementId}
                    elementRecordId={this.state.elementRecordId}
                    elementSubViewId={this.state.elementSubViewId}
                    elementKindView={this.state.elementKindView}
                    labels={this.props.labels}
                    selectedRowKeys={this.state.selectedRowKeys}
                    operations={operations}
                    leftContent={this.leftHeadPanelContent()}
                    rightContent={this.rightHeadPanelContent()}
                    handleFormula={() => this.calculateData()}
                    handleFill={() => this.fillData()}
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
    valueIsEqualToId(newObject, oldData) {
        return parseInt(newObject[0].value) === parseInt(oldData.ID);
    }

    fillData(id) {
        this.blockUi();
        const {parsedData} = this.state;
        const viewIdArg = this.state.elementId;
        const parentIdArg = this.state.elementParentId;
        const selectedParsedData = id ? parsedData.filter((el) => el.ID === id) : parsedData;
        const saveElement = this.createObjectToSave(selectedParsedData);
        this.batchService
            .fill(viewIdArg, parentIdArg, saveElement)
            .then((saveResponse) => {
                const parsedDataAfterFill = this.state.parsedData;
                saveResponse?.data?.forEach((cf) => {
                    parsedDataAfterFill.forEach((item) => {
                        item = this.changeFill(cf, item);
                    });
                });
                this.setState(
                    {
                        parsedData: parsedDataAfterFill,
                    },
                    () => {
                        this.refDataGrid?.instance?.getDataSource()?.reload();
                    }
                );
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            })
            .finally(() => {
                this.unblockUi();
            });
    }
    changeFill(filledData, oldData) {
        if (this.valueIsEqualToId(filledData, oldData)) {
            oldData[filledData[1].fieldName] = filledData[1].value;
            return oldData;
        }
    }
    calculateData(id) {
        this.blockUi();
        const {parsedData} = this.state;
        const viewIdArg = this.state.elementId;
        let returnId = undefined;
        let selectedParsedData = parsedData;
        if (id) {
            const foundedElement = parsedData.find((el) => el.ID === id);
            selectedParsedData = parsedData.filter((el) => el.NAG_ID === foundedElement.NAG_ID);
            returnId = foundedElement.ID;
        }
        const saveElement = this.createObjectToSave(selectedParsedData);
        this.batchService
            .calculate(viewIdArg, returnId, saveElement)
            .then((saveResponse) => {
                const parsedDataAfterCalculate = this.state.parsedData;
                saveResponse?.data?.forEach((cf) => {
                    parsedDataAfterCalculate.forEach((item) => {
                        item = this.changeWart(cf, item);
                    });
                });
                this.setState(
                    {
                        parsedData: parsedDataAfterCalculate,
                    },
                    () => {
                        this.refDataGrid?.instance?.getDataSource()?.reload();
                    }
                );
                this.showSuccessMessage(saveResponse.message);
            })
            .catch((err) => {
                this.showGlobalErrorMessage(err);
            })
            .finally(() => {
                this.unblockUi();
            });
    }
    changeWart(calcultedFormula, oldFormula) {
        if (this.valueIsEqualToId(calcultedFormula, oldFormula)) {
            oldFormula[calcultedFormula[1].fieldName] = calcultedFormula[1].value;
            oldFormula._CALC_OK = calcultedFormula[2].value;
            return oldFormula;
        }
    }

    // afterCalculated
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
                            handleSaveAction={() => this.handleSaveAction()}
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
                                this.calculateData(id);
                            }}
                            handleFillRow={(id) => {
                                this.fillData(id);
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
        this.batchService
            .cancel(viewIdArg, parentIdArg, ids)
            .then(() => {
                window.location.href = AppPrefixUtils.locationHrefUrl(`/#/grid-view/${viewIdArg}`);
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
