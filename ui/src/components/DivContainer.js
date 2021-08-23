import React from 'react';
import PropTypes from 'prop-types';

export const DivContainer = props => {
    const {id, children, colClass, rendered, style} = props;
    if (rendered) {
        return <div id={id} className={colClass} style={style}>{children}</div>;
    } else {
        return null;
    }
};

DivContainer.defaultProps = {
    colClass: 'col-xl-12 col-lg-12 col-md-12 col-sm-12',
    rendered: true,
    style: undefined
};

DivContainer.propTypes = {
    id: PropTypes.string,
    colClass: PropTypes.string,
    style: PropTypes.string,
    rendered: PropTypes.bool,
};

export default DivContainer;
