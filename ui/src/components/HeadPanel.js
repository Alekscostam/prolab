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
export const HeadPanel = props => {
    const opDelete = GridViewUtils.containsOperationButton(props.operations, 'OP_DELETE');
    const opRestore = GridViewUtils.containsOperationButton(props.operations, 'OP_RESTORE');
    const opCopy = GridViewUtils.containsOperationButton(props.operations, 'OP_COPY');
    const opArchive = GridViewUtils.containsOperationButton(props.operations, 'OP_ARCHIVE');
    return (<React.Fragment>
        <div id="grid-selection-panel"
             className={props.selectedRowKeys?.length > 0 ? "d-flex flex-row grid-selection-panel grid-selection-panel-selection"
                 : "d-flex flex-row grid-selection-panel grid-selection-panel-non-selection"}>
            {props.leftContent == undefined ? null :
                <React.Fragment>
                    <div id="grid-panel-left" className="grid-panel-left">
                        {props.leftContent}
                    </div>
                </React.Fragment>}

            {props.selectedRowKeys?.length > 0 ?
                <React.Fragment>
                    <div id="grid-panel-selection" className="grid-panel-selection">
                        <div id="grid-count-panel"
                             className="grid-count-fragment pt-2 pb-2 ml-2">Pozycje: {props.selectedRowKeys?.length || 0}</div>
                        <div id="grid-separator" className="p-1 grid-separator-fragment"></div>
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
                    </div>
                </React.Fragment> : null}
            {props.rightContent == undefined ? null :
                <React.Fragment>
                    <div id="grid-panel-right" className="grid-panel-right pt-1 pb-1">
                        {props.rightContent}
                    </div>
                </React.Fragment>}
        </div>
    </React.Fragment>);
}

HeadPanel.defaultProps = {};

HeadPanel.propTypes = {
    selectedRowKeys: PropTypes.array.isRequired,
    operations: PropTypes.array.isRequired,
    handleDelete: PropTypes.func.isRequired,
    handleRestore: PropTypes.func.isRequired,
    handleCopy: PropTypes.func.isRequired,
    handleArchive: PropTypes.func.isRequired,
    leftContent: PropTypes.any,
    rightContent: PropTypes.any
};

export default HeadPanel;
