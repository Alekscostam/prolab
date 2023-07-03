import PropTypes from 'prop-types';
import React from 'react';
import {Breadcrumb} from '../utils/BreadcrumbUtils';
import Constants from '../utils/Constants';
import ConsoleHelper from '../utils/ConsoleHelper';
import LocUtils from '../utils/LocUtils';
import {AttachmentViewDialog} from './attachmentView/AttachmentViewDialog';
import {BaseViewContainer} from '../baseContainers/BaseViewContainer';
import {EntryResponseUtils} from '../utils/EntryResponseUtils';
import {DataGridUtils} from '../utils/component/DataGridUtils';
import ActionButton from '../components/ActionButton';
import {AddSpecContainer} from './AddSpecContainer';

//
//    https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/React/Light/
//

export class ViewContainer extends BaseViewContainer {
    constructor(props) {
        ConsoleHelper('ViewContainer -> constructor');
        super(props);
        this.downloadData = this.downloadData.bind(this);
        this.getViewById = this.getViewById.bind(this);
        this.getDataByViewResponse = this.getDataByViewResponse.bind(this);
        this.additionalTopComponents = this.additionalTopComponents.bind(this);
        this.showAddSpecDialog = this.showAddSpecDialog.bind(this);
        this.getLastId = this.getLastId.bind(this);
        this.handleAddElements = this.handleAddElements.bind(this);
    }

    showAddSpecDialog(recordId) {
        this.unselectAllDataGrid();
        this.setState({visibleAddSpec: true, levelId: recordId});
    }

    renderHeaderRight() {
        let opADD = DataGridUtils.containsOperationsButton(this.state.parsedGridView?.operations, 'OP_ADD_SPEC');
        return (
            <React.Fragment>
                <div>
                    <ActionButton
                        rendered={opADD}
                        className='mt-3 mr-3'
                        label={opADD?.label}
                        handleClick={(e) => {
                            this.showAddSpecDialog();
                        }}
                    />
                </div>
            </React.Fragment>
        );
    }
    getLastId() {
        return 0;
    }

    //override
    createObjectToSave(rowArray) {
        let arrayTmp = [];
        for (let row of rowArray) {
            let rowArray = [];
            for (let field in row) {
                rowArray.push({fieldName: field, value: row[field]});
            }
            arrayTmp.push(rowArray);
        }
        return arrayTmp;
    }

