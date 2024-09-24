import {Button, TextBox} from 'devextreme-react';
import {Dialog} from 'primereact/dialog';
import {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import LocUtils from '../../utils/LocUtils';
import PDFViewerComponent from './PDFViewerComponent';

export const PDFViewerDialogComponent = (props) => {
    const {onHide, labels, file, name} = props;
    const [visible, setVisible] = useState(props.visible);

    const hideDialog = () => {
        onHide();
        setVisible(false);
    };
    const dialogHeader = () => {
        return <div>{LocUtils.loc(labels, 'Document_pdf', 'Dokument PDF')} - {name}</div>;
    };
    const dialogFooter =  (
        <div className='mt-1 mb-1 mr-1'>
        </div>
    );
    return (
        <div>
            <Dialog
                className='dialog-pdf'
                closable={true}
                header={dialogHeader}
                blockScroll
                maximizable 
                visible={visible}
                style={{ overflow: 'hidden !important'}}
                onHide={hideDialog}
                footer={(dialogFooter)}>
                    <div className='dx-field mt-2'>
                      <PDFViewerComponent labels={labels} file={file}></PDFViewerComponent>
                    </div>
            </Dialog>
        </div>
    );
};

PDFViewerDialogComponent.defaultProps = {
    onSave: undefined,
    onHide: undefined,
    labels: undefined,
    visible: true,
    editable: true,
    value: '',
    header: '',
};

PDFViewerDialogComponent.propTypes = {
    onSave: PropTypes.func,
    onHide: PropTypes.func,
    visible: PropTypes.bool,
    editable: PropTypes.bool,
    value: PropTypes.string,
    header: PropTypes.string,
    labels: PropTypes.object,
};
