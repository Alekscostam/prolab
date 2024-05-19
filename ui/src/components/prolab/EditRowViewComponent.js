/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import DivContainer from '../DivContainer';
import {Panel} from 'primereact/panel';
import ShortcutButton from './ShortcutButton';
import {DataGridUtils} from '../../utils/component/DataGridUtils';
import ConsoleHelper from '../../utils/ConsoleHelper';
import EditListComponent from './EditListComponent';
import {Toast} from 'primereact/toast';
import EditListDataStore from '../../containers/dao/DataEditListStore';
import CrudService from '../../services/CrudService';
import BaseRowComponent from '../../baseContainers/BaseRowComponent';
import UrlUtils from '../../utils/UrlUtils';
import EntryResponseUtils from '../../utils/EntryResponseUtils';
import BlockUi from '../waitPanel/BlockUi';
import {OperationType} from '../../model/OperationType';

export class EditRowViewComponent extends BaseRowComponent {
    constructor(props) {
        super(props);
        this.service = new CrudService();
        this.state = {
            editListField: {},
            editListVisible: false,
            parsedGridView: {},
            parsedGridViewData: {},
            gridViewColumns: [],
            gridViewTypes: [],
            gridViewType: null,
            dataGridStoreSuccess: false,
            selectedRowData: [],
            defaultSelectedRowKeys: [],
            preventSave: false,
        };

        this.editListDataStore = new EditListDataStore();
        this.editListDataGrid = null;

        this.messages = React.createRef();
        this.sidebarRef = React.createRef();
        this.handleAutoFill = this.handleAutoFill.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        super.componentDidUpdate();
    }

    componentDidMount() {
        this.openEditRow();
        super.componentDidMount();
        this.blockUi();
    }

