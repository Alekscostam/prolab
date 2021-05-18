import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MultiSelect } from 'primereact/multiselect';

class InputMultiSelectComponent extends Component {

	renderView() {
		const {
			colClass,
			id,
			insideTable,
			label,
			optionLabel,
			publicMode,
			showLabel,
			value,
			validateViewMode,
			validator,
			validators,
		} = this.props;
		return publicMode ? (
			<div className="input_easy_label row pl-0">
				{label !== undefined && showLabel ? (
					<label id={`${id}-label-id`} className="easy_label col-lg-2 col-md-3" htmlFor={id}>
						{label}
					</label>
				) : null}
				<div className="col-md-5">
					<span aria-label={label} aria-labelledby={`${id}-label-id`} className="p-inputtext-view">
						{value && value.length > 0 ? value.map(v => v[optionLabel]).join(', ') : ''}
					</span>
					{validateViewMode && validator ? validator.message(id, label, value, validators) : null}
				</div>
			</div>
		) : (
			<div className={insideTable ? '' : colClass}>
				<div className={insideTable ? '' : 'row'}>
					<div className={insideTable ? '' : 'col-md-12 form-group'}>
						{label !== undefined && showLabel ? (
							<label
								id={`${id}-label-id`}
								className="p-label"
								htmlFor={id}
								style={{ width: '100%' }}
							>
								{label}
							</label>
						) : null}
						<span
							aria-label={label}
							aria-labelledby={`${id}-label-id`}
							className="p-inputtext-view"
						>
							{value && value.length > 0 ? value.map(v => v[optionLabel]).join(', ') : ''}
						</span>
						{validateViewMode && validator ? validator.message(id, label, value, validators) : null}
					</div>
				</div>
			</div>
		);
	}

	renderEdit() {
		return this.renderNew();
	}

	renderNew() {
		const {
			colClass,
			dataKey,
			disableAllChecked,
			disabled,
			filter,
			filterBy,
			id,
			insideTable,
			label,
			name,
			maxSelectedLabels,
			onAfterStateChange,
			onChange,
			optionLabel,
			options,
			optionDisabledField,
			optionDisabledReversed,
			optionsDisabled,
			placeholder,
			publicMode,
			selectedItemsLabel,
			showClear,
			showLabel,
			stateField,
			validator,
			validators,
			value,
		} = this.props;
		const required =
			validators !== undefined &&
			validators.includes('array_required') &&
			!validators.includes('not_required');
		return publicMode ? (
			<div className="input_easy_label row pl-0">
				{label !== undefined && showLabel ? (
					<label id={`${id}-label-id`} className="easy_label col-lg-2 col-md-3" htmlFor={id}>
						{label}
					</label>
				) : null}
				<div className="col-md-5">
					<MultiSelect
						ariaDescribedBy={`${id}-error`}
						ariaLabel={label}
						ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
						key={id}
						id={id}
						name={name}
						style={{ width: '100%' }}
						value={value}
						options={options}
						optionLabel={optionLabel}
						optionDisabledField={optionDisabledField}
						optionDisabledReversed={optionDisabledReversed}
						optionsDisabled={optionsDisabled}
						dataKey={dataKey}
						disableAllChecked={disableAllChecked}
						onChange={e =>
							onChange
								? onChange('MULTI_SELECT', undefined, e, onAfterStateChange, stateField)
								: null
						}
						placeholder={placeholder}
						filter={filter}
						filterBy={filterBy}
						showClear={showClear}
						validator={validator}
						validators={validators}
						disabled={disabled}
						selectedItemsLabel={selectedItemsLabel}
						maxSelectedLabels={maxSelectedLabels}
						required={required}
					/>
					<div aria-live="assertive">
						{validator ? validator.message(id, label, value, validators) : null}
					</div>
				</div>
			</div>
		) : (
			<div className={insideTable ? '' : colClass}>
				<div className={insideTable ? '' : 'row'}>
					<div className={insideTable ? '' : 'col-md-12 form-group'}>
						{label !== undefined && showLabel ? (
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
							ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
							disableAllChecked={disableAllChecked}
							key={id}
							id={id}
							name={name}
							style={{ width: '100%' }}
							value={value}
							options={options}
							optionLabel={optionLabel}
							optionDisabledField={optionDisabledField}
							optionDisabledReversed={optionDisabledReversed}
							optionsDisabled={optionsDisabled}
							dataKey={dataKey}
							onChange={e =>
								onChange
									? onChange('MULTI_SELECT', undefined, e, onAfterStateChange, stateField)
									: null
							}
							placeholder={placeholder}
							filter={filter}
							filterBy={filterBy}
							showClear={showClear}
							validator={validator}
							validators={validators}
							disabled={disabled}
							selectedItemsLabel={selectedItemsLabel}
							maxSelectedLabels={maxSelectedLabels}
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

	render() {
		const { rendered, viewMode } = this.props;
		if (rendered) {
			switch (viewMode) {
				case 'NEW':
					return this.renderNew();
				case 'EDIT':
					return this.renderEdit();
				case 'VIEW':
				default:
					return this.renderView();
			}
		} else {
			return null;
		}
	}
}

InputMultiSelectComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disableAllChecked: false,
	disabled: false,
	filter: false,
	filterBy: 'label',
	insideTable: false,
	maxSelectedLabels: 4,
	optionsDisabled: false,
	optionDisabledReversed: false,
	placeholder: 'Wybierz',
	publicMode: false,
	rendered: true,
	selectedItemsLabel: 'Wybrano {0} pozycji',
	showClear: false,
	showLabel: true,
	stateField: 'element',
	validateViewMode: false,
	validators: 'array_required',
	viewMode: 'VIEW',
};

InputMultiSelectComponent.propTypes = {
	colClass: PropTypes.string,
	dataKey: PropTypes.string,
	disableAllChecked: PropTypes.bool,
	disabled: PropTypes.bool,
	filter: PropTypes.bool,
	filterBy: PropTypes.string,
	id: PropTypes.string.isRequired,
	insideTable: PropTypes.bool,
	label: PropTypes.string.isRequired,
	maxSelectedLabels: PropTypes.number,
	name: PropTypes.string.isRequired,
	onAfterStateChange: PropTypes.func,
	onChange: PropTypes.func.isRequired,
	optionDisabledField: PropTypes.string,
	optionDisabledReversed: PropTypes.bool,
	optionLabel: PropTypes.string,
	options: PropTypes.array.isRequired,
	optionsDisabled: PropTypes.bool,
	placeholder: PropTypes.string,
	publicMode: PropTypes.bool,
	rendered: PropTypes.bool,
	selectedItemsLabel: PropTypes.string,
	showClear: PropTypes.bool,
	showLabel: PropTypes.bool,
	stateField: PropTypes.string,
	validateViewMode: PropTypes.bool,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	value: PropTypes.array,
	viewMode: PropTypes.string,
};

export default InputMultiSelectComponent;
