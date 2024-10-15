import {Button} from 'primereact/button';
import React from "react";
import OperationCell from "../../../model/OperationCell";

export const MemoizedOperations = React.memo(({editListVisible, fillDownVisible, onOperationClick}) => {
    return (
        <React.Fragment>
            {editListVisible && (
                <Button
                    type='button'
                    onClick={() => onOperationClick(OperationCell.EDIT_LIST)}
                    icon='mdi mdi-format-list-bulleted'
                    className='p-button-secondary'
                />
            )}
            {fillDownVisible && (
                <Button
                    type='button'
                    onClick={() => onOperationClick(OperationCell.FILL_DOWN)}
                    icon='mdi mdi-sort-bool-ascending'
                    className='p-button-secondary'
                />
            )}
        </React.Fragment>
    );
});