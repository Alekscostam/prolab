import {InputText} from 'primereact/inputtext';
import PropTypes from 'prop-types';
import React from 'react';

export const CriteriaTextComponent = props => {
	const {
		colClass,
		disabled,
		id,
		label,
		name,
		onChange,
		placeholder,
		showLabel,
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
					{label !== undefined && showLabel ? (
						// eslint-disable-next-line react/jsx-max-props-per-line
						<label id={`${id}-label-id`} className="p-label" htmlFor={id} style={{ width: '100%' }}>
							{label}
						</label>
					) : null}
					<InputText
						ariaLabel={label}
						ariaDescribedBy={`${id}-error`}
						ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
						key={id}
						id={id}
						name={name}
						type="text"
						style={{ width: '100%' }}
						value={value}
						placeholder={placeholder}
						onChange={onChange}
						disabled={disabled}
						required={required}
					/>
					<div aria-live="assertive">
						{validator ? validator.message(id, label, value, validators) : null}
					</div>
				</div>
			</div>
		</div>
	);
};

CriteriaTextComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disabled: false,
	placeholder: '',
	showLabel: true,
	validators: 'not_required',
};

CriteriaTextComponent.propTypes = {
	colClass: PropTypes.string,
	disabled: PropTypes.bool,
	id: PropTypes.string.isRequired,
	label: PropTypes.string,
	name: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	placeholder: PropTypes.string,
	showLabel: PropTypes.bool,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	value: PropTypes.string,
};

export default CriteriaTextComponent;
