import {Button} from 'devextreme-react';
import {Dialog} from 'primereact/dialog';
import {useEffect, useRef, useState} from 'react';

import PropTypes from 'prop-types';
import HtmlEditor, {Item, MediaResizing, Toolbar} from 'devextreme-react/html-editor';
import {confirmDialog} from 'primereact/confirmdialog';
import LocUtils from '../../utils/LocUtils';
import {localeOptions} from 'primereact/api';

export const ConfirmationEditExistDialog = (props) => {
    const {onSave, onHide, header} = props;

    const dialogFooter = (
        <div>
            <Button
                id='save-editor-button'
                text={LocUtils.loc(props.labels, 'yes', 'Tak')}
                onClick={() => {
                    // if (onSave) {
                    //     onSave(editor.current?.instance?.option('value'));
                    // }
                    // hideDialog();
                }}
            />

            <Button
                id='save-editor-button'
                text={LocUtils.loc(props.labels, 'no', 'nie')}
                onClick={() => {
                    // if (onSave) {
                    //     onSave(editor.current?.instance?.option('value'));
                    // }
                    // hideDialog();
                }}
            />
        </div>
    );

    const dialogHeader = (
        <div>{LocUtils.loc(props.labels, 'Question_Close_Edit', 'Czy na pewno chcesz zamknąć edycję?')}</div>
    );

    return (
        <Dialog
            blockScroll
            visible={true}
            header={dialogHeader}
            style={{width: '25vw', overflow: 'hidden !important'}}
            footer={dialogFooter}
        ></Dialog>
    );
    // confirmDialog({
    //     appendTo: document.body,
    //     message: LocUtils.loc(props.labels, 'Question_Close_Edit', 'Czy na pewno chcesz zamknąć edycję?'),
    //     header: LocUtils.loc(props.labels, 'Confirm_Label', 'Potwierdzenie'),
    //     icon: 'pi pi-exclamation-triangle',
    //     acceptLabel: localeOptions('accept'),
    //     rejectLabel: localeOptions('reject'),
    //     accept: () => {
    //         // this.handleCancelRowChange(viewId, recordId, parentId);
    //         // this.setState({visibleEditPanel: e});
    //     },
    //     reject: () => undefined,
    // });
};

ConfirmationEditExistDialog.defaultProps = {
    onSave: undefined,
    onHide: undefined,
    visible: true,
    value: '',
    header: '',
};

ConfirmationEditExistDialog.propTypes = {
    onSave: PropTypes.func,
    onHide: PropTypes.func,
    visible: PropTypes.bool,
    value: PropTypes.string,
    header: PropTypes.string,
};
