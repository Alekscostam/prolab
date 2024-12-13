import React, {useState} from 'react';
import PropTypes from 'prop-types';
import ShortcutButton from './ShortcutButton';
import Constants from '../../utils/Constants';
import ActionButtonWithMenu from './ActionButtonWithMenu';
import {sessionPrelongFnc} from '../../App';
import {OperationType} from '../../enum/OperationType';
import {ConfirmDialog} from 'primereact/confirmdialog';

export const OperationsButtons = (props) => {
    const [confirmationVisible, setConfirmationVisible] = useState();
    const [accept, setAccept] = useState(() => {});
    const [hide, setHide] = useState(() => {});

    const renderOperationsButton = (operations) => {
        const info = props.info;
        const margin = props.margin;
        const inverseColor = props.inverseColor;
        const buttonShadow = props.buttonShadow;
        const atLeastOneSelected = props.atLeastOneSelected;
        if (operations && !!operations.type) {
            switch (operations.type?.toUpperCase()) {
                case OperationType.OP_EDIT:
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    id={`${info?.column.headerId}_menu_button`}
                                    className={`action-button-with-menu ${
                                        inverseColor ? `inverse` : `normal`
                                    } ${margin}`}
                                    iconName={operations?.iconCode || 'mdi-pencil'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    title={operations.label}
                                    handleClick={(e) =>
                                        afterClickOperation(() => props.handleEdit(Object.assign(e, operations)))
                                    }
                                />
                            </React.Fragment>
                        );
                    break;
                case OperationType.OP_EDIT_SPEC:
                    if (!!atLeastOneSelected || (!atLeastOneSelected && !!operations.showAlways)) {
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    id={`${info?.column.headerId}_menu_button`}
                                    className={`action-button-with-menu ${
                                        inverseColor ? `inverse` : `normal`
                                    } ${margin}`}
                                    iconName={operations?.iconCode || 'mdi-pencil'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    title={operations.label}
                                    hrefSpecView={props.hrefSpecView}
                                    handleClick={(e) => {
                                        e.selectAll = !atLeastOneSelected && !!operations.showAlways;

                                        return afterClickOperation(() =>
                                            props.handleEditSpec(Object.assign(e, operations))
                                        );
                                    }}
                                />
                            </React.Fragment>
                        );
                    }
                    break;
                case OperationType.OP_ADDSPEC_SPEC:
                    if (!!atLeastOneSelected || (!atLeastOneSelected && !!operations.showAlways)) {
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    id={`${info?.column.headerId}_menu_button`}
                                    className={`action-button-with-menu ${
                                        inverseColor ? `inverse` : `normal`
                                    } ${margin}`}
                                    iconName={operations?.iconCode || 'mdi-pencil'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    title={operations.label}
                                    handleClick={(e) => {
                                        e.selectAll = !atLeastOneSelected && !!operations.showAlways;
                                        return afterClickOperation(() =>
                                            props.handleAddSpecSpec(Object.assign(e, operations))
                                        );
                                    }}
                                />
                            </React.Fragment>
                        );
                    }
                    break;
                case OperationType.OP_SUBVIEWS:
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    id={`${info?.column.headerId}_menu_button`}
                                    className={`action-button-with-menu ${
                                        inverseColor ? `inverse` : `normal`
                                    } ${margin}`}
                                    iconName={operations?.iconCode || 'mdi-playlist-plus'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    title={operations.label}
                                    handleClick={() => {
                                        afterClickOperation(() => props.handleBlockUi());
                                    }}
                                    href={props.hrefSubview}
                                />
                            </React.Fragment>
                        );
                    break;
                case OperationType.OP_DELETE:
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) =>
                                        afterClickOperation(() => props.handleDelete(Object.assign(e, operations)))
                                    }
                                    iconName={operations?.iconCode || 'mdi-delete'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case OperationType.OP_DOWNLOAD:
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) =>
                                        afterClickOperation(() => props.handleDownload(Object.assign(e, operations)))
                                    }
                                    iconName={operations?.iconCode || 'mdi-help-circle'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case OperationType.OP_RESTORE:
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) =>
                                        afterClickOperation(() => props.handleRestore(Object.assign(e, operations)))
                                    }
                                    iconName={operations?.iconCode || 'mdi-restore'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;

                case OperationType.OP_COPY:
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) =>
                                        afterClickOperation(() => props.handleCopy(Object.assign(e, operations)))
                                    }
                                    iconName={operations?.iconCode || 'mdi-content-copy'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case OperationType.OP_ARCHIVE:
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) =>
                                        afterClickOperation(() => props.handleArchive(Object.assign(e, operations)))
                                    }
                                    iconName={operations?.iconCode || 'mdi-archive'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case OperationType.OP_PUBLISH:
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) =>
                                        afterClickOperation(() => props.handlePublish(Object.assign(e, operations)))
                                    }
                                    iconName={operations?.iconCode || 'mdi-publish'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case OperationType.OP_FORMULA:
                    if (shouldShowOpFormula(operations))
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) => {
                                        afterClickOperation(() => props.handleFormula(Object.assign(e, operations)));
                                    }}
                                    iconName={operations?.iconCode || 'mdi-help-circle'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case OperationType.OP_HISTORY:
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) =>
                                        afterClickOperation(() => props.handleHistory(Object.assign(e, operations)))
                                    }
                                    iconName={operations?.iconCode || 'mdi-help-circle'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case OperationType.OP_ATTACHMENTS:
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) =>
                                        afterClickOperation(() => props.handleAttachments(Object.assign(e, operations)))
                                    }
                                    iconName={operations?.iconCode || 'mdi-help-circle'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case OperationType.OP_ADD_LEVEL:
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) =>
                                        afterClickOperation(() => props.handleAddLevel(Object.assign(e, operations)))
                                    }
                                    iconName={operations?.iconCode || 'mdi-plus-box-multiple-outline'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case OperationType.OP_UP:
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) =>
                                        afterClickOperation(() => props.handleUp(Object.assign(e, operations)))
                                    }
                                    iconName={operations?.iconCode || 'mdi-arrow-up-thin'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case OperationType.OP_DOWN:
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) =>
                                        afterClickOperation(() => props.handleDown(Object.assign(e, operations)))
                                    }
                                    iconName={operations?.iconCode || 'mdi-arrow-down-thin'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case OperationType.OP_FILL:
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) =>
                                        afterClickOperation(() => props.handleFill(Object.assign(e, operations)))
                                    }
                                    iconName={operations?.iconCode || 'mdi-arrow-down-thin'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case OperationType.OP_TREE_EXPAND:
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) =>
                                        afterClickOperation(() => props.handleExpand(Object.assign(e, operations)))
                                    }
                                    iconName={operations?.iconCode || 'mdi-arrow-down-thin'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case OperationType.OP_TREE_COLLAPSE:
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) =>
                                        afterClickOperation(() => props.handleCollapse(Object.assign(e, operations)))
                                    }
                                    iconName={operations?.iconCode || 'mdi-arrow-down-thin'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case OperationType.OP_TREE_CHECK:
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) =>
                                        afterClickOperation(() => props.handleCheck(Object.assign(e, operations)))
                                    }
                                    iconName={operations?.iconCode || 'mdi-arrow-down-thin'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case OperationType.OP_TREE_UNCHECK:
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) =>
                                        afterClickOperation(() => props.handleUncheck(Object.assign(e, operations)))
                                    }
                                    iconName={operations?.iconCode || 'mdi-arrow-down-thin'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                default:
                    return null;
            }
        }
    };

    const afterClickOperation = (operationSelectedFnc) => {
        if (sessionPrelongFnc) {
            sessionPrelongFnc();
        }
        if (typeof operationSelectedFnc === 'function') {
            operationSelectedFnc();
        }
        // setConfirmationVisible(true);
    };
    const shouldShowOpFormula = (operations) => {
        const atLeastOneSelected = props.atLeastOneSelected;
        const isFromHeader = props.isFromHeader;
        let showOperation = !!atLeastOneSelected;
        if (isFromHeader && !!atLeastOneSelected) {
            showOperation = !operations.showAlways;
        }
        return showOperation;
    };

    const menuItems = props.operationList.map((i) => {
        let url = undefined;
        switch (i.type?.toUpperCase()) {
            case OperationType.OP_EDIT_SPEC:
                url = props.hrefSpecView;
                break;
            case OperationType.OP_SUBVIEWS:
                url = props.hrefSubview;
                break;
            default:
                url = undefined;
                break;
        }
        return {
            label: i.label,
            icon: `mdi ${i.iconCode}`,
            url: url,
            command: () => {
                switch (i.type?.toUpperCase()) {
                    case OperationType.OP_EDIT:
                        return props.handleEdit(i);
                    case OperationType.OP_EDIT_SPEC:
                        return props.handleEditSpec(i);
                    case OperationType.OP_ADDSPEC_SPEC:
                        return props.handleAddSpecSpec(i);
                    case OperationType.OP_SUBVIEWS:
                        return props.handleHrefSubview(i);
                    case OperationType.OP_DELETE:
                        return props.handleDelete(i);
                    case OperationType.OP_RESTORE:
                        return props.handleRestore(i);
                    case OperationType.OP_COPY:
                        return props.handleCopy(i);
                    case OperationType.SK_DOCUMENT:
                        return props.handleDocuments(i);
                    case OperationType.SK_PLUGIN:
                        return props.handlePlugins(i);
                    case OperationType.OP_ARCHIVE:
                        return props.handleArchive(i);
                    case OperationType.OP_PUBLISH:
                        return props.handlePublish(i);
                    case OperationType.OP_FORMULA:
                        return props.handleFormula(i);
                    case OperationType.OP_DOWNLOAD:
                        return props.handleDownload(i);
                    case OperationType.OP_HISTORY:
                        return props.handleHistory(i);
                    case OperationType.OP_ATTACHMENTS:
                        return props.handleAttachments(i);
                    case OperationType.OP_BATCH:
                    case OperationType.SK_BATCH:
                        return props.handleBatch(i);
                    case OperationType.OP_ADD_LEVEL:
                        return props.handleAddLevel(i);
                    case OperationType.OP_UP:
                        return props.handleUp(i);
                    case OperationType.OP_DOWN:
                        return props.handleDown(i);
                    case OperationType.OP_FILL:
                        return props.handleFill(i);
                    case OperationType.OP_TREE_EXPAND:
                        return props.handleExpand(i);
                    case OperationType.OP_TREE_COLLAPSE:
                        return props.handleCollapse(i);
                    case OperationType.OP_TREE_CHECK:
                        return props.handleCheck(i);
                    case OperationType.OP_TREE_UNCHECK:
                        return props.handleUncheck(i);
                    default:
                        return null;
                }
            },
        };
    });

    const showOperationList = props.operationList?.length > 0;
    return (
        <React.Fragment>
            {confirmationVisible && (
                <ConfirmDialog
                    visible={true}
                    message={'Do you want to delete this record?'}
                    position='Top'
                    onAccept={accept}
                    onHide={hide}
                    header={'Delete confirmation'}
                    icon='pi pi-info'
                />
            )}
            {!!props.operations &&
                props.operations?.map((operation, index) => {
                    return <div key={index}>{renderOperationsButton(operation)}</div>;
                })}
            {showOperationList ? (
                <ActionButtonWithMenu
                    id='more_shortcut'
                    iconName='mdi-dots-vertical'
                    className={``}
                    items={menuItems}
                    title={props.labels['View_AdditionalOptions']}
                />
            ) : null}
        </React.Fragment>
    );
};

