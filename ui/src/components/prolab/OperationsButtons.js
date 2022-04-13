/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import ShortcutButton from "./ShortcutButton";
import Constants from "../../utils/Constants";
import ActionButtonWithMenu from "./ActionButtonWithMenu";
//Komponent do wyświetlania dynamicznego przycisków - po zaznaczaniu rekordów i przy szczegółach rekordów
export const OperationsButtons = props => {

    //metoda wykorzystywana do wyświetlania przycisków na górnym panelu po zaznaczeniu rekordów
    const renderOperationsButton = (operations) => {
        const info = props.info;
        const margin = props.margin;
        const inverseColor = props.inverseColor;
        const buttonShadow = props.buttonShadow;
        if (!!operations && !!operations.type) {
            switch (operations.type?.toUpperCase()) {
                case 'OP_EDIT':
                case 'OP_EDIT_SPEC':
                    return (
                        <React.Fragment>
                            <ShortcutButton
                                id={`${info?.column.headerId}_menu_button`}
                                className={`action-button-with-menu ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                iconName={operations?.iconCode || 'mdi-pencil'}
                                iconColor={`${inverseColor ? `white` : `blue`}`}
                                buttonShadow={buttonShadow}
                                title={operations.label}
                                handleClick={(e) => props.handleEdit(e)}/>
                        </React.Fragment>);
                case 'OP_SUBVIEWS':
                    return (
                        <React.Fragment>
                            <ShortcutButton
                                id={`${info?.column.headerId}_menu_button`}
                                className={`action-button-with-menu ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                iconName={operations?.iconCode || 'mdi-playlist-plus'}
                                iconColor={`${inverseColor ? `white` : `blue`}`}
                                buttonShadow={buttonShadow}
                                title={operations.label}
                                handleClick={() => props.handleBlockUi()}
                                href={props.hrefSubview}/>
                        </React.Fragment>);
                case 'OP_DELETE':
                    return (
                        <React.Fragment>
                            <ShortcutButton
                                className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                handleClick={(e) => props.handleDelete(e)}
                                iconName={operations?.iconCode || 'mdi-delete'}
                                iconColor={`${inverseColor ? `white` : `blue`}`}
                                buttonShadow={buttonShadow}
                                iconSide="left"
                                title={operations?.label}
                            />
                        </React.Fragment>);
                case 'OP_RESTORE':
                    return (
                        <React.Fragment>
                            <ShortcutButton
                                className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                handleClick={(e) => props.handleRestore(e)}
                                iconName={operations?.iconCode || 'mdi-restore'}
                                iconColor={`${inverseColor ? `white` : `blue`}`}
                                buttonShadow={buttonShadow}
                                iconSide="left"
                                title={operations?.label}
                            />
                        </React.Fragment>);
                case 'OP_COPY':
                    return (
                        <React.Fragment>
                            <ShortcutButton
                                className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                handleClick={(e) => props.handleCopy(e)}
                                iconName={operations?.iconCode || 'mdi-content-copy'}
                                iconColor={`${inverseColor ? `white` : `blue`}`}
                                buttonShadow={buttonShadow}
                                iconSide="left"
                                title={operations?.label}
                            />
                        </React.Fragment>);
                case 'OP_ARCHIVE':
                    return (<React.Fragment>
                        <ShortcutButton className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                        handleClick={(e) => props.handleArchive(e)}
                                        iconName={operations?.iconCode || 'mdi-archive'}
                                        iconColor={`${inverseColor ? `white` : `blue`}`}
                                        buttonShadow={buttonShadow}
                                        iconSide="left"
                                        title={operations?.label}/>
                    </React.Fragment>);
                case 'OP_PUBLISH':
                    return (<React.Fragment>
                        <ShortcutButton className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                        handleClick={(e) => props.handlePublish(e)}
                                        iconName={operations?.iconCode || 'mdi-publish'}
                                        iconColor={`${inverseColor ? `white` : `blue`}`}
                                        buttonShadow={buttonShadow}
                                        iconSide="left"
                                        title={operations?.label}/>
                    </React.Fragment>);
                //TODO
                case 'OP_FORMULA':
                    return (<React.Fragment>
                        <ShortcutButton className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                        handleClick={(e) => alert("OP_FORMULA TODO")}
                                        iconName={operations?.iconCode || 'mdi-help-circle'}
                                        iconColor={`${inverseColor ? `white` : `blue`}`}
                                        buttonShadow={buttonShadow}
                                        iconSide="left"
                                        title={operations?.label}/>
                    </React.Fragment>);
                //TODO
                case 'OP_HISTORY':
                    return (<React.Fragment>
                        <ShortcutButton className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                        handleClick={(e) => alert("OP_HISTORY TODO")}
                                        iconName={operations?.iconCode || 'mdi-help-circle'}
                                        iconColor={`${inverseColor ? `white` : `blue`}`}
                                        buttonShadow={buttonShadow}
                                        iconSide="left"
                                        title={operations?.label}/>
                    </React.Fragment>);
                //TODO
                case 'OP_ATTACHMENTS':
                    return (<React.Fragment>
                        <ShortcutButton className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                        handleClick={(e) => alert("OP_ATTACHMENTS TODO")}
                                        iconName={operations?.iconCode || 'mdi-help-circle'}
                                        iconColor={`${inverseColor ? `white` : `blue`}`}
                                        buttonShadow={buttonShadow}
                                        iconSide="left"
                                        title={operations?.label}/>
                    </React.Fragment>);
                default:
                    return null;
            }
        }
    }

    const menuItems = props.operationList.map((i) => {
            return {
                label: i.label, icon: `mdi ${i.iconCode}`, command: () => {
                    switch (i.type?.toUpperCase()) {
                        case 'OP_EDIT':
                        case 'OP_EDIT_SPEC':
                            return props.handleEdit();
                        case 'OP_SUBVIEWS':
                            return props.handleHrefSubview();
                        case 'OP_DELETE':
                            return props.handleDelete();
                        case 'OP_RESTORE':
                            return props.handleRestore();
                        case 'OP_COPY':
                            return props.handleCopy();
                        case 'OP_ARCHIVE':
                            return props.handleArchive();
                        case 'OP_PUBLISH':
                            return props.handlePublish();
                        case 'OP_FORMULA':
                            return props.handleFormula();
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
                }
            }
        }
    )

    const showOperationList = props.operationList?.length > 0;

    return (<React.Fragment>
        {!!props.operations && props.operations?.map((operation, index) => {
            return <div key={index}>{renderOperationsButton(operation)}</div>;
        })}
        {showOperationList ?
            <ActionButtonWithMenu
                id='more_shortcut'
                iconName='mdi-dots-vertical'
                className={``}
                items={menuItems}
                title={props.labels['View_AdditionalOptions']}/> : null}
    </React.Fragment>);
}

OperationsButtons.defaultProps = {
    operations: [],
    operationList: [],
    info: null,
    handleHrefSubview: () => {
    },
    handleEdit: () => {
    },
    handleDelete: () => {
    },
    handleRestore: () => {
    },
    handleCopy: () => {
    },
    handleArchive: () => {
    },
    handlePublish: () => {
    },
    handleFormula: () => {
    },
    handleHistory: () => {
    },
    handleAttachments: () => {
    },
    inverseColor: false,
    buttonShadow: true,
    margin: Constants.DEFAULT_MARGIN_BETWEEN_BUTTONS
};

OperationsButtons.propTypes = {
    labels: PropTypes.object.isRequired,
    operations: PropTypes.array.isRequired,
    operationList: PropTypes.array.isRequired,
    info: PropTypes.object.isRequired,
    handleEdit: PropTypes.func.isRequired,
    hrefSubview: PropTypes.string.isRequired,
    handleHrefSubview: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    handleRestore: PropTypes.func.isRequired,
    handleCopy: PropTypes.func.isRequired,
    handleArchive: PropTypes.func.isRequired,
    handlePublish: PropTypes.func.isRequired,
    handleFormula: PropTypes.func.isRequired,
    handleHistory: PropTypes.func.isRequired,
    handleAttachments: PropTypes.func.isRequired,
    handleBlockUi: PropTypes.func.isRequired,
    handleAddLevel: PropTypes.func.isRequired,
    handleUp: PropTypes.func.isRequired,
    handleDown: PropTypes.func.isRequired,
    margin: PropTypes.string,
    inverseColor: PropTypes.bool,
    buttonShadow: PropTypes.bool,
};

export default OperationsButtons;
