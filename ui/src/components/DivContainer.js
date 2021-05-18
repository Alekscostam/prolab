import React from 'react';
import PropTypes from 'prop-types';

export const DivContainer = props => {
	const { children, colClass, rendered } = props;
	if (rendered) {
		return <div className={colClass}>{children}</div>;
	} else {
		return null;
	}
};

DivContainer.defaultProps = {
	colClass: 'col-xl-12 col-lg-12 col-md-12 col-sm-12',
	rendered: true,
};

DivContainer.propTypes = {
	colClass: PropTypes.string,
	rendered: PropTypes.bool,
};

export default DivContainer;
