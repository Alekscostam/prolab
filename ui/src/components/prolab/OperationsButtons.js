/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import ShortcutButton from './ShortcutButton';
import Constants from '../../utils/Constants';
import ActionButtonWithMenu from './ActionButtonWithMenu';
//Komponent do wyświetlania dynamicznego przycisków - po zaznaczaniu rekordów i przy szczegółach rekordów
export const OperationsButtons = (props) => {
    //metoda wykorzystywana do wyświetlania przycisków na górnym panelu po zaznaczeniu rekordów
    const renderOperationsButton = (operations) => {
        const info = props.info;
        const margin = props.margin;
        const inverseColor = props.inverseColor;
        const buttonShadow = props.buttonShadow;
        const atLeastOneSelected = props.atLeastOneSelected;
        if (operations && !!operations.type) {
            switch (operations.type?.toUpperCase()) {
                case 'OP_EDIT':
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
                                    handleClick={(e) => props.handleEdit(e)}
                                />
                            </React.Fragment>
                        );
                    break;
                case 'OP_EDIT_SPEC':
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
                                        return props.handleEditSpec(e);
                                    }}
                                />
                            </React.Fragment>
                        );
                    }
                    break;
                case 'OP_ADDSPEC_SPEC':
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
                                        return props.handleAddSpecSpec(e);
                                    }}
                                />
                            </React.Fragment>
                        );
                    }
                    break;
                case 'OP_SUBVIEWS':
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
                                    handleClick={() => props.handleBlockUi()}
                                    href={props.hrefSubview}
                                />
                            </React.Fragment>
                        );
                    break;
                case 'OP_DELETE':
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) => props.handleDelete(e)}
                                    iconName={operations?.iconCode || 'mdi-delete'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case 'OP_DOWNLOAD':
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) => props.handleDownload(e)}
                                    iconName={operations?.iconCode || 'mdi-help-circle'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case 'OP_RESTORE':
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) => props.handleRestore(e)}
                                    iconName={operations?.iconCode || 'mdi-restore'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;

                case 'OP_COPY':
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) => props.handleCopy(e)}
                                    iconName={operations?.iconCode || 'mdi-content-copy'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case 'OP_ARCHIVE':
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) => props.handleArchive(e)}
                                    iconName={operations?.iconCode || 'mdi-archive'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case 'OP_PUBLISH':
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) => props.handlePublish(e)}
                                    iconName={operations?.iconCode || 'mdi-publish'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case 'OP_FORMULA':
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) => {
                                        props.handleFormula(e);
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
                case 'OP_HISTORY':
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) => props.handleHistory(e)}
                                    iconName={operations?.iconCode || 'mdi-help-circle'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case 'OP_ATTACHMENTS':
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) => props.handleAttachments(e)}
                                    iconName={operations?.iconCode || 'mdi-help-circle'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case 'OP_ADD_LEVEL':
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) => props.handleAddLevel(e)}
                                    iconName={operations?.iconCode || 'mdi-plus-box-multiple-outline'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case 'OP_UP':
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) => props.handleUp(e)}
                                    iconName={operations?.iconCode || 'mdi-arrow-up-thin'}
                                    iconColor={`${inverseColor ? `white` : `blue`}`}
                                    buttonShadow={buttonShadow}
                                    iconSide='left'
                                    title={operations?.label}
                                />
                            </React.Fragment>
                        );
                    break;
                case 'OP_DOWN':
                    if (!!atLeastOneSelected)
                        return (
                            <React.Fragment>
                                <ShortcutButton
                                    className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                    handleClick={(e) => props.handleDown(e)}
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

    const menuItems = props.operationList.map((i) => {
        let url = undefined;
        switch (i.type?.toUpperCase()) {
            case 'OP_EDIT_SPEC':
                url = props.hrefSpecView;
                break;
            case 'OP_SUBVIEWS':
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
                    case 'OP_EDIT':
                        return props.handleEdit();
                    case 'OP_EDIT_SPEC':
                        return props.handleEditSpec();
                    case 'OP_ADDSPEC_SPEC':
                        return props.handleAddSpecSpec();
                    case 'OP_SUBVIEWS':
                        return props.handleHrefSubview();
                    case 'OP_DELETE':
                        return props.handleDelete();
                    case 'OP_RESTORE':
                        return props.handleRestore();
                    case 'OP_COPY':
                        return props.handleCopy();
                    case 'SK_DOCUMENT':
                        return props.handleDocuments(i);
                    case 'SK_PLUGIN':
                        return props.handlePlugins(i);
                    case 'OP_ARCHIVE':
                        return props.handleArchive();
                    case 'OP_PUBLISH':
                        return props.handlePublish();
                    case 'OP_FORMULA':
                        return props.handleFormula(i);
                    case 'OP_DOWNLOAD':
                        return props.handleDownload();
                    case 'OP_HISTORY':
                        return props.handleHistory();
                    case 'OP_ATTACHMENTS':
                        return props.handleAttachments();
                    //treeList
                    case 'OP_ADD_LEVEL':
                        return props.handleAddLevel();
                    case 'OP_UP':
                        return props.handleUp();
                    case 'OP_DOWN':
                        return props.handleDown();
                    default:
                        return null;
                }
            },
        };
    });

    const showOperationList = props.operationList?.length > 0;
    return (
        <React.Fragment>
            {/*przyciski z ikonkami*/}
            {!!props.operations &&
                props.operations?.map((operation, index) => {
                    return <div key={index}>{renderOperationsButton(operation)}</div>;
                })}
            {/*kropki, tj. lista rozwijalna*/}
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
    handleArchive: () => {},
    handleDownload: () => {},
    handlePublish: () => {},
    handleFormula: () => {},
    handleHistory: () => {},
    handleDocuments: () => {},
    handlePlugins: () => {},
    handleAttachments: () => {},
    inverseColor: false,
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
    margin: PropTypes.string,
    atLeastOneSelected: PropTypes.bool,
    inverseColor: PropTypes.bool,
    buttonShadow: PropTypes.bool,
};

export default OperationsButtons;
