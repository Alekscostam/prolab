import React from 'react';
import PropTypes from 'prop-types';
import {MultiSelect} from 'primereact/multiselect';

class CriteriaMultiSelectComponent extends React.Component {
	componentDidMount() {}

	render() {
		const {
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
			options,
			placeholder,
			selectedItemsLabel,
			showClear,
			validator,
			validators,
			value,
		} = this.props;
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
								htmlFor={id}
								style={{ width: '100%' }}
							>
								{label}
							</label>
						) : null}
						<MultiSelect
							ariaDescribedBy={`${id}-error`}
							ariaLabel={label}
							ariaLabelledBy={label === undefined ? `${id}-label-id` : undefined}
							key={id}
							id={id}
							name={name}
							style={{ width: '100%' }}
							value={value}
							options={options}
							optionLabel={optionLabel}
							dataKey={dataKey}
							onChange={onChange}
							placeholder={placeholder}
							filter={filter}
							filterBy={filterBy}
							showClear={showClear}
							validator={validator}
							validators={validators}
							disabled={disabled}
							maxSelectedLabels={4}
							selectedItemsLabel={selectedItemsLabel}
							fixedPlaceholder={
								value !== undefined && options !== undefined
									? value.length >= options.length
									: false
							}
							required={required}
						/>
						<div aria-live="assertive">
							{validator ? validator.message(id, label, value, validators) : null}
						</div>
					</div>
				</div>
			</div>
		);
	}
}

CriteriaMultiSelectComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disabled: false,
	filter: false,
	filterBy: 'label',
	placeholder: 'Wybierz',
	selectedItemsLabel: 'Wybrano {0} pozycji',
	showClear: false,
	validators: 'not_required',
};

CriteriaMultiSelectComponent.propTypes = {
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
	options: PropTypes.array.isRequired,
	placeholder: PropTypes.string,
	selectedItemsLabel: PropTypes.string,
	showClear: PropTypes.bool,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	value: PropTypes.any,
};

export default CriteriaMultiSelectComponent;
