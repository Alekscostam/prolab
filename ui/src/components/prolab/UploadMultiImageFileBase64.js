import React from 'react';
import PropTypes from 'prop-types';

import '../../assets/css/multi_image_upload_base64.scss';
import ConsoleHelper from '../../utils/ConsoleHelper';

class UploadMultiImageFileBase64 extends React.Component {
    componentDidMount() {
        this.makeDropRegion();
        this.makeFakeInput();
        this.initImages();
    }

    initImages() {
        if (this.props.clearOnInput === true) {
            this.clearPreview();
        }
        let initBase64 = this.props.multiple ? this.props.initBase64 : [this.props.initBase64];
        if (initBase64) {
            Array.from(initBase64).forEach((imageBase64) => {
                if (this.props.preview === true && !!imageBase64) {
                    let imagePreviewRegion = document.getElementById('image-preview');
                    // container
                    let imgView = document.createElement('div');
                    imgView.className = 'image-view';
                    imagePreviewRegion.appendChild(imgView);
                    // create preview image
                    let img = document.createElement('img');
                    img.src = `data:image/jpeg;base64,${imageBase64}`;
                    imgView.appendChild(img);
                    // progress overlay
                    let overlay = document.createElement('div');
                    overlay.className = 'overlay';
                    imgView.appendChild(overlay);
                }
            });
        }
    }

    makeDropRegion() {
        let dropRegion = document.getElementById('drop-region');
        dropRegion.addEventListener('dragenter', this.preventDefault, false);
        dropRegion.addEventListener('dragleave', this.preventDefault, false);
        dropRegion.addEventListener('dragover', this.preventDefault, false);
        dropRegion.addEventListener('drop', this.preventDefault, false);
        dropRegion.addEventListener('drop', this.handleDrop.bind(this), false);
    }

    makeFakeInput() {
        let dropRegion = document.getElementById('drop-region');
        // open file selector when clicked on the drop region
        let fakeInput = document.createElement('input');
        fakeInput.type = 'file';
        fakeInput.accept = this.props.accept;
        fakeInput.multiple = this.props.multiple;
        dropRegion.addEventListener('click', function () {
            fakeInput.click();
        });
        let that = this;
        fakeInput.addEventListener('change', function () {
            let files = fakeInput.files;
            that.handleFiles(files);
        });
    }

