import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {SelectButton} from 'primereact/selectbutton';

class InputSelectButtonComponent extends Component {
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
						{optionLabel && value ? value[optionLabel] : value}
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
							{optionLabel && value ? value[optionLabel] : value}
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
			disabled,
			id,
			insideTable,
			label,
			multiple,
			name,
			onAfterStateChange,
			onChange,
			optionLabel,
			options,
			publicMode,
			showLabel,
			stateField,
			validator,
			validators,
			value,
			values,
		} = this.props;
		const required =
			validators !== undefined &&
			validators.includes('required') &&
			!validators.includes('not_required');
		return publicMode ? (
			<div className="input_easy_label row pl-0">
				{label !== undefined && showLabel ? (
					<label id={`${id}-label-id`} className="easy_label col-lg-2 col-md-3" htmlFor={id}>
						{label}
					</label>
				) : null}
				<div className="col-md-5">
					<SelectButton
						ariaDescribedBy={`${id}-error`}
						ariaLabel={label}
						ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
						key={id}
						id={id}
						name={name}
						value={multiple ? values : value}
						multiple={multiple}
						options={options}
						optionLabel={optionLabel}
						dataKey={dataKey}
						onChange={e =>
							onChange
								? multiple
									? onChange('MULTI_SELECT_BUTTON', undefined, e, onAfterStateChange, stateField)
									: onChange('SELECT_BUTTON', undefined, e, onAfterStateChange, stateField)
								: null
						}
						validator={validator}
						validators={validators}
						disabled={disabled}
						className="public"
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
						<SelectButton
							ariaDescribedBy={`${id}-error`}
							ariaLabel={label}
							ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
							key={id}
							id={id}
							name={name}
							value={multiple ? values : value}
							multiple={multiple}
							options={options}
							optionLabel={optionLabel}
							dataKey={dataKey}
							onChange={e =>
								onChange
									? multiple
										? onChange('MULTI_SELECT_BUTTON', undefined, e, onAfterStateChange, stateField)
										: onChange('SELECT_BUTTON', undefined, e, onAfterStateChange, stateField)
									: null
							}
							validator={validator}
							validators={validators}
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

InputSelectButtonComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disabled: false,
	insideTable: false,
	multiple: false,
	publicMode: false,
	rendered: true,
	showClear: false,
	showLabel: true,
	stateField: 'element',
	validateViewMode: false,
	validators: 'required',
	viewMode: 'VIEW',
};

InputSelectButtonComponent.propTypes = {
	colClass: PropTypes.string,
	dataKey: PropTypes.string,
	disabled: PropTypes.bool,
	id: PropTypes.string.isRequired,
	insideTable: PropTypes.bool,
	label: PropTypes.string.isRequired,
	multiple: PropTypes.bool,
	name: PropTypes.string.isRequired,
	onAfterStateChange: PropTypes.func,
	onChange: PropTypes.func.isRequired,
	optionLabel: PropTypes.string,
	options: PropTypes.array.isRequired,
	publicMode: PropTypes.bool,
	rendered: PropTypes.bool,
	showLabel: PropTypes.bool,
	stateField: PropTypes.string,
	validateViewMode: PropTypes.bool,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	value: PropTypes.object,
	values: PropTypes.array,
	viewMode: PropTypes.string,
};

export default InputSelectButtonComponent;
