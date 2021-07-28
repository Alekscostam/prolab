/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import ShortcutButton from "./ShortcutButton";
import {GridViewUtils} from "../utils/GridViewUtils";
//OP_DELETE
//OP_RESTORE
//OP_COPY
//OP_ARCHIVE
export const SelectionPanel = props => {
    const opDelete = GridViewUtils.containsOperationButton(props.operations, 'OP_DELETE');
    const opRestore = GridViewUtils.containsOperationButton(props.operations, 'OP_RESTORE');
    const opCopy = GridViewUtils.containsOperationButton(props.operations, 'OP_COPY');
    const opArchive = GridViewUtils.containsOperationButton(props.operations, 'OP_ARCHIVE');
    return (props.selectedRowKeys?.length > 0 ?
        <div id="grid-selection-panel" className="d-flex flex-row grid-selection-panel mb-4">
            <div id="grid-count-panel"
                 className="p-2 grid-count-fragment">Pozycje: {props.selectedRowKeys?.length || 0}</div>
            <div id="grid-separator-panel" className="p-2 grid-separator-fragment"></div>
            <div id="grid-buttons-fragment" className="p-1 grid-buttons-fragment">
                {opDelete ?
                    <ShortcutButton className={`grid-button-panel mr-2`}
                                    handleClick={(e) => props.handleDelete(e)}
                                    iconName="mdi-delete"
                                    iconSide="left"
                                    title={opDelete.label}
                    /> : null
                }

                {opRestore ?
                    <ShortcutButton className={`grid-button-panel mr-2`}
                                    handleClick={(e) => props.handleRestore(e)}
                                    iconName="mdi-restore"
                                    iconSide="left"
                                    title={opRestore.label}
                    /> : null
                }

                {opCopy ?
                    <ShortcutButton className={`grid-button-panel mr-2`}
                                    handleClick={(e) => props.handleCopy(e)}
                                    iconName="mdi-content-copy"
                                    iconSide="left"
                                    title={opCopy.label}
                    /> : null
                }

                {opArchive ?
                    <ShortcutButton className={`grid-button-panel mr-2`}
                                    handleClick={(e) => props.handleArchive(e)}
                                    iconName="mdi-archive"
                                    iconSide="left"
                                    title={opArchive.label}
                    /> : null
                }
            </div>
        </div> : null);
}

SelectionPanel.defaultProps = {};

SelectionPanel.propTypes = {
    selectedRowKeys: PropTypes.array.isRequired,
    operations: PropTypes.array.isRequired,
    handleDelete: PropTypes.func.isRequired,
    handleRestore: PropTypes.func.isRequired,
    handleCopy: PropTypes.func.isRequired,
    handleArchive: PropTypes.func.isRequired,
};

export default SelectionPanel;
