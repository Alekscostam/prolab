import React from 'react';
import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';
import LocUtils from '../../utils/LocUtils';
import {Toast} from 'primereact/toast';
import {FileUploader} from 'devextreme-react';
import ActionButton from '../ActionButton';

export default class UploadFileDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedFiles: undefined,
        };
    }

    handleFileSelect = (selectedFiles) => {
        this.setState({
            selectedFiles,
        });
    };

    handleSubmit = async (event) => {
        event.preventDefault();

        let fileArrays = [];

        if (!this.state.selectedFiles) {
            return;
        }

        this.state.selectedFiles.forEach((selectedFile) => {
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
                    id='attachmentDialog'
                    header={LocUtils.loc(this.props.labels, 'Choose_file_header', 'Wybór plików')}
                    footer={
                        <React.Fragment>
                            <ActionButton
                                className='p-link'
                                label='Zapisz'
                                variant='accent'
                                handleClick={this.handleSubmit}
                            />
                        </React.Fragment>
                    }
                    visible={this.props.visible}
                    resizable={false}
                    breakpoints={{'860px': '75vw', '640px': '100vw'}}
                    onHide={() => this.props.onHide()}
                >
                    <div className='fileuploader-container border'>
                        <FileUploader
                            selectButtonText='Wybierz pliki'
                            style={{width: '300px'}}
                            multiple={true}
                            labelText=''
                            onValueChange={this.handleFileSelect}
                            uploadMode='useForm'
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
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
};