OperationsButtons.defaultProps = {
    operations: [],
    operationList: [],
    info: null,
    handleHrefSubview: () => {},
    handleEdit: () => {},
    handleEditSpec: () => {},
    handleAddSpecSpec: () => {},
    handleDelete: () => {},
    handleRestore: () => {},
    handleCopy: () => {},
    handleBatch: () => {},
    handleArchive: () => {},
    handleDownload: () => {},
    handlePublish: () => {},
    handleFormula: () => {},
    handleHistory: () => {},
    handleDocuments: () => {},
    handlePlugins: () => {},
    handleAttachments: () => {},
    handleFill: () => {},
    inverseColor: false,
    isFromHeader: false,
    buttonShadow: true,
    margin: Constants.DEFAULT_MARGIN_BETWEEN_BUTTONS,
    atLeastOneSelected: true,
};

OperationsButtons.propTypes = {
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    operations: PropTypes.array.isRequired,
    operationList: PropTypes.array.isRequired,
    handleBlockUi: PropTypes.func.isRequired,
    info: PropTypes.object,
    handleEdit: PropTypes.func,
    handleEditSpec: PropTypes.func,
    hrefSubview: PropTypes.string,
    handleHrefSubview: PropTypes.func,
    handleAddSpecSpec: PropTypes.func,
    handleDelete: PropTypes.func,
    handleRestore: PropTypes.func,
    handleCopy: PropTypes.func,
    handleDownload: PropTypes.func,
    handleArchive: PropTypes.func,
    handlePublish: PropTypes.func,
    handleUnblockUi: PropTypes.func,
    handleFormula: PropTypes.func,
    handleHistory: PropTypes.func,
    handleAttachments: PropTypes.func,
    handleAddLevel: PropTypes.func,
    handleUp: PropTypes.func,
    handleDown: PropTypes.func,
    handleFill: PropTypes.func,
    margin: PropTypes.string,
    atLeastOneSelected: PropTypes.bool,
    isFromHeader: PropTypes.bool,
    inverseColor: PropTypes.bool,
    buttonShadow: PropTypes.bool,
};

export default OperationsButtons;
