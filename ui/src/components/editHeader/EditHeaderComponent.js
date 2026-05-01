/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import DivContainer from '../DivContainer';
import {Panel} from 'primereact/panel';
import ShortcutButton from '../prolab/ShortcutButton';
import SimpleReactValidator from '../validator';
import {Sidebar} from 'primereact/sidebar';
import ConsoleHelper from '../../utils/ConsoleHelper';
import ListOfHintsDialogComponent from '../prolab/ListOfHintsDialogComponent';
import {Toast} from 'primereact/toast';
import CrudService from '../../services/CrudService';
import BaseRowComponent from '../../baseContainers/BaseRowComponent';
import LocUtils from '../../utils/LocUtils';
import {OperationType} from '../../enum/OperationType';
import {TranslationUtils} from '../../utils/TranslationUtils';
import EditRowUtils from '../../utils/EditRowUtils';
import {RequestUtils} from '../../utils/RequestUtils';

let copyDataGlobalTop = null;

export class EditHeaderComponent extends BaseRowComponent {
    constructor(props) {
        super(props);
        this.service = new CrudService();
        this.state = {
            selectedRowKeysFromMainView: this.props.selectedRowKeysFromMainView,
            loading: true,
            editListField: {},
            editListVisible: false,
            parsedGridView: {},
            parsedGridViewData: {},
            gridViewColumns: [],
            gridViewTypes: [],
            gridViewType: null,
            selectedRowData: [],
            defaultSelectedRowKeys: [],
            preventSave: false,
            operationEnabled: true,
        };
        this.editListDataGrid = null;
        this.messages = React.createRef();
        this.sidebarRef = React.createRef();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const visibleEditPanelPrevious = prevProps.visibleEditPanel;
        const visibleEditPanel = this.props.visibleEditPanel;
        console.log('visibleEditPanelPrevious %s %visibleEditPanel', visibleEditPanelPrevious, visibleEditPanel);
        //wykrycie eventu wysunięcia panelu z edycją
        if (visibleEditPanelPrevious === false && visibleEditPanel === true) {
            this.setState({preventSave: false});
        }
        window.sidebarRef = this.sidebarRef;
        super.componentDidUpdate();
    }

    componentDidMount() {
        super.componentDidMount();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        window.sidebarRef = null;
        copyDataGlobalTop = null;
    }
    onCustomClose() {
        if (typeof this.props?.onCustomClose === 'function') {
            this.props.onCustomClose();
        }
    }
    getColSize() {
        const editData = this.props.editData;
        const width = parseInt(this.getWidthSizeSidebar(editData?.editFields).width.split('%').join(''));
        if (width <= 33) {
            return {left: 'ccol-56', right: 'ccol-44'};
        }
        if (width <= 50) {
            return {left: 'ccol-65', right: 'ccol-35'};
        }
        if (width <= 75) {
            return {left: 'col-9', right: 'col-3'};
        } else {
            return {left: 'ccol-80', right: 'ccol-20'};
        }
    }

