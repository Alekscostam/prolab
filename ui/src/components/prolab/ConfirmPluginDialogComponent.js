import React from 'react';
import PropTypes from 'prop-types';
import LocUtils from '../../utils/LocUtils';
import { ConfirmDialog } from 'primereact/confirmdialog';

export const ConfirmPluginDialogComponent = ({parsedPluginView, labels, onHide, onAccept, onReject}) =>  {
    const acceptLabel =()=> {
        if(isQuestion()){
            return LocUtils.loc(labels, 'Yes', 'Tak');
        }
        return LocUtils.loc(labels, 'Ok', 'OK');
    }
    const rejectLabel = () => {
        if(isQuestion()){
            return LocUtils.loc(labels, 'No', 'Nie');
        }
        return LocUtils.loc(labels, 'Close', 'Zamknij');
    }
    const isMessage = () => {
        return parsedPluginView.info.kind === "MESSAGE";
    }
    const isQuestion = () => {
        return parsedPluginView.info.kind === "QUESTION";
    }
    const message = () => {
        if(isQuestion()){
            return LocUtils.loc(labels, '', parsedPluginView.info.question?.text)
        }
        return LocUtils.loc(labels, '', parsedPluginView.info.message?.text); 
        
    }
    const headerLabel = () => {
        let header = LocUtils.loc(labels, '', parsedPluginView.info?.name);
        if(isMessage()){
            return LocUtils.loc(labels, '', parsedPluginView.info.message?.title)
        }
        if(isQuestion()){
            return LocUtils.loc(labels, '', parsedPluginView.info.question?.title)
        }
        return header;
    }
    const accept = () => {
        onAccept();
    }
    const reject = () => {
        if(isQuestion()){
            onReject();
        }
        return undefined;
    }

    return (
        <ConfirmDialog
            closable={false}
            visible={true}
            acceptLabel={acceptLabel()}                        
            rejectLabel={rejectLabel()}
            header={headerLabel()}
            onHide={()=>onHide()}
            message={message()}
            className={isMessage() ? 'single-button' : ''}
            icon='pi pi-exclamation-triangle'
            accept={()=>accept()}
            reject={()=>reject()}
        />
    );
}

ConfirmPluginDialogComponent.defaultProps = {
    parsedPluginView:undefined, 
    labels: [], 
    onHide: ()=>{}, 
    onAccept:()=>{}, 
    onReject: ()=>{}
};

ConfirmPluginDialogComponent.defaultProps = {
    parsedPluginView: PropTypes.object.isRequired,
    onHide: PropTypes.func.isRequired,
    onAccept: PropTypes.func.isRequired,
    onReject: PropTypes.func.isRequired,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
};
