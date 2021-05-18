import React from 'react';
import PropTypes from 'prop-types';

export const CustomLabel = props => {
	const { className, colClass, label, rendered } = props;
	if (rendered) {
		return (
			<div className={colClass}>
				<div className="row">
					<div className="col-md-12">
						{label ? (
							<span className={`p-label ${className}`} style={{ width: '100%' }}>
								{label}
							</span>
						) : null}
					</div>
				</div>
			</div>
		);
	} else {
		return null;
	}
};

CustomLabel.defaultProps = {
	className: 'p-label-bold',
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	rendered: true,
};

CustomLabel.propTypes = {
	className: PropTypes.string,
	colClass: PropTypes.string,
	label: PropTypes.string.isRequired,
	rendered: PropTypes.bool,
};

export default CustomLabel;