    preventDefault(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    validateImage(imageFiles) {
        const BreakException = {};
        try {
            Array.from(imageFiles).forEach((imageFile) => {
                // check the type
                if (!!imageFile) {
                    let validTypes = this.props.validTypes;
                    if (validTypes.indexOf(imageFile?.type) === -1) {
                        if (this.props.onError !== undefined) {
                            this.props.onError(this.props.invalidFileTypeText);
                        }
                        throw BreakException;
                    }
                    // check the size
                    let maxSizeInBytes = this.props.maxSize;
                    if (!!maxSizeInBytes && imageFile?.size > maxSizeInBytes) {
                        if (this.props.onError !== undefined) {
                            this.props.onError(this.props.tooLargeFileText);
                        }
                        throw BreakException;
                    }
                }
            });
        } catch (e) {
            if (e === BreakException) {
                return false;
            }
        }
        return true;
    }

    clearPreview() {
        ConsoleHelper('clearPreview');
        var imagePreviewRegion = document.getElementById('image-preview');
        imagePreviewRegion.innerHTML = '';
    }

    previewAndUploadImage(imageFiles) {
        let base64Images = [];
        let imagesCount = imageFiles.length;
        let count = 1;
        Array.from(imageFiles).forEach((imageFile) => {
            if (this.props.preview === true) {
                var imagePreviewRegion = document.getElementById('image-preview');

                // container
                var imgView = document.createElement('div');
                imgView.className = 'image-view';
                imagePreviewRegion.appendChild(imgView);

                // create preview image
                var img = document.createElement('img');
                img.src = imageFile?.cre;
                imgView.appendChild(img);

                // progress overlay
                var overlay = document.createElement('div');
                overlay.className = 'overlay';
                imgView.appendChild(overlay);
            }
            // read the image...
            var reader = new FileReader();
            reader.onload = (e) => {
                if (this.props.preview === true) {
                    img.src = e.target.result;
                    let data = e.target.result.toString();
                    const index = data.indexOf('base64,') + 7;
                    try {
                        base64Images.push(data.substring(index));
                    } catch (err) {
                        ConsoleHelper('UploadMultiImageFileBase64 err=', err);
                    }
                }
                if (this.props.onSuccessB64 !== undefined && count >= imagesCount) {
                    this.props.onSuccessB64(base64Images);
                }
                count++;
            };
            ConsoleHelper('imageFile');
            ConsoleHelper(imageFile);
            if (!!imageFile) {
                reader.readAsDataURL(imageFile);
            } else {
                this.clearPreview();
            }
        });
    }

    handleFiles(files) {
        ConsoleHelper('previewAndUploadImage');
        if (this.props.clearOnInput === true) {
            this.clearPreview();
        }
        if (this.props.multiple === true) {
            if (this.validateImage(files)) {
                this.previewAndUploadImage(files);
            }
        } else {
            if (this.validateImage([files[files.length - 1]])) {
                this.previewAndUploadImage([files[files.length - 1]]);
            }
        }
    }

    handleDrop(e) {
        var dt = e.dataTransfer,
            files = dt.files;
        if (files.length) {
            this.handleFiles(files);
        } else {
            //drag andd drop fm chrome
            if (this.props.dragFromWeb === true) {
                var html = dt.getData('text/html'),
                    match = html && /\bsrc="?([^"\s]+)"?\s*/.exec(html),
                    url = match && match[1];
                if (url) {
                    fetch(url)
                        .then((res) => {
                            return res.blob();
                        })
                        .then((blob) => {
                            var blobToFile = (theBlob, fileName) => {
                                theBlob.lastModifiedDate = new Date();
                                theBlob.name = fileName;
                                return theBlob;
                            };
                            this.handleFiles(
                                new Array(
                                    blobToFile(
                                        blob,
                                        Math.random().toString(36).substring(7) + '.' + blob.type.split('/')[1]
                                    )
                                )
                            );
                        })
                        .catch((err) => {
                            if (this.props.onError !== undefined) {
                                this.props.onError(err);
                            }
                        });
                }
            }
        }
    }

    render() {
        return (
            <React.Fragment>
                <div id='drop-region' style={{width: '100%'}}>
                    <div className='drop-message'>{this.props.displayText}</div>
                    <div id='image-preview' />
                </div>
                {this.props.deleteBtn && (
                    <a
                        id='trash-button'
                        type='button'
                        onClick={() => {
                            const imagePreview = document.getElementById('image-preview');
                            const img = imagePreview?.children[0]?.children[0];
                            if (img) {
                                img.src = '';
                                this.props.onDeleteChange();
                            }
                        }}
                        className='p-button-secondary selectionList float-right mt-2'
                    >
                        <i
                            style={{fontSize: '25px', color: this.props.whiteBtnColor ? 'white' : '#0e49eb'}}
                            className='icon mdi mdi-trash-can '
                        ></i>
                    </a>
                )}
            </React.Fragment>
        );
    }
}

UploadMultiImageFileBase64.propTypes = {
    onSuccessBlob: PropTypes.func,
    onSuccessB64: PropTypes.func,
    onDeleteChange: PropTypes.func,
    onError: PropTypes.func,
    displayText: PropTypes.string,
    invalidFileTypeText: PropTypes.string,
    tooLargeFileText: PropTypes.string,
    accept: PropTypes.string,
    validTypes: PropTypes.array,
    dragFromWeb: PropTypes.bool,
    multiple: PropTypes.bool,
    maxSize: PropTypes.any,
    clearOnInput: PropTypes.bool,
    preview: PropTypes.bool,
    alt: PropTypes.string.isRequired,
    initBase64: PropTypes.any.isRequired,
    className: PropTypes.string,
    rendered: PropTypes.bool,
    redBtnColor: PropTypes.bool,
    deleteBtn: PropTypes.bool,
};

UploadMultiImageFileBase64.defaultProps = {
    className: '',
    onSuccessBlob: undefined,
    onDeleteChange: undefined,
    onSuccessB64: undefined,
    onError: undefined,
    displayText: 'Drag & Drop images or click to upload',
    invalidFileTypeText: 'Invalid File Type',
    tooLargeFileText: 'File too large',
    validTypes: ['image/jpeg', 'image/png', 'image/gif'],
    accept: 'image/*',
    dragFromWeb: true,
    multiple: true,
    clearOnInput: true,
    preview: true,
    deleteBtn: false,
    redBtnColor: false,
    maxSize: undefined, // 1MB
};

export default UploadMultiImageFileBase64;
