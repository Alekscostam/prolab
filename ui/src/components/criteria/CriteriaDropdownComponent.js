import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'primereact/dropdown';

export const CriteriaDropdownComponent = props => {
	const {
		appendTo,
		colClass,
		dataKey,
		disabled,
		filter,
		filterBy,
		id,
		label,
		name,
		onChange,
		optionLabel,
		optionValue,
		options,
		placeholder,
		showClear,
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
					{label !== undefined ? (
						// eslint-disable-next-line react/jsx-max-props-per-line
						<label
							id={`${id}-label-id`}
							className="p-label"
							htmlFor={`${id}-input`}
							style={{ width: '100%' }}
						>
							{label}
						</label>
					) : null}
					<Dropdown
						appendTo={appendTo}
						ariaDescribedBy={`${id}-error`}
						ariaLabel={label}
						ariaLabelledBy={label === undefined ? `${id}-label-id` : undefined}
						key={id}
						id={id}
						inputId={`${id}-input`}
						name={name}
						style={{ width: '100%' }}
						value={value}
						options={options}
						optionLabel={optionLabel}
						dataKey={dataKey}
						onChange={e => onChange(e, optionValue)}
						placeholder={placeholder}
						filter={filter}
						filterBy={filterBy}
						showClear={showClear}
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

CriteriaDropdownComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disabled: false,
	filter: false,
	filterBy: 'label',
	placeholder: 'Wybierz',
	showClear: false,
	validators: 'not_required',
};

CriteriaDropdownComponent.propTypes = {
	appendTo: PropTypes.any,
	colClass: PropTypes.string,
	dataKey: PropTypes.string,
	disabled: PropTypes.bool,
	filter: PropTypes.bool,
	filterBy: PropTypes.string,
	id: PropTypes.string.isRequired,
	label: PropTypes.string,
	name: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	optionLabel: PropTypes.string,
	optionValue: PropTypes.string,
	options: PropTypes.array.isRequired,
	placeholder: PropTypes.string,
	showClear: PropTypes.bool,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	value: PropTypes.any,
};

export default CriteriaDropdownComponent;