    openEditRow() {
        const editViewId = UrlUtils.getEditViewId();
        const editParentId = UrlUtils.getEditParentId();
        const editRecordId = UrlUtils.getEditRecordId();
        const editKindView = UrlUtils.getEditKindView();
        this.crudService
            .editEntry(editViewId, editRecordId, editParentId, editKindView, '')
            .then((entryResponse) => {
                EntryResponseUtils.run(
                    entryResponse,
                    () => {
                        if (!!entryResponse.next) {
                            this.crudService
                                .edit(editViewId, editRecordId, editParentId, editKindView)
                                .then((editDataResponse) => {
                                    this.props.editDataChange(editDataResponse);
                                })
                                .catch((err) => {
                                    this.showErrorMessages(err);
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
                this.showErrorMessages(err);
                this.unblockUi();
            });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }

    onBlur(inputType, event, groupName, info) {
        this.handleEditRowBlur(inputType, event, groupName, info);
    }
    onChange(inputType, event, groupName, info) {
        this.handleEditRowChange(inputType, event, groupName, info);
    }

    render() {
        const labels = this.props.labels;
        const operations = [];
        const opSave = DataGridUtils.getOrCreateOpButton(operations, labels, OperationType.OP_SAVE, 'Zapisz');
        const opFill = DataGridUtils.getOrCreateOpButton(operations, labels, OperationType.OP_FILL, 'Wypełnij');
        const opCancel = DataGridUtils.getOrCreateOpButton(operations, labels, OperationType.OP_CANCEL, 'Anuluj');
        const editData = this.props.editData;
        const editListVisible = this.state.editListVisible;
        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />
                <BlockUi
                    tag='div'
                    className=''
                    style={{zIndex: '100010'}}
                    blocking={this.state.blocking}
                    loader={this.loader}
                    renderBlockUi={true}
                >
                    {editListVisible && (
                        <EditListComponent
                            visible={editListVisible}
                            field={this.state.editListField}
                            parsedGridView={this.state.parsedGridView}
                            parsedGridViewData={this.state.parsedGridViewData}
                            gridViewColumns={this.state.gridViewColumns}
                            onHide={() => {
                                this.setState({editListVisible: false});
                            }}
                            handleBlockUi={() => {
                                this.blockUi();
                                return true;
                            }}
                            blockUiIfNeccessery={() => {
                                const {blocking, dataGridStoreSuccess} = this.state;
                                const shouldBlock = !blocking && !dataGridStoreSuccess;
                                if (shouldBlock) {
                                    this.blockUi();
                                    return;
                                }
                                if (blocking && dataGridStoreSuccess) {
                                    this.unblockUi();
                                }
                            }}
                            handleUnblockUi={() => this.unblockUi}
                            handleOnChosen={(editListData, field) => {
                                ConsoleHelper('EditRowComponent::handleOnChosen = ', JSON.stringify(editListData));
                                const editInfo = this.props.editData?.editInfo;
                                editInfo.field = field;
                                this.handleEditListRowChange(editInfo, editListData);
                            }}
                            showErrorMessages={(err) => this.showErrorMessages(err)}
                            dataGridStoreSuccess={this.state.dataGridStoreSuccess}
                            selectedRowData={this.state.selectedRowData}
                            defaultSelectedRowKeys={this.state.defaultSelectedRowKeys}
                            handleSelectedRowData={(e) => this.handleSelectedRowData(e)}
                            labels={labels}
                        />
                    )}

                    <form onSubmit={this.handleFormSubmit} noValidate>
                        <div className='row no-gutters'>
                            <div id='view-name' className='col-lg-6 col-md-12'>
                                <div id='label' className='label'>
                                    {this.props.editData?.editInfo?.viewName}
                                </div>
                            </div>
                            <div className='col-lg-6 col-md-12 text-right'>
                                <ShortcutButton
                                    id={'opSave'}
                                    className={`grid-button-panel-big inverse mt-1 mb-1 mr-1 `}
                                    handleClick={this.handleFormSubmit}
                                    title={opSave?.label}
                                    label={opSave?.label}
                                    rendered={opSave}
                                />
                                <ShortcutButton
                                    id={'opFill'}
                                    className={`grid-button-panel-big inverse mt-1 mb-1 mr-1 `}
                                    handleClick={this.handleAutoFill}
                                    title={opFill?.label}
                                    label={opFill?.label}
                                    rendered={opFill}
                                />
                                <ShortcutButton
                                    id={'opCancel'}
                                    className={`grid-button-panel-big normal mt-1 mb-1 mr-1 `}
                                    handleClick={this.handleCancel}
                                    title={opCancel?.label}
                                    label={opCancel?.label}
                                    rendered={opCancel}
                                />
                            </div>
                        </div>
                        <div id='row-edit' className='mt-4 row row-edit-view'>
                            {this.state.preventSave ? (
                                <div id='validation-panel' className='validation-panel justify-content-center'>
                                    {this.fieldsMandatoryLabel}
                                </div>
                            ) : null}
                            {this.renderPanels(editData)}
                        </div>
                    </form>
                </BlockUi>
            </React.Fragment>
        );
    }
    renderFields(panel) {
        return panel.groups.map((group, index) => {
            const hiddenElements = group.fields.filter((field) => field.hidden);
            if (hiddenElements.length === group.fields.length) {
                return null;
            }
            return this.renderGroup(group, index);
        });
    }

    scaleSize(editField, side) {
        const left = editField.panels.find((panel) => panel.panel === 'left');
        const middle = editField.panels.find((panel) => panel.panel === 'middle');
        const right = editField.panels.find((panel) => panel.panel === 'right');
        const panelFounded = editField.panels.find((panel) => panel.panel === side);

        const leftSize = left ? left.size : 0;
        const rightSize = right ? right.size : 0;
        const middleSize = middle ? middle.size : 0;
        if (side === 'bottom') {
            const bottom = editField.panels.find((panel) => panel.panel === side);
            if (bottom) {
                return bottom?.size;
            }
            return undefined;
        }
        if (leftSize + middleSize + rightSize > 100) {
            if (leftSize + middleSize > 100) {
                if (leftSize > 100) {
                    if (side === 'middle' || side === 'right') {
                        return undefined;
                    }
                    return 100;
                } else {
                    if (side === 'middle') {
                        const sizeResult = 100 - leftSize;
                        return sizeResult === 0 ? undefined : sizeResult;
                    }
                    if (side === 'right') {
                        return undefined;
                    }
                    return panelFounded?.size;
                }
            } else {
                if (side === 'right') {
                    const sizeResult = 100 - (leftSize + middleSize);
                    return sizeResult === 0 ? undefined : sizeResult;
                }
                return panelFounded?.size;
            }
        } else {
            return panelFounded?.size;
        }
    }

    renderPanels(editData) {
        return editData?.editFields.map((editField, panelIndex) => {
            const left = editField.panels.find((panel) => panel.panel === 'left');
            const middle = editField.panels.find((panel) => panel.panel === 'middle');
            const right = editField.panels.find((panel) => panel.panel === 'right');
            const bottom = editField.panels.find((panel) => panel.panel === 'bottom');
            const marginsForBottomPanel = this.calcaulateMarginsForBottomPanel(bottom);
            const styleForPanels = {
                paddingRight: '0px',
                paddingLeft: '0px',
                boxShadow: 'none',
                paddingBottom: '0px',
            };
            const sizeLeft = this.scaleSize(editField, 'left') === 0 ? undefined : this.scaleSize(editField, 'left');
            const sizeRight = this.scaleSize(editField, 'right') === 0 ? undefined : this.scaleSize(editField, 'right');
            const sizeMiddle =
                this.scaleSize(editField, 'middle') === 0 ? undefined : this.scaleSize(editField, 'middle');
            const sizeBottom =
                this.scaleSize(editField, 'bottom') === 0 ? undefined : this.scaleSize(editField, 'bottom');
            return (
                <React.Fragment key={`panel_${panelIndex}`}>
                    {sizeLeft && (
                        <div
                            key={`div_col_left_${panelIndex}`}
                            className={`${this.getPanelColSize(sizeLeft)} col-md-6 col-sm-12`}
                        >
                            <Panel
                                key={`edit-row-panel-left-${panelIndex}`}
                                id={`panel_left_${panelIndex}`}
                                style={styleForPanels}
                            >
                                {this.renderFields(left)}
                            </Panel>
                        </div>
                    )}
                    {sizeMiddle && (
                        <div
                            key={`div_col_middle_${panelIndex}`}
                            className={`${this.getPanelColSize(sizeMiddle)} col-md-6 col-sm-12`}
                        >
                            <Panel
                                key={`edit-row-panel-middle-${panelIndex}`}
                                id={`panel_middle_${panelIndex}`}
                                style={styleForPanels}
                            >
                                {this.renderFields(middle)}
                            </Panel>
                        </div>
                    )}
                    {sizeRight && (
                        <div
                            key={`div_col_right_${panelIndex}`}
                            className={`${this.getPanelColSize(sizeRight)} col-md-6 col-sm-12`}
                        >
                            <Panel
                                key={`edit-row-panel-right-${panelIndex}`}
                                id={`panel_right_${panelIndex}`}
                                style={styleForPanels}
                            >
                                {this.renderFields(right)}
                            </Panel>
                        </div>
                    )}
                    {sizeBottom && (
                        <React.Fragment>
                            {marginsForBottomPanel && <div className={marginsForBottomPanel}></div>}
                            <div
                                key={`div_col_bottom_${panelIndex}`}
                                className={`${this.getPanelColSize(sizeBottom)} col-md-6 col-sm-12`}
                            >
                                <Panel
                                    key={`edit-row-panel-bottom-${panelIndex}`}
                                    id={`panel_bottom_${panelIndex}`}
                                    style={styleForPanels}
                                >
                                    {this.renderFields(bottom)}
                                </Panel>
                            </div>
                            {marginsForBottomPanel && <div className={marginsForBottomPanel}></div>}
                        </React.Fragment>
                    )}
                </React.Fragment>
            );
        });
    }

    handleFormSubmit(event) {
        if (event !== undefined) {
            event.preventDefault();
        }
        if (this.validator.allValid()) {
            this.setState({preventSave: false}, () => {
                this.blockUi(this.handleValidForm);
            });
        } else {
            this.setState({preventSave: true}, () => {
                this.validator.showMessages();
                this.showErrorMessages(this.fieldsMandatoryLabel);
                // rerender to show messages for the first time
                this.scrollToError = true;
                this.preventSave = true;
                this.forceUpdate();
            });
        }
    }

    handleValidForm() {
        const editInfo = this.props.editData?.editInfo;
        this.handleEditRowSave(editInfo.viewId, editInfo.recordId, editInfo.parentId);
    }

    handleAutoFill() {
        const editInfo = this.props.editData?.editInfo;
        const kindView = this.state.kindView;
        this.handleAutoFillRowChange(editInfo.viewId, editInfo.recordId, editInfo.parentId, kindView);
    }

    handleCancel() {
        const editInfo = this.props.editData?.editInfo;
        this.handleCancelRowChange(editInfo.viewId, editInfo.recordId, editInfo.parentId);
    }

    getPanelColSize = (size) => {
        const panelSize = size ? size : 'col-lg-4';
        if (panelSize === 'col-lg-4') {
            return panelSize;
        }
        return 'ccol-' + panelSize;
    };

    calcaulateMarginsForBottomPanel = (panel) => {
        if (panel) {
            const margin = Math.floor((100 - parseInt(panel.size)) / 2);
            return 'ccol-' + margin;
        }
    };
    renderGroup(group, groupIndex) {
        return (
            <React.Fragment>
                <div
                    key={'div_panel_' + groupIndex}
                    className={`col-12`}
                    style={{paddingRight: '0px', paddingLeft: '0px', boxShadow: 'none', paddingBottom: '0px'}}
                >
                    <Panel
                        key={`edit-row-panel-${groupIndex}`}
                        id={`group_${groupIndex}`}
                        header={group.groupName}
                        toggleable={group.isExpanded}
                    >
                        <DivContainer>
                            {group.fields?.map((field, index) => {
                                return (
                                    <span key={`field_col_` + index}>{this.renderField(field, index, group.uuid)}</span>
                                );
                            })}
                        </DivContainer>
                    </Panel>
                </div>
            </React.Fragment>
        );
    }
}

EditRowViewComponent.defaultProps = {};

EditRowViewComponent.propTypes = {
    editData: PropTypes.object,
    kindView: PropTypes.string,
    editDataChange: PropTypes.func.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
};

export default EditRowViewComponent;
