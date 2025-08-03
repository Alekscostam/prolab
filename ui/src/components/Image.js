/* eslint-disable no-script-url */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';

export const Image = ({
    alt = '',
    base64,
    rendered = true,
    style = {maxHeight: '26px'},
    className,
    canRemove,
    onRemove,
    onImageClick,
}) => {
    if (!!base64) {
        let base64Tmp;
        let indexOfComa = base64?.toString().indexOf('data:image');
        if (indexOfComa === 0) {
            base64Tmp = `${base64}`;
        } else {
            base64Tmp = `data:image/jpeg;base64,${base64}`;
        }
        const base64DataOnly = base64Tmp.split(',')[1];
        const byteArray = Uint8Array.from(atob(base64DataOnly), (c) => c.charCodeAt(0));
        const blob = new Blob([byteArray], {type: 'image/jpeg'}); 
        const blobUrl = URL.createObjectURL(blob);
        if (rendered) {
            return (
                <div className='cursor-pointer'>
                    {canRemove ? (
                        <div className='row'>
                            <div className='ml-3 mr-2' style={{marginTop: '6px'}}>
                                <i
                                    onClick={(e) => {
                                        if (onRemove) {
                                            onRemove(e);
                                        }
                                    }}
                                    style={{
                                        cursor: 'pointer',
                                        fontSize: '22px',
                                    }}
                                    className='icon mdi mdi-trash-can mdi-trash-background trash-icon-treeview'
                                ></i>
                            </div>
                            <img
                                style={style}
                                loading='lazy'
                                className={className}
                                alt={alt}
                                src={blobUrl}
                                onClick={(e) => {
                                    if (onImageClick) {
                                        onImageClick(base64Tmp, e);
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <img
                            style={style}
                            loading='lazy'
                            className={className}
                            alt={alt}
                            src={blobUrl}
                            onClick={(e) => {
                                if (onImageClick) {
                                    onImageClick(base64Tmp, e);
                                }
                            }}
                        />
                    )}
                </div>
            );
        } else {
            return null;
        }
    }
    return null;
};

Image.propTypes = {
    alt: PropTypes.string,
    base64: PropTypes.string.isRequired,
    className: PropTypes.string,
    rendered: PropTypes.bool,
    onImageClick: PropTypes.func,
    style: PropTypes.object,
};

export default Image;
