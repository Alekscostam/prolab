/* eslint-disable no-script-url */
/* eslint-disable react/jsx-max-props-per-line */
import React, {useCallback, useState} from 'react';
import FileUploader, {FileUploaderTypes} from 'devextreme-react/file-uploader';
import ProgressBar from 'devextreme-react/progress-bar';
import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';

import '../assets/css/image_viewer.scss';
import LocUtils from '../utils/LocUtils';

const allowedFileExtensions = ['.jpg', '.jpeg', '.gif', '.png'];

export const ImageViewerComponent = (props) => {
    const {editable, base64, labels, visible, onHide} = props;
    const [isDropZoneActive, setIsDropZoneActive] = useState(false);
    const [imageSource, setImageSource] = useState(base64);
    const [textVisible, setTextVisible] = useState(editable);
    const [progressVisible, setProgressVisible] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const onDropZoneEnter = useCallback(
        (e) => {
            if (e.dropZoneElement.id === 'dropzone-external') {
                setIsDropZoneActive(true);
            }
        },
        [setIsDropZoneActive]
    );
    const onDropZoneLeave = useCallback(
        (e) => {
            if (e.dropZoneElement.id === 'dropzone-external') {
                setIsDropZoneActive(false);
            }
        },
        [setIsDropZoneActive]
    );
    const onUploaded = useCallback(
        (e) => {
            const {file} = e;
            const fileReader = new FileReader();
            fileReader.onload = () => {
                setIsDropZoneActive(false);
                setImageSource(fileReader.result);
            };
            fileReader.readAsDataURL(file);
            setTextVisible(false);
            setProgressVisible(false);
            setProgressValue(0);
        },
        [setImageSource, setIsDropZoneActive, setTextVisible, setProgressVisible, setProgressValue]
    );
    const onProgress = useCallback(
        (e) => {
            setProgressValue((e.bytesLoaded / e.bytesTotal) * 100);
        },
        [setProgressValue]
    );
    const onUploadStarted = useCallback(() => {
        setImageSource('');
        setProgressVisible(true);
    }, [setImageSource, setProgressVisible]);
    return (
        <Dialog
            id='imageViewer'
            header=''
            visible={visible}
            resizable={false}
            breakpoints={{'860px': '75vw', '640px': '100vw'}}
            onHide={onHide}
        >
            <div className='widget-container flex-box'>
                <div
                    id='dropzone-external'
                    className={`flex-box ${editable && `cursor-pointer`} ${
                        isDropZoneActive ? 'dx-theme-accent-as-border-color dropzone-active' : 'dx-theme-border-color'
                    }`}
                >
                    {imageSource && <img id='dropzone-image' src={imageSource} alt='' className='cursor-pointer' />}
                    {textVisible && (
                        <div id='dropzone-text' className='flex-box'>
                            <span>{LocUtils.loc(labels, 'drag_and_drop', 'Przeciągnij i upuść')}</span>
                        </div>
                    )}
                    <ProgressBar
                        id='upload-progress'
                        min={0}
                        max={100}
                        width='80%'
                        showStatus={false}
                        visible={progressVisible}
                        value={progressValue}
                    ></ProgressBar>
                </div>
                {editable && (
                    <FileUploader
                        id='file-uploader'
                        dialogTrigger='#dropzone-external'
                        dropZone='#dropzone-external'
                        multiple={false}
                        allowedFileExtensions={allowedFileExtensions}
                        uploadMode='instantly'
                        uploadUrl='https://js.devexpress.com/Demos/NetCore/FileUploader/Upload'
                        visible={false}
                        onDropZoneEnter={onDropZoneEnter}
                        onDropZoneLeave={onDropZoneLeave}
                        onUploaded={onUploaded}
                        onProgress={onProgress}
                        onUploadStarted={onUploadStarted}
                    />
                )}
            </div>
        </Dialog>
    );
};

ImageViewerComponent.defaultProps = {
    visible: false,
    labels: '',
    base64: '',
    style: {maxHeight: '26px'},
    mode: 'EDIT',
};

ImageViewerComponent.propTypes = {
    labels: PropTypes.string.isRequired,
    base64: PropTypes.string,
    editable: PropTypes.bool,
    visible: PropTypes.bool,
    onHide: PropTypes.func,
};

export default ImageViewerComponent;