    // overide
    downloadData(viewId, recordId, subviewId, filterId, parentId, viewType) {
        let subviewMode = !!recordId && !!viewId;
        if (subviewMode) {
            this.viewService
                .subViewEntry(viewId, recordId, parentId)
                .then((entryResponse) => {
                    EntryResponseUtils.run(
                        entryResponse,
                        () => {
                            if (!!entryResponse.next) {
                                this.viewService
                                    .getSubView(viewId, recordId, parentId)
                                    .then((subViewResponse) => {
                                        Breadcrumb.updateSubView(subViewResponse, recordId);
                                        if (subViewResponse.viewInfo?.type === 'dashboard') {
                                            const kindView = subViewResponse.viewInfo.kindView;
                                            ConsoleHelper(
                                                `ViewContainer::downloadDashboardData: viewId=${viewId}, recordId=${recordId},  parentId=${parentId}, viewType=${viewType}, kindView=${kindView}`
                                            );
                                            this.setState(
                                                {
                                                    subView: subViewResponse,
                                                    gridViewType: 'dashboard',
                                                    elementKindView: kindView,
                                                    loading: false,
                                                },
                                                () => {
                                                    this.props.handleSubView(subViewResponse);
                                                    this.unblockUi();
                                                }
                                            );
                                        } else {
                                            ConsoleHelper(
                                                `ViewContainer::downloadSubViewData: viewId=${viewId}, subviewId=${subviewId}, recordId=${recordId}, filterId=${filterId}, parentId=${parentId}, viewType=${viewType},`
                                            );
                                            const elementSubViewId = subviewId
                                                ? subviewId
                                                : subViewResponse.subViews[0]?.id;
                                            if (!subViewResponse.subViews || subViewResponse.subViews.length === 0) {
                                                this.showErrorMessages(
                                                    LocUtils.loc(
                                                        this.props.labels,
                                                        'No_Subview',
                                                        'Brak podwidoków - niepoprawna konfiguracja!'
                                                    )
                                                );
                                                window.history.back();
                                                this.unblockUi();
                                                return;
                                            } else {
                                                let subViewsTabs = [];
                                                subViewResponse.subViews.forEach((subView, i) => {
                                                    subViewsTabs.push({
                                                        id: subView.id,
                                                        text: subView.label,
                                                        icon: subView.icon,
                                                        kindView: subView.kindView,
                                                    });
                                                    if (subView.id === parseInt(elementSubViewId)) {
                                                        this.setState({subViewTabIndex: i});
                                                    }
                                                });
                                                subViewResponse.subViewsTabs = subViewsTabs;
                                            }
                                            const currentSubView = subViewResponse.subViewsTabs?.filter(
                                                (i) => i.id === parseInt(elementSubViewId)
                                            );
                                            this.setState(
                                                {
                                                    subView: subViewResponse,
                                                    elementKindView: !!currentSubView
                                                        ? currentSubView[0].kindView
                                                        : this.defaultKindView,
                                                    elementSubViewId: elementSubViewId,
                                                },
                                                () => {
                                                    this.props.handleSubView(subViewResponse);
                                                    this.getViewById(
                                                        elementSubViewId,
                                                        recordId,
                                                        filterId,
                                                        parentId,
                                                        viewType,
                                                        true
                                                    );
                                                }
                                            );
                                        }
                                    })
                                    .catch((err) => {
                                        this.showGlobalErrorMessage(err);
                                        window.history.back();
                                    });
                            } else {
                                this.unblockUi();
                            }
                        },
                        () => this.unblockUi()
                    );
                })
                .catch((err) => {
                    this.showGlobalErrorMessage(err);
                });
        } else {
            ConsoleHelper(
                `ViewContainer::downloadData: viewId=${viewId}, recordId=${recordId}, filterId=${filterId}, parentId=${parentId}, viewType=${viewType},`
            );
            this.setState({subView: null}, () => {
                this.props.handleSubView(null);
                this.getViewById(viewId, recordId, filterId, parentId, viewType, false);
            });
        }
    }

    // overide
    getViewById(viewId, recordId, filterId, parentId, viewType, isSubView) {
        this.setState({loading: true}, () => {
            this.viewService
                .getView(viewId, viewType, recordId, this.state.elementKindView)
                .then((responseView) => {
                    this.processViewResponse(responseView, parentId, recordId, isSubView);
                })
                .catch((err) => {
                    console.error('Error getView in GridView. Exception = ', err);
                    this.setState({loading: false}, () => {
                        this.showGlobalErrorMessage(err); //'Nie udało się pobrać danych strony o id: ' + viewId);
                    });
                });
        });
    }

