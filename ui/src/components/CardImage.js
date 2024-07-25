import React from 'react';
import PropTypes from 'prop-types';

export const CardImage = (props) => {
    const {alt, base64, rendered, style, className,  onClick} = props;
    let base64Tmp;
    let indexOfComa = base64?.indexOf('data:image');
    if (indexOfComa === 0) {
        base64Tmp = `${base64}`;
    } else {
        base64Tmp = `data:image/jpeg;base64,${base64}`;
    }
    if (rendered) {
        return <img onClick={(e)=>{
            if(props.onClick){
                props.onClick(e)
            }
        }} style={style} className={className} alt={alt} src={base64Tmp} />;
    } else {
        return null;
    }
};

CardImage.defaultProps = {
    rendered: true,
};

CardImage.propTypes = {
    alt: PropTypes.string.isRequired,
    base64: PropTypes.string.isRequired,
    className: PropTypes.string,
    rendered: PropTypes.bool,
    style: PropTypes.object,
    onClick: PropTypes.func,
};

export default CardImage;
