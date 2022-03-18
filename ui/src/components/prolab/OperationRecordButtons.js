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
        const margin = props.margin;
        const inverseColor = props.inverseColor;
        if (!!operation && !!operation.type) {
            switch (operation.type?.toUpperCase()) {
                case 'OP_EDIT':
                    return (
                        <React.Fragment>
                            <ShortcutButton
                                id={`${info?.column.headerId}_menu_button`}
                                className={`action-button-with-menu ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                iconName={operation?.iconCode || 'mdi-pencil'}
                                iconColor={`${inverseColor ? `blue` : `white`}`}
                                title={operation.label}
                                handleClick={(e) => props.handleEdit(e)}
                            />
                        </React.Fragment>);
                case 'OP_SUBVIEWS':
                    return (
                        <React.Fragment>
                            <ShortcutButton
                                id={`${info?.column.headerId}_menu_button`}
                                className={`action-button-with-menu ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                iconName={operation?.iconCode || 'mdi-playlist-plus'}
                                iconColor={`${inverseColor ? `blue` : `white`}`}
                                title={operation.label}
                                href={props.hrefSubview}
                            />
                        </React.Fragment>);
                case 'OP_DELETE':
                    return (
                        <React.Fragment>
                            <ShortcutButton
                                className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                handleClick={(e) => props.handleDelete(e)}
                                iconName={operation?.iconCode || 'mdi-delete'}
                                iconColor={`${inverseColor ? `blue` : `white`}`}
                                iconSide="left"
                                title={operation?.label}
                            />
                        </React.Fragment>);
                case 'OP_RESTORE':
                    return (
                        <React.Fragment>
                            <ShortcutButton
                                className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                handleClick={(e) => props.handleRestore(e)}
                                iconName={operation?.iconCode || 'mdi-restore'}
                                iconColor={`${inverseColor ? `blue` : `white`}`}
                                iconSide="left"
                                title={operation?.label}
                            />
                        </React.Fragment>);
                case 'OP_COPY':
                    return (
                        <React.Fragment>
                            <ShortcutButton
                                className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                handleClick={(e) => props.handleCopy(e)}
                                iconName={operation?.iconCode || 'mdi-content-copy'}
                                iconColor={`${inverseColor ? `blue` : `white`}`}
                                iconSide="left"
                                title={operation?.label}
                            />
                        </React.Fragment>);
                case 'OP_ARCHIVE':
                    return (<React.Fragment>
                        <ShortcutButton className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                        handleClick={(e) => props.handleArchive(e)}
                                        iconName={operation?.iconCode || 'mdi-archive'}
                                        iconColor={`${inverseColor ? `blue` : `white`}`}
                                        iconSide="left"
                                        title={operation?.label}/>
                    </React.Fragment>);
                case 'OP_PUBLISH':
                    return (<React.Fragment>
                        <ShortcutButton className={`grid-button-panel ${inverseColor ? `inverse` : `normal`} ${margin}`}
                                        handleClick={(e) => props.handlePublish(e)}
                                        iconName={operation?.iconCode || 'mdi-publish'}
                                        iconColor={`${inverseColor ? `blue` : `white`}`}
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
                        default:
                            return null;
                    }
                }
            }
        }
    )

    const showOperationList = props.operationList?.length > 0;


    return (<React.Fragment>
        {!!props.operation && props.operation?.map((operation, index) => {
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
    inverseColor: false,
    margin: Constants.DEFAULT_MARGIN_BETWEEN_BUTTONS
};

OperationRecordButtons.propTypes = {
    labels: PropTypes.object.isRequired,
    operation: PropTypes.array.isRequired,
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
    margin: PropTypes.string,
    inverseColor: PropTypes.bool,
};

export default OperationRecordButtons;