    // overide
    getDataByViewResponse(responseView, parentId) {
        const initFilterId = responseView?.viewInfo?.filterdId;
        const viewIdArg = this.state.subView == null ? this.state.elementId : this.state.elementSubViewId;
        const parentIdArg = this.state.subView == null ? parentId : this.state.elementRecordId;
        const filterIdArg = !!this.state.elementFilterId ? this.state.elementFilterId : initFilterId;
        const kindViewArg = this.state?.gridViewType?.toUpperCase() === 'cardView' ? 'cardView' : this.state.kindView;
        const dataPackageSize = this.state.parsedGridView?.viewInfo?.dataPackageSize;
        const packageCount =
            !!dataPackageSize || dataPackageSize === 0 ? Constants.DEFAULT_DATA_PACKAGE_COUNT : dataPackageSize;
        if (this.isCardView()) {
            this.setState({loading: true}, () => {
                let res = this.dataCardStore.getDataCardStore(
                    viewIdArg,
                    {
                        skip: 0,
                        take: packageCount,
                    },

                    parentIdArg,
                    filterIdArg,
                    kindViewArg,
                    () => {
                        return null;
                    },
                    () => {
                        this.setState(
                            {
                                dataGridStoreSuccess: true,
                            },
                            () => {
                                this.unblockUi();
                            }
                        );
                    },
                    (err) => {
                        this.unblockUi();
                        this.showErrorMessages(err);
                    }
                );
                if (!!res) {
                    this.setState({
                        loading: false,
                        parsedCardViewData: res,
                    });
                }
                this.unblockUi();
            });
        } else if (this.isGanttView()) {
            const loadSortOptions = this.state.parsedGridView.ganttColumns.filter((c) => {
                return c.sortIndex === 1;
            })[0];
            this.loadGanttData(viewIdArg, parentIdArg, filterIdArg, kindViewArg, loadSortOptions);
        } else {
            this.setState({loading: true}, () => {
                let res = this.dataGridStore.getDataGridStore(
                    viewIdArg,
                    'gridView',
                    parentIdArg,
                    filterIdArg,
                    kindViewArg,
                    () => {
                        this.blockUi();
                        return {
                            select: this.state.select,
                            selectAll: this.state.selectAll,
                        };
                    },
                    () => {
                        this.setState(
                            {
                                select: false,
                                selectAll: false,
                                dataGridStoreSuccess: true,
                            },
                            () => {
                                this.unblockUi();
                            }
                        );
                    },
                    (err) => {
                        this.setState(
                            {
                                select: false,
                                selectAll: false,
                            },
                            () => {
                                this.showErrorMessages(err);
                                this.unblockUi();
                            }
                        );
                    }
                );
                if (!!res) {
                    this.setState({
                        loading: false,
                        parsedGridViewData: res,
                    });
                }
                this.unblockUi();
            });
        }
    }
    //override
    additionalTopComponents() {
        ConsoleHelper('ViewContainer::additionalTopComponents');
        return (
            <div>
                {this.state.attachmentViewInfo ? (
                    <AttachmentViewDialog
                        ref={this.viewContainer}
                        recordId={this.state.attachmentViewInfo.recordId}
                        id={this.state.attachmentViewInfo.viewId}
                        handleRenderNoRefreshContent={(renderNoRefreshContent) => {
                            this.setState({renderNoRefreshContent: renderNoRefreshContent});
                        }}
                        handleShowGlobalErrorMessage={(err) => {
                            this.setState({
                                attachmentViewInfo: undefined,
                            });
                            this.showGlobalErrorMessage(err);
                        }}
                        handleShowErrorMessages={(err) => {
                            this.showErrorMessage(err);
                        }}
                        handleShowEditPanel={(editDataResponse) => {
                            this.handleShowEditPanel(editDataResponse);
                        }}
                        onHide={() =>
                            this.setState({
                                attachmentViewInfo: undefined,
                            })
                        }
                        handleViewInfoName={(viewInfoName) => {
                            this.setState({viewInfoName: viewInfoName});
                        }}
                        handleSubView={(subView) => {
                            this.setState({subView: subView});
                        }}
                        handleOperations={(operations) => {
                            this.setState({operations: operations});
                        }}
                        handleShortcutButtons={(shortcutButtons) => {
                            this.setState({shortcutButtons: shortcutButtons});
                        }}
                        collapsed={this.state.collapsed}
                    />
                ) : null}
                {this.state.visibleAddSpec ? (
                    <AddSpecContainer
                        parsedGridView={this.state?.parsedGridView}
                        ref={this.addSpecContainer}
                        lastId={this.getLastId()}
                        id={this.props.id}
                        visibleAddSpec={this.state.visibleAddSpec}
                        levelId={this.state.levelId}
                        handleAddElements={(el) => this.handleAddElements(el)}
                        onHide={() =>
                            this.setState({
                                visibleAddSpec: false,
                            })
                        }
                        collapsed={this.props.collapsed}
                    />
                ) : null}
            </div>
        );
    }

    handleAddElements(elements) {
        const viewIdArg = this.state.elementSubViewId;
        const parentIdArg = this.state.elementRecordId;
        const saveElement = this.createObjectToSave((this.state.parsedData || []).concat(elements));
        ConsoleHelper(`handleAddElements: element to save = ${JSON.stringify(saveElement)}`);
        this.specSave(viewIdArg, parentIdArg, saveElement, false);
    }

    //override
    render() {
        return <React.Fragment>{super.render()}</React.Fragment>;
    }
}

ViewContainer.defaultProps = {
    viewMode: 'VIEW',
};

ViewContainer.propTypes = {
    id: PropTypes.string.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    handleRenderNoRefreshContent: PropTypes.bool.isRequired,
    handleViewInfoName: PropTypes.func.isRequired,
    handleSubView: PropTypes.func.isRequired,
    handleOperations: PropTypes.func.isRequired,
    handleShortcutButtons: PropTypes.func.isRequired,
    collapsed: PropTypes.bool.isRequired,
};
