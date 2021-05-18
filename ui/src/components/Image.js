/* eslint-disable no-script-url */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';

export const Image = (props) => {
	const { alt, base64, rendered } = props;
	if (rendered) {
		return <img alt={alt} src={`data:image/jpeg;base64,${base64}`} />;
	} else {
		return null;
	}
};

Image.defaultProps = {
	rendered: true,
};

Image.propTypes = {
	alt: PropTypes.string.isRequired,
	base64: PropTypes.string.isRequired,
	rendered: PropTypes.bool,
};

export default Image;
