import React from 'react';
import PropTypes from 'prop-types';
import ShortcutButton from './ShortcutButton';
import Constants from '../../utils/Constants';
import ActionButtonWithMenu from './ActionButtonWithMenu';
import {sessionExtendFnc} from '../../App';
import {OperationType} from '../../enum/OperationType';
import {SessionStoreUtils} from '../../utils/SessionStoreUtils';
import LocUtils from '../../utils/LocUtils';
import {showBarCode} from '../../utils/BarCodeUtils';

export const OperationsButtons = ({
    operations = [],
    operationList = [],
    info = null,
    hrefSubview,
    hrefSpecView,
    handleBlockUi = () => {},
    handleEdit = () => {},
    handleCheck = () => {},
    handleUncheck = () => {},
    handleCollapse = () => {},
    handleExpand = () => {},
    handleDown = () => {},
    handleUp = () => {},
    handleAddLevel = () => {},
    handlePreview = () => {},
    handleEditSpec = () => {},
    handleAddSpecSpec = () => {},
    handleDelete = () => {},
    handleRestore = () => {},
    handleCopy = () => {},
    handleBatch = () => {},
    handleArchive = () => {},
    handleDownload = () => {},
    handlePublish = () => {},
    handleFormula = () => {},
    handleHistory = () => {},
    handleDocuments = () => {},
    handlePlugins = () => {},
    handleAttachments = () => {},
    handleFill = () => {},
    inverseColor = false,
    isFromHeader = false,
    buttonShadow = true,
    margin = Constants.DEFAULT_MARGIN_BETWEEN_BUTTONS,
    atLeastOneSelected = true,
}) => {
    const renderOperationsButton = (operations) => {
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
                                        afterClickOperation(() => handleEdit(Object.assign(e, operations)))
                                    }
                                />
                            </React.Fragment>
                        );
                    break;
                case OperationType.OP_PREVIEW:
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
                                        afterClickOperation(() => handlePreview(Object.assign(e, operations)))
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
                                    handleClick={(e) => {
                                        SessionStoreUtils.saveFiltersFromView();
                                        SessionStoreUtils.saveStore();
                                        e.selectAll = !atLeastOneSelected && !!operations.showAlways;
                                        return afterClickOperation(() => handleEditSpec(Object.assign(e, operations)));
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
                                            handleAddSpecSpec(Object.assign(e, operations))
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
                                        SessionStoreUtils.saveFiltersFromView();
                                        SessionStoreUtils.saveStore();
                                        SessionStoreUtils.saveClickedRowFromView(info?.data?.ID);
                                        afterClickOperation(() => handleBlockUi());
                                    }}
                                    href={hrefSubview}
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
                                        afterClickOperation(
                                            () => handleDelete(Object.assign(e, operations)),
                                            operations.type
                                        )
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
                                        afterClickOperation(() => handleDownload(Object.assign(e, operations)))
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
                                        afterClickOperation(() => handleRestore(Object.assign(e, operations)))
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
                                        afterClickOperation(() => handleCopy(Object.assign(e, operations)))
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
                                        afterClickOperation(() => handleArchive(Object.assign(e, operations)))
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
                                        afterClickOperation(() => handlePublish(Object.assign(e, operations)))
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
                                        afterClickOperation(() => handleFormula(Object.assign(e, operations)));
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
                                        afterClickOperation(() => handleHistory(Object.assign(e, operations)))
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
                                        afterClickOperation(() => handleAttachments(Object.assign(e, operations)))
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
                                        afterClickOperation(() => handleAddLevel(Object.assign(e, operations)))
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
                                        afterClickOperation(() => handleUp(Object.assign(e, operations)))
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
                                        afterClickOperation(() => handleDown(Object.assign(e, operations)))
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
                                        afterClickOperation(() => handleFill(Object.assign(e, operations)))
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
                                        afterClickOperation(() => handleExpand(Object.assign(e, operations)))
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
                                        afterClickOperation(() => handleCollapse(Object.assign(e, operations)))
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
                                        afterClickOperation(() => handleCheck(Object.assign(e, operations)))
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
                                        afterClickOperation(() => handleUncheck(Object.assign(e, operations)))
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

    const afterClickOperation = (operationSelectedFnc, operationTypeForConfirmation) => {
        if (sessionExtendFnc) {
            sessionExtendFnc();
        }
        operationSelectedFnc();
    };

    const shouldShowOpFormula = (operations) => {
        let showOperation = !!atLeastOneSelected;
        if (isFromHeader && !!atLeastOneSelected) {
            showOperation = !operations.showAlways;
        }
        return showOperation;
    };

    const menuItems = operationList.map((i) => {
        let url = undefined;
        switch (i.type?.toUpperCase()) {
            case OperationType.OP_EDIT_SPEC:
                url = hrefSpecView;
                break;
            case OperationType.OP_SUBVIEWS:
                url = hrefSubview;
                break;
            default:
                url = () => {};
                break;
        }
        return {
            label: i.label,
            icon: `mdi ${i.iconCode}`,
            url: url,
            command: () => {
                switch (i.type?.toUpperCase()) {
                    case OperationType.OP_EDIT:
                        return handleEdit(i);
                    case OperationType.OP_PREVIEW:
                        return handlePreview(i);
                    case OperationType.OP_EDIT_SPEC:
                        SessionStoreUtils.saveStore();
                        SessionStoreUtils.saveFiltersFromView();
                        SessionStoreUtils.saveClickedRowFromView(info?.data?.ID);
                        return () => {};
                    case OperationType.OP_ADDSPEC_SPEC:
                        return handleAddSpecSpec(i);
                    case OperationType.OP_SUBVIEWS:
                        SessionStoreUtils.saveStore();
                        SessionStoreUtils.saveFiltersFromView();
                        SessionStoreUtils.saveClickedRowFromView(info?.data?.ID);
                        return () => {};
                    case OperationType.OP_DELETE:
                        return handleDelete(i);
                    case OperationType.OP_RESTORE:
                        return handleRestore(i);
                    case OperationType.OP_COPY:
                        return handleCopy(i);
                    case OperationType.SK_DOCUMENT:
                        return handleDocuments(i);
                    case OperationType.SK_PLUGIN:
                        return handlePlugins(i);
                    case OperationType.OP_ARCHIVE:
                        return handleArchive(i);
                    case OperationType.OP_PUBLISH:
                        return handlePublish(i);
                    case OperationType.OP_FORMULA:
                        return handleFormula(i);
                    case OperationType.OP_DOWNLOAD:
                        return handleDownload(i);
                    case OperationType.OP_HISTORY:
                        return handleHistory(i);
                    case OperationType.OP_ATTACHMENTS:
                        return handleAttachments(i);
                    case OperationType.OP_BATCH:
                    case OperationType.SK_BATCH:
                        return handleBatch(i);
                    case OperationType.OP_ADD_LEVEL:
                        return handleAddLevel(i);
                    case OperationType.OP_UP:
                        return handleUp(i);
                    case OperationType.OP_DOWN:
                        return handleDown(i);
                    case OperationType.OP_FILL:
                        return handleFill(i);
                    case OperationType.OP_TREE_EXPAND:
                        return handleExpand(i);
                    case OperationType.OP_TREE_COLLAPSE:
                        return handleCollapse(i);
                    case OperationType.OP_TREE_CHECK:
                        return handleCheck(i);
                    case OperationType.OP_TREE_UNCHECK:
                        return handleUncheck(i);
                    default:
                        return null;
                }
            },
        };
    });

    const showOperationList = operationList?.length > 0;
    return (
        <React.Fragment>
            {!!operations &&
                operations?.map((operation, index) => {
                    return <React.Fragment key={index}>{renderOperationsButton(operation)}</React.Fragment>;
                })}
            {showOperationList ? (
                <ActionButtonWithMenu
                    id='more_shortcut'
                    iconName='mdi-dots-vertical'
                    className={``}
                    items={menuItems}
                    title={LocUtils.locFromStore('View_AdditionalOptions')}
                />
            ) : null}
        </React.Fragment>
    );
};

OperationsButtons.propTypes = {
    operations: PropTypes.array,
    operationList: PropTypes.array,
    handleBlockUi: PropTypes.func.isRequired,
    info: PropTypes.object,
    handleEdit: PropTypes.func,
    handleEditSpec: PropTypes.func,
    hrefSubview: PropTypes.string,
    handlePreview: PropTypes.func,
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
