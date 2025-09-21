import {Dialog} from 'primereact/dialog';
import {Toast} from 'primereact/toast';
import PropTypes from 'prop-types';
import React from 'react';
import LocUtils from '../../utils/LocUtils';

import {FileUpload} from 'primereact/fileupload';

export default class UploadFileDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedFiles: [],
        };
    }

    onSelect = (e) => {
        this.setState({
            selectedFiles: e.files,
        });
    };

    onClear = () => {
        this.setState({
            selectedFiles: [],
        });
    };

    onRemove = (e) => {
        let selectedFiles = this.state.selectedFiles;
        let index = selectedFiles.indexOf(e.file);
        selectedFiles.splice(index, 1);
        this.setState({
            selectedFiles,
        });
    };

    uploadHandler = async () => {
        let fileArrays = [];
        let selectedFiles = this.state.selectedFiles;
        if (!selectedFiles) {
            return;
        }
        selectedFiles.forEach((selectedFile) => {
            delete selectedFile.objectURL;
            const formData = new FormData();
            formData.append('file', selectedFile);
            fileArrays.push(formData);
        });

        this.props.upload(fileArrays);
    };

    render() {
        return (
            <React.Fragment>
                <Toast id='toast-messages' position='top-center' ref={(el) => (this.messages = el)} />
                <Dialog
                    id='uploadFileDialog'
                    header={LocUtils.locFromStoreWithDefault('Choose_files', 'Wybór plików')}
                    visible={this.props.visible}
                    resizable={false}
                    footer={() => <div></div>}
                    breakpoints={{'860px': '75vw', '640px': '100vw'}}
                    onHide={() => this.props.onHide()}
                >
                    <div className='fileuploader-container border'>
                        <FileUpload
                            uploadLabel={LocUtils.locFromStoreWithDefault('Save', 'Zapisz')}
                            chooseLabel={LocUtils.locFromStoreWithDefault('Choose', 'Wybierz')}
                            cancelLabel={LocUtils.locFromStoreWithDefault('Cancel', 'Anuluj')}
                            multiple
                            customUpload
                            onSelect={this.onSelect}
                            onRemove={this.onRemove}
                            onClear={this.onClear}
                            uploadHandler={this.uploadHandler}
                            accept='*'
                            emptyTemplate={
                                <p style={{fontSize: '1.1em', color: 'var(--text-color-secondary)'}} className='m-0'>
                                    {LocUtils.locFromStoreWithDefault(
                                        'Drag_and_drop',
                                        'Przeciągnij i upuść pliki tutaj, aby je przesłać.'
                                    )}
                                </p>
                            }
                        />
                    </div>
                </Dialog>
            </React.Fragment>
        );
    }
}

UploadFileDialog.defaultProps = {
    visible: true,
};

UploadFileDialog.defaultProps = {
    id: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
};