    render() {
        const operations = this.props?.editData?.operations || [];
        const kindOperation = this.props.editData?.editInfo?.kindOperation;
        const leftColSize = this.getColSize().left;
        const rightColSize = this.getColSize().right;
        const editInfo = this.props.editData?.editInfo;
        const opSave = TranslationUtils.getOpButton(operations, OperationType.OP_SAVE);
        const opFill = TranslationUtils.getOpButton(operations, OperationType.OP_FILL);
        const opCancel = TranslationUtils.getOpButton(operations, OperationType.OP_CANCEL);
        const opClose = TranslationUtils.getOpButton(operations, OperationType.OP_CLOSE);
        const opAttachment = TranslationUtils.getOpButton(operations, OperationType.OP_ATTACHMENTS);
        const visibleEditPanel = this.props.visibleEditPanel;
        const editData = this.props.editData;
        let editListVisible = this.state.editListVisible;
        if (this.props?.copyData) {
            copyDataGlobalTop = this.props.copyData;
        }
        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />
                {editListVisible && (
                    <ListOfHintsDialogComponent
                        editData={this.props.editData}
                        selectedRowKeysFromMainView={this.state.selectedRowKeysFromMainView}
                        field={this.state.editListField}
                        viewId={editInfo?.viewId}
                        recordId={editInfo?.recordId}
                        parentId={editInfo?.parentId}
                        editListBody={RequestUtils.createObjectDataToRequest(this.props)}
                        visible={editListVisible}
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
                        handleUnblockUi={() => this.unblockUi}
                        handleOnChosen={(editListData, field) => {
                            ConsoleHelper('EditHeaderComponent::handleOnChosen = ', JSON.stringify(editListData));
                            let editInfo = this.props.editData?.editInfo;
                            editInfo.field = field;
                            this.props.onEditList(editInfo, editListData);
                            this.setState({editListVisible: false});
                        }}
                        showErrorMessages={(err) => this.props.showErrorMessages(err)}
                        selectedRowData={this.state.selectedRowData}
                        defaultSelectedRowKeys={this.state.defaultSelectedRowKeys}
                    />
                )}
                <Sidebar
                    ref={this.sidebarRef}
                    id='right-sidebar'
                    appendTo={document.body}
                    visible={visibleEditPanel}
                    modal={true}
                    dismissable={false}
                    style={this.getWidthSizeSidebar(editData?.editFields)}
                    onHide={() => this.onCustomClose()}
                    onCustomClose={() => this.onCustomClose()}
                    position='right'
                    icons={() => (
                        <React.Fragment>
                            <div className='row'>
                                <div className={leftColSize}>
                                    <div className='row ' style={{flex: 'auto'}}>
                                        <div id='label' className='label col-lg-12 '>
                                            <div className=''>{editData?.editInfo?.viewName}</div>
                                        </div>
                                        {kindOperation?.toUpperCase() === 'COPY' ? (
                                            <div id='label' className='label col-lg-12' style={{fontSize: '1em'}}>
                                                {LocUtils.locFromStoreWithDefault('Copying', 'Kopiowanie')}{' '}
                                                {copyDataGlobalTop?.copyCounter?.counter} /{' '}
                                                {copyDataGlobalTop?.copyOptions?.numberOfCopy}{' '}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                                <div className={rightColSize} style={{paddingLeft: '0px'}}>
                                    <div id='buttons' style={{textAlign: 'right'}}>
                                        {opSave && (
                                            <ShortcutButton
                                                id={'opSave'}
                                                className={`grid-button-panel inverse mt-1 mb-1 mr-1`}
                                                handleClick={this.handleSave}
                                                title={opSave?.label}
                                                label={opSave?.label}
                                                rendered={opSave}
                                                disabled={!this.state.operationEnabled}
                                            />
                                        )}
                                        {opFill && EditRowUtils.hasAnyToFillField(editData) && (
                                            <ShortcutButton
                                                id={'opFill'}
                                                className={`grid-button-panel inverse mt-1 mb-1 mr-1`}
                                                handleClick={this.handleAutoFill}
                                                title={opFill?.label}
                                                label={opFill?.label}
                                                rendered={opFill}
                                                disabled={!this.state.operationEnabled}
                                            />
                                        )}
                                        {opCancel && (
                                            <ShortcutButton
                                                id={'opCancel'}
                                                className={`grid-button-panel normal mt-1 mb-1 mr-1 col-lg-12`}
                                                handleClick={() => {
                                                    const editInfo = this.props.editData?.editInfo;
                                                    if (editInfo) {
                                                        this.props.onHide(
                                                            !visibleEditPanel,
                                                            editInfo.viewId,
                                                            editInfo.recordId,
                                                            editInfo.parentId
                                                        );
                                                    }
                                                }}
                                                title={opCancel?.label}
                                                label={opCancel?.label}
                                                rendered={opCancel}
                                                disabled={!this.state.operationEnabled}
                                            />
                                        )}
                                        {opClose && (
                                            <ShortcutButton
                                                id={'opClose'}
                                                className={`grid-button-panel normal mt-1 mb-1 mr-1 col-lg-12`}
                                                handleClick={() => {
                                                    const editInfo = this.props.editData?.editInfo;
                                                    if (editInfo) {
                                                        this.props.onHide(
                                                            !visibleEditPanel,
                                                            editInfo.viewId,
                                                            editInfo.recordId,
                                                            editInfo.parentId
                                                        );
                                                    }
                                                }}
                                                title={opClose?.label}
                                                label={opClose?.label}
                                                rendered={opClose}
                                            />
                                        )}
                                        {opAttachment && (
                                            <ShortcutButton
                                                id={'opAttachment'}
                                                className={`grid-button-panel normal mt-1 mb-1 mr-1 col-lg-12`}
                                                handleClick={this.handleAttachment}
                                                title={opAttachment?.label}
                                                label={opAttachment?.label}
                                                rendered={opAttachment}
                                                disabled={!this.state.operationEnabled}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    )}
                >
                    <form onSubmit={this.handleFormSubmit} noValidate>
                        <div id='row-edit' className='row-edit-container'>
                            {this.renderFields(editData)}
                        </div>
                    </form>
                </Sidebar>
            </React.Fragment>
        );
    }

    renderGroup(group, groupIndex) {
        if (EditRowUtils.hasAnyVisibleField(group)) {
            return (
                <React.Fragment key={`fragment-${groupIndex}`}>
                    <Panel
                        key={`key_group_${groupIndex}`}
                        id={`group_${groupIndex}`}
                        className={'mb-6'}
                        header={group.groupName}
                        toggleable={group.isExpanded}
                    >
                        <DivContainer key={'div-group-' + groupIndex}>
                            {group.fields?.map((field, index) => {
                                field.readOnly = this.isReadOnly();
                                return this.renderField(field, index, group.uuid);
                            })}
                        </DivContainer>
                    </Panel>
                </React.Fragment>
            );
        }
        return <React.Fragment></React.Fragment>;
    }
}

EditHeaderComponent.defaultProps = {};

EditHeaderComponent.propTypes = {
    visibleEditPanel: PropTypes.bool.isRequired,
    editData: PropTypes.object.isRequired,
    kindView: PropTypes.string,
    showErrorMessages: PropTypes.func.isRequired,
    onAfterStateChange: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    onSave: PropTypes.func.isRequired,
    onAutoFill: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onEditList: PropTypes.func,
    onHide: PropTypes.func.isRequired,
    validator: PropTypes.instanceOf(SimpleReactValidator).isRequired,
};

export default EditHeaderComponent;
