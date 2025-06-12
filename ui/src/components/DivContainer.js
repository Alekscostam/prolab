import React from 'react';
import PropTypes from 'prop-types';

export const DivContainer = ({
    id,
    children,
    colClass = 'col-xl-12 col-lg-12 col-md-12 col-sm-12',
    rendered = true,
    style = undefined,
}) => {
    if (rendered) {
        return (
            <div id={id} className={colClass} style={style}>
                {children}
            </div>
        );
    } else {
        return null;
    }
};

DivContainer.propTypes = {
    id: PropTypes.string,
    colClass: PropTypes.string,
    style: PropTypes.object,
    rendered: PropTypes.bool,
};

export default DivContainer;
