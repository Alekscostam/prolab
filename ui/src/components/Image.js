/* eslint-disable no-script-url */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';

export const Image = (props) => {
    const {alt, base64, rendered, style, className} = props;
    if (!!base64) {
        let base64Tmp
        let indexOfComa = base64?.toString().indexOf("data:image");
        if (indexOfComa === 0) {
            base64Tmp = `${base64}`;
        } else {
            base64Tmp = `data:image/jpeg;base64,${base64}`;
        }
        if (rendered) {
            return <img style={style} className={className} alt={alt} src={base64Tmp}/>;
        } else {
            return null;
        }
    }
    return null;
};

Image.defaultProps = {
    rendered: true,
    alt: ''
};

Image.propTypes = {
    alt: PropTypes.string.isRequired,
    base64: PropTypes.string.isRequired,
    className: PropTypes.string,
    rendered: PropTypes.bool,
    style: PropTypes.object,
};

export default Image;
