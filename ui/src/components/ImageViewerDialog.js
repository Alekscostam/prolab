/* eslint-disable no-script-url */
/* eslint-disable react/jsx-max-props-per-line */
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';
import {Button} from 'primereact/button';
import '../assets/css/image_viewer.scss';
import LocUtils from '../utils/LocUtils';
import UploadMultiImageFileBase64 from './prolab/UploadMultiImageFileBase64';
import {StringUtils} from '../utils/StringUtils';

export const ImageViewerDialog = (props) => {
    const {editable, base64, visible, onHide, onApprove, header, viewBase64} = props;
    const [imageSource, setImageSource] = useState(base64);
    return (
        <Dialog
            id='imageViewer'
            header={header}
            visible={visible}
            resizable={false}
            footer={
                editable ? (
                    <React.Fragment>
                        <Button
                            type='button'
                            onClick={() => {
                                if (onApprove) {
                                    onApprove(imageSource);
                                }
                            }}
                            label={LocUtils.locFromStoreWithDefault('Confirm', 'Zatwierdź')}
                        />
                    </React.Fragment>
                ) : (
                    <div></div>
                )
            }
            breakpoints={{'860px': '75vw', '640px': '100vw'}}
            onHide={onHide}
        >
            <div className='widget-container flex-box'>
                {editable ? (
                    <React.Fragment>
                        <UploadMultiImageFileBase64
                            multiple={false}
                            displayText={
                                imageSource === ''
                                    ? LocUtils.locFromStoreWithDefault('Choose_image', 'Wybierz obrazek')
                                    : ''
                            }
                            alt={''}
                            initBase64={StringUtils.isBlank(imageSource) ? '' : imageSource}
                            onSuccessB64={(e) => {
                                setImageSource(e[0]);
                            }}
                            onError={() => {}}
                        />
                    </React.Fragment>
                ) : (
                    <img id='image-viewier' src={viewBase64} alt='' />
                )}
            </div>
        </Dialog>
    );
};

ImageViewerDialog.defaultProps = {
    visible: false,
    base64: '',
    header: '',
    viewBase64: '',
    style: {maxHeight: '26px'},
    mode: 'EDIT',
};

ImageViewerDialog.propTypes = {
    viewBase64: PropTypes.string.isRequired,
    base64: PropTypes.string,
    header: PropTypes.string,
    editable: PropTypes.bool,
    visible: PropTypes.bool,
    onHide: PropTypes.func,
};

export default ImageViewerDialog;
