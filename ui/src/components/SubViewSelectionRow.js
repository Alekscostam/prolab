/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import ShortcutButton from "./ShortcutButton";
import {GridViewUtils} from "../utils/GridViewUtils";
import DataGrid from "devextreme-react/data-grid";
//OP_DELETE
//OP_RESTORE
//OP_COPY
//OP_ARCHIVE
export const SubViewSelectionRow = props => {

    const opEdit = GridViewUtils.containsOperationButton(props.operations, 'OP_EDIT');
    const opAttachments = GridViewUtils.containsOperationButton(props.operations, 'OP_ATTACHMENTS');
    const opHistory = GridViewUtils.containsOperationButton(props.operations, 'OP_HISTORY');
    let actionColumn = !!opEdit || !!opAttachments || !!opHistory;
    return (<React.Fragment>
        <div id="sub-view-selection-row">
            <div id="selection-sub-view-row" className="table-responsive">
                <table id="selection-sub-view-row-table" className="table">
                    <thead>
                    <tr>
                        {props.selectedRow.map((item, index) => {
                            return (<th>{item.label}</th>)
                        })}
                        {actionColumn ? <th>Akcje</th> : null}
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        {props.selectedRow.map((item, index) => {
                            return (<td>{item.value}</td>)
                        })}
                        {actionColumn ? <th>
                            <ShortcutButton
                                id={`edit_button`}
                                className={`action-button-with-menu mr-1`}
                                iconName={'mdi-pencil'}
                                label={''}
                                title={'Edycja'}
                                rendered={opEdit}
                            />
                            <ShortcutButton
                                id={`attachment_button`}
                                className={`action-button-with-menu mr-1`}
                                iconName={'mdi-attachment'}
                                label={''}
                                title={'Załączniki'}
                                rendered={opAttachments}
                            />
                            <ShortcutButton
                                id={`history_button`}
                                className={`action-button-with-menu mr-1`}
                                iconName={'mdi-package-down'}
                                label={''}
                                title={'Historia'}
                                rendered={opHistory}
                            />

                        </th> : null}
                    </tr>

                    </tbody>
                </table>
            </div>
        </div>
    </React.Fragment>);
}

SubViewSelectionRow.defaultProps = {};

SubViewSelectionRow.propTypes = {
    selectedRow: PropTypes.array.isRequired,
    operations: PropTypes.array.isRequired,
    handleDelete: PropTypes.func.isRequired,
    handleRestore: PropTypes.func.isRequired,
    handleCopy: PropTypes.func.isRequired,
    handleArchive: PropTypes.func.isRequired,
};

export default SubViewSelectionRow;
