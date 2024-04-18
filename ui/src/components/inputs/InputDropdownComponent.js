import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Dropdown} from 'primereact/dropdown';
import { InputType } from '../../model/InputType';

class InputDropdownComponent extends Component {
	renderView() {
		const {
			children,
			colClass,
			id,
			insideTable,
			label,
			optionLabel,
			publicMode,
			showLabel,
			value,
			valueView,
			validateViewMode,
			validator,
			validators,
		} = this.props;
		let displayValue = '';
		if (valueView) {
			displayValue = valueView;
		} else if (optionLabel && value && value[optionLabel]) {
			displayValue = value[optionLabel];
		} else if (value && value instanceof String) {
			displayValue = value;
		}
		return publicMode ? (
			<div className="input_easy_label row pl-0">
				{label !== undefined && showLabel ? (
					<label id={`${id}-label-id`} className="easy_label col-lg-2 col-md-3" htmlFor={id}>
						{label}
					</label>
				) : null}
				<div className="col-md-5">
					<span aria-label={label} aria-labelledby={`${id}-label-id`} className="p-inputtext-view">
						{displayValue}
					</span>
					{children ? children() : null}
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
							{displayValue}
						</span>
						{children ? children() : null}
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
			appendTo,
			children,
			colClass,
			dataKey,
			disabled,
			filter,
			id,
			insideTable,
			label,
			name,
			onAfterStateChange,
			onChange,
			optionLabel,
			optionValue,
			options,
			placeholder,
			publicMode,
			showClear,
			showLabel,
			stateField,
			validator,
			validators,
			value,
		} = this.props;
		const required =
			validators !== undefined &&
			validators.includes('required') &&
			!validators.includes('not_required');
		return publicMode ? (
			<div className="input_easy_label row pl-0">
				{label !== undefined && showLabel ? (
					<label
						id={`${id}-label-id`}
						className="easy_label col-lg-2 col-md-3"
						htmlFor={`${id}-input`}
					>
						{label}
					</label>
				) : null}
				<div className="col-md-5">
					<Dropdown
						appendTo={appendTo}
						ariaDescribedBy={`${id}-error`}
						ariaLabel={label}
						ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
						key={id}
						id={id}
						inputId={`${id}-input`}
						name={name}
						style={{ width: '100%' }}
						value={value}
						options={options}
						optionLabel={optionLabel}
						dataKey={dataKey}
						onChange={e =>
							onChange
								? onChange(InputType.DROPDOWN, [optionValue], e, onAfterStateChange, stateField)
								: null
						}
						placeholder={placeholder}
						filter={filter}
						filterBy="label"
						showClear={showClear}
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
		) : (
			<div className={insideTable ? '' : colClass}>
				<div className={insideTable ? '' : 'row'}>
					<div className={children !== undefined ? 'col-md-12 form-group' : 'col-md-12'}>
						<div className={children !== undefined ? 'row' : 'row'}>
							<div
								className={
									insideTable
										? 'width-100'
										: children !== undefined
										? 'col-8 col-lg-9 col-md-7'
										: 'col-md-12 form-group'
								}
							>
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
								<Dropdown
									appendTo={appendTo}
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
									dataKey={dataKey}
									onChange={e =>
										onChange
											? onChange(InputType.DROPDOWN, [optionValue], e, onAfterStateChange, stateField)
											: null
									}
									placeholder={placeholder}
									filter={filter}
									filterBy="label"
									showClear={showClear}
									validator={validator}
									validators={validators}
									disabled={disabled}
									required={required}
								/>
								<div aria-live="assertive">
									{validator ? validator.message(id, label, value, validators) : null}
								</div>
							</div>
							{children !== undefined ? (
								<div className={'col-4 col-lg-3 col-md-5'}>{children ? children() : null}</div>
							) : null}
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

InputDropdownComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disabled: false,
	filter: false,
	filterBy: 'label',
	insideTable: false,
	placeholder: 'Wybierz',
	publicMode: false,
	rendered: true,
	showClear: false,
	showLabel: true,
	stateField: 'element',
	validateViewMode: false,
	validators: 'required',
	viewMode: 'VIEW',
};

InputDropdownComponent.propTypes = {
	appendTo: PropTypes.any,
	children: PropTypes.func,
	colClass: PropTypes.string,
	dataKey: PropTypes.string,
	disabled: PropTypes.bool,
	filter: PropTypes.bool,
	filterBy: PropTypes.string,
	id: PropTypes.string.isRequired,
	insideTable: PropTypes.bool,
	label: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	onAfterStateChange: PropTypes.func,
	onChange: PropTypes.func.isRequired,
	optionLabel: PropTypes.string,
	optionValue: PropTypes.string,
	options: PropTypes.array.isRequired,
	placeholder: PropTypes.string,
	publicMode: PropTypes.bool,
	rendered: PropTypes.bool,
	showClear: PropTypes.bool,
	showLabel: PropTypes.bool,
	stateField: PropTypes.string,
	validateViewMode: PropTypes.bool,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	value: PropTypes.object,
	valueView: PropTypes.string,
	viewMode: PropTypes.string,
};

export default InputDropdownComponent;
