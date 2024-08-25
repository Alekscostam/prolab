import {Dialog} from 'primereact/dialog';
import {useState} from 'react';

import PropTypes from 'prop-types';
import LocUtils from '../../utils/LocUtils';
import ExcelEditorComponent from './ExcelEditorComponent';

export const ExcelEditorDialogComponent = (props) => {
    const {onHide, labels, file, name} = props;
    const [visible, setVisible] = useState(props.visible);

    const hideDialog = () => {
        onHide();
        setVisible(false);
    };
    const dialogHeader = () => {
        return <div>{LocUtils.loc(labels, 'Excel', 'Excel')} - {name}</div>;
    };
    const dialogFooter =  (
        <div className='mt-1 mb-1 mr-1'>
        </div>
    );
    return (
        <div>
            <Dialog
                className='dialog-excel'
                closable={true}
                header={dialogHeader}
                blockScroll
                visible={visible}
                style={{ overflow: 'hidden !important', maxWidth:"1600px"}}
                
                onHide={hideDialog}
                footer={(dialogFooter)}>
                    <div className='dx-field mt-4 mb-4'>
                     <ExcelEditorComponent file={file} ></ExcelEditorComponent>
                    </div>
            </Dialog>
        </div>
    );
};

ExcelEditorDialogComponent.defaultProps = {
    onSave: undefined,
    onHide: undefined,
    labels: undefined,
    visible: true,
    editable: true,
    value: '',
    header: '',
};

ExcelEditorDialogComponent.propTypes = {
    onSave: PropTypes.func,
    onHide: PropTypes.func,
    visible: PropTypes.bool,
    editable: PropTypes.bool,
    value: PropTypes.string,
    header: PropTypes.string,
    labels: PropTypes.object,
};

