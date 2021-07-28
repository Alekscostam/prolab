/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';

export const HeaderButton = props => {
    return <div className="row">
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 mb-2">{props.children}</div>
    </div>

}

HeaderButton.defaultProps = {
    colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
};

HeaderButton.propTypes = {
    className: PropTypes.string,
};

export default HeaderButton;
