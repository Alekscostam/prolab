/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import {Checkbox} from 'primereact/checkbox';

export const CriteriaCheckboxComponent = props => {
	const {
		colClass,
		disabled,
		id,
		label,
		labelOnRight,
		name,
		onChange,
		validator,
		validators,
		value,
	} = props;
	const required =
		validators !== undefined &&
		validators.includes('required') &&
		!validators.includes('not_required');
	return (
		<div className={colClass}>
			<div className="row">
				<div className="col-md-12 form-group">
					{label !== undefined && !labelOnRight ? (
						<label
							id={`${id}-label-id`}
							className="p-label"
							htmlFor={`${id}-input`}
							style={{ width: '100%' }}
						>
							{label}
						</label>
					) : null}
					<Checkbox
						ariaDescribedBy={`${id}-error`}
						ariaLabel={label}
						ariaLabelledBy={label === undefined ? `${id}-label-id` : undefined}
						key={id}
						id={id}
						inputId={`${id}-input`}
						name={name}
						checked={value}
						onChange={onChange}
						disabled={disabled}
						required={required}
					/>
					{label !== undefined && labelOnRight ? (
						<label id={`${id}-label-id`} htmlFor={id} className="p-checkbox-label p-label">
							{label}
						</label>
					) : null}
					<div aria-live="assertive">
						{validator ? validator.message(id, label, value, validators) : null}
					</div>
				</div>
			</div>
		</div>
	);
};

CriteriaCheckboxComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disabled: false,
	labelOnRight: false,
	placeholder: '',
	validators: 'not_required|boolean',
};

CriteriaCheckboxComponent.propTypes = {
	colClass: PropTypes.string,
	disabled: PropTypes.bool,
	id: PropTypes.string.isRequired,
	label: PropTypes.string,
	labelOnRight: PropTypes.bool,
	name: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	value: PropTypes.bool,
};

export default CriteriaCheckboxComponent;
