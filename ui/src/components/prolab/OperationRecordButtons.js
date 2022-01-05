/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import ShortcutButton from "./ShortcutButton";
import Constants from "../../utils/Constants";
import ActionButtonWithMenu from "./ActionButtonWithMenu";
//Komponent do wyświetlenia dynamicznego przycisków przy rekordzie w DataGrid
export const OperationRecordButtons = props => {

    const renderSelectionButton = (operation) => {
        const info = props.info;
        const margin = Constants.DEFAULT_MARGIN_BETWEEN_BUTTONS;
        if (!!operation.type) {
            switch (operation.type?.toUpperCase()) {
                case 'OP_EDIT':
                    return (
                        <React.Fragment>
                            <ShortcutButton
                                id={`${info?.column.headerId}_menu_button`}
                                className={`action-button-with-menu ${margin}`}
                                iconName={operation?.iconCode || 'mdi-pencil'}
                                title={operation.label}
                                handleClick={(e) => props.handleEdit(e)}
                            />
                        </React.Fragment>);
                case 'OP_SUBVIEWS':
                    return (
                        <React.Fragment>
                            <ShortcutButton
                                id={`${info?.column.headerId}_menu_button`}
                                className={`action-button-with-menu ${margin}`}
                                iconName={operation?.iconCode || 'mdi-playlist-plus'}
                                title={operation.label}
                                href={props.hrefSubview}
                            />
                        </React.Fragment>);
                case 'OP_DELETE':
                    return (
                        <React.Fragment>
                            <ShortcutButton className={`grid-button-panel ${margin}`}
                                            handleClick={(e) => props.handleDelete(e)}
                                            iconName={operation?.iconCode || 'mdi-delete'}
                                            iconSide="left"
                                            title={operation?.label}
                            />
                        </React.Fragment>);
                case 'OP_RESTORE':
                    return (
                        <React.Fragment>
                            <ShortcutButton className={`grid-button-panel ${margin}`}
                                            handleClick={(e) => props.handleRestore(e)}
                                            iconName={operation?.iconCode || 'mdi-restore'}
                                            iconSide="left"
                                            title={operation?.label}
                            />
                        </React.Fragment>);
                case 'OP_COPY':
                    return (
                        <React.Fragment>
                            <ShortcutButton className={`grid-button-panel ${margin}`}
                                            handleClick={(e) => props.handleCopy(e)}
                                            iconName={operation?.iconCode || 'mdi-content-copy'}
                                            iconSide="left"
                                            title={operation?.label}
                            />
                        </React.Fragment>);
                case 'OP_ARCHIVE':
                    return (<React.Fragment>
                        <ShortcutButton className={`grid-button-panel ${margin}`}
                                        handleClick={(e) => props.handleArchive(e)}
                                        iconName={operation?.iconCode || 'mdi-archive'}
                                        iconSide="left"
                                        title={operation?.label}/>
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
                            return props.handleEdit();
                        case 'OP_SUBVIEWS':
                            return props.hrefSubview;
                        case 'OP_DELETE':
                            return props.handleDelete();
                        case 'OP_RESTORE':
                            return props.handleRestore();
                        case 'OP_COPY':
                            return props.handleCopy();
                        case 'OP_ARCHIVE':
                            return props.handleArchive();
                        default:
                            return null;
                    }
                }
            }
        }
    )

    const showOperationList = props.operationList?.length > 0;


    return (<React.Fragment>
        {props.operation?.map((operation, index) => {
            return <div key={index}>{renderSelectionButton(operation)}</div>;
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

OperationRecordButtons.defaultProps = {
    operation: [],
    operationList: [],
    info: null,
    hrefSubview: '',
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
};

OperationRecordButtons.propTypes = {
    labels: PropTypes.object.isRequired,
    operation: PropTypes.array.isRequired,
    operationList: PropTypes.array.isRequired,
    info: PropTypes.object.isRequired,
    handleEdit: PropTypes.func.isRequired,
    hrefSubview: PropTypes.string.isRequired,
    handleDelete: PropTypes.func.isRequired,
    handleRestore: PropTypes.func.isRequired,
    handleCopy: PropTypes.func.isRequired,
    handleArchive: PropTypes.func.isRequired,
};

export default OperationRecordButtons;
