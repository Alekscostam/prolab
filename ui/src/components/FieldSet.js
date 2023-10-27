import React from 'react';
import PropTypes from 'prop-types';
import DivContainer from './DivContainer';

export const FieldSet = props => {
	const { children, colClass, label, publicMode, rendered } = props;
	if (rendered) {
		if (publicMode) {
			return (
				<fieldset className={colClass}>
					{label ? <legend className="p-label p-label-bold">{label}</legend> : null}
					{children}
				</fieldset>
			);
		} else {
			return (
				<fieldset className={colClass}>
					{label ? <legend className="p-label p-label-bold">{label}</legend> : null}
					<DivContainer colClass="row">{children}</DivContainer>
				</fieldset>
			);
		}
	} else {
		return null;
	}
};

FieldSet.defaultProps = {
	colClass: 'col-xl-12 col-lg-12 col-md-12 col-sm-12',
	publicMode: false,
	rendered: true,
};

FieldSet.propTypes = {
	colClass: PropTypes.string,
	label: PropTypes.string,
	publicMode: PropTypes.bool,
	rendered: PropTypes.bool,
};

export default FieldSet;
