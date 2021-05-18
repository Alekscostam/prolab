import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { InputNumber } from 'primereact/inputnumber';
//TODO moze wymagać przerobienia, przeniesione z eKOB
class CriteriaInputNumberComponent extends Component {

	onChange(event, name) {
		event.target = []
		event.target.name = name
		event.target.value = event.value
		this.props.onChange(event)
	}

	render() {
		const {
			disabled,
			id,
			keyfilter,
			label,
			min,
			max,
			name,
			onChange,
			placeholder,
			showLabel,
			validator,
			validators,
			value,
			mode,
			locale,
			currency,
			minFractionDigits,
			maxFractionDigits,
		} = this.props;
		const required =
			validators !== undefined &&
			validators.includes('required') &&
			!validators.includes('not_required');
		return (
			<React.Fragment>
				<InputNumber
					ariaDescribedBy={`${id}-error`}
					ariaLabel={label}
					ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
					key={id}
					id={id}
					name={name}
					min={min}
					max={max}
					keyfilter={keyfilter}
					placeholder={placeholder}
					style={{ width: '100%' }}
					value={value}
					onChange={e => (onChange ? this.onChange(e, name) : null)}
					disabled={disabled}
					required={required}
					showButtons
					mode={mode}
					locale={locale}
					currency={currency}
					minFractionDigits={minFractionDigits}
					maxFractionDigits={maxFractionDigits}
				/>
				<div aria-live="assertive">
					{validator ? validator.message(id, label, value, validators) : null}
				</div>
			</React.Fragment>
		);
	}
}

CriteriaInputNumberComponent.defaultProps = {
	blackMode: false,
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disabled: false,
	formGroup: true,
	iconSide: 'left',
	insideTable: false,
	min: undefined,
	max: undefined,
	placeholder: '',
	rendered: true,
	showLabel: true,
	stateField: 'element',
	validateViewMode: false,
	validators: 'required',
	mode: "decimal"
};

CriteriaInputNumberComponent.propTypes = {
	blackMode: PropTypes.bool,
	colClass: PropTypes.string,
	disabled: PropTypes.bool,
	formGroup: PropTypes.bool,
	iconColor: PropTypes.string,
	iconName: PropTypes.string,
	iconSide: PropTypes.string,
	iconSize: PropTypes.string,
	id: PropTypes.string.isRequired,
	insideTable: PropTypes.bool,
	keyfilter: PropTypes.string,
	label: PropTypes.string.isRequired,
	min: PropTypes.number,
	max: PropTypes.number,
	name: PropTypes.string.isRequired,
	onAfterStateChange: PropTypes.func,
	onChange: PropTypes.func.isRequired,
	placeholder: PropTypes.string,
	rendered: PropTypes.bool,
	showLabel: PropTypes.bool,
	stateField: PropTypes.string,
	validateViewMode: PropTypes.bool,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	value: PropTypes.number,
	mode: PropTypes.string,
	locale: PropTypes.string,
	currency: PropTypes.string,
	minFractionDigits: PropTypes.number,
	maxFractionDigits: PropTypes.number,
};

export default CriteriaInputNumberComponent;
