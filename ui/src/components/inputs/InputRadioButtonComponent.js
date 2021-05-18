/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import equal from 'react-fast-compare';
import { RadioButton } from 'primereact/radiobutton';

class InputRadioButtonComponent extends Component {

	renderView() {
		const {
			colClass,
			id,
			insideTable,
			label,
			publicMode,
			showLabel,
			value,
			valueLabel,
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
						{value ? (valueLabel ? value[valueLabel] : value) : null}
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
							{value ? (valueLabel ? value[valueLabel] : value) : null}
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
			disabled,
			id,
			insideTable,
			itemColClass,
			label,
			labelOnRight,
			name,
			onAfterStateChange,
			onChange,
			options,
			publicMode,
			showLabel,
			stateField,
			validator,
			validators,
			value,
			valueKey,
			valueLabel,
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
				<div aria-label={label} aria-labelledby={`${id}-label-id`} className="col-md-5">
					{options && options.length > 0
						? options.map(val => {
								return (
									<div
										className={itemColClass}
										key={`div-${valueKey ? val[valueKey] : valueLabel ? val[valueLabel] : val}`}
									>
										<RadioButton
											ariaLabel={`${label} ${valueLabel ? val[valueLabel] : val}`}
											key={`${id}-${valueKey ? val[valueKey] : valueLabel ? val[valueLabel] : val}`}
											id={`${id}-${valueKey ? val[valueKey] : valueLabel ? val[valueLabel] : val}`}
											inputId={`${id}-input-${
												valueKey ? val[valueKey] : valueLabel ? val[valueLabel] : val
											}`}
											name={name}
											onChange={e =>
												onChange
													? onChange('RADIOBUTTON', [valueKey], e, onAfterStateChange, stateField)
													: null
											}
											value={val}
											checked={
												value
													? valueKey
														? value[valueKey] === val[valueKey]
														: equal(value, val)
													: false
											}
											disabled={disabled}
											required={required}
										/>
										{labelOnRight ? (
											<label
												key={`label-${
													valueKey ? val[valueKey] : valueLabel ? val[valueLabel] : val
												}`}
												htmlFor={`${id}-input-${
													valueKey ? val[valueKey] : valueLabel ? val[valueLabel] : val
												}`}
												className="p-checkbox-label p-label"
											>
												{valueLabel ? val[valueLabel] : val}
											</label>
										) : null}
									</div>
								);
						  })
						: null}
					<div aria-live="assertive">
						{validator ? validator.message(id, label, value, validators) : null}
					</div>
				</div>
			</div>
		) : (
			<div className={insideTable ? '' : colClass} id={id}>
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
						<div aria-label={label} aria-labelledby={`${id}-label-id`} className="row">
							{options && options.length > 0
								? options.map(val => {
										return (
											<div
												className={itemColClass}
												key={`div-${valueKey ? val[valueKey] : valueLabel ? val[valueLabel] : val}`}
											>
												<RadioButton
													ariaDescribedBy={`${id}-error`}
													ariaLabel={`${label} ${valueLabel ? val[valueLabel] : val}`}
													key={`${id}-${
														valueKey ? val[valueKey] : valueLabel ? val[valueLabel] : val
													}`}
													id={`${id}-${
														valueKey ? val[valueKey] : valueLabel ? val[valueLabel] : val
													}`}
													inputId={`${id}-input-${
														valueKey ? val[valueKey] : valueLabel ? val[valueLabel] : val
													}`}
													name={name}
													onChange={e =>
														onChange
															? onChange(
																	'RADIOBUTTON',
																	[valueKey],
																	e,
																	onAfterStateChange,
																	stateField
															  )
															: null
													}
													value={val}
													checked={
														value
															? valueKey
																? value[valueKey] === val[valueKey]
																: equal(value, val)
															: false
													}
													disabled={disabled}
													required={required}
												/>
												{labelOnRight ? (
													<label
														key={`label-${
															valueKey ? val[valueKey] : valueLabel ? val[valueLabel] : val
														}`}
														htmlFor={`${id}-input-${
															valueKey ? val[valueKey] : valueLabel ? val[valueLabel] : val
														}`}
														className="p-checkbox-label p-label"
													>
														{valueLabel ? val[valueLabel] : val}
													</label>
												) : null}
											</div>
										);
								  })
								: null}
						</div>
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

InputRadioButtonComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disabled: false,
	insideTable: false,
	itemColClass: 'col-xl-12 col-lg-12 col-md-12 col-sm-12',
	labelOnRight: false,
	publicMode: false,
	rendered: true,
	showLabel: true,
	stateField: 'element',
	validateViewMode: false,
	validators: 'array_required',
	viewMode: 'VIEW',
};

InputRadioButtonComponent.propTypes = {
	colClass: PropTypes.string,
	disabled: PropTypes.bool,
	id: PropTypes.string.isRequired,
	insideTable: PropTypes.bool,
	itemColClass: PropTypes.string,
	label: PropTypes.string,
	labelOnRight: PropTypes.bool,
	name: PropTypes.string.isRequired,
	onAfterStateChange: PropTypes.func,
	onChange: PropTypes.func.isRequired,
	options: PropTypes.array.isRequired,
	publicMode: PropTypes.bool,
	rendered: PropTypes.bool,
	showLabel: PropTypes.bool,
	stateField: PropTypes.string,
	validateViewMode: PropTypes.bool,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	value: PropTypes.any,
	valueKey: PropTypes.string.isRequired,
	valueLabel: PropTypes.string.isRequired,
	viewMode: PropTypes.string,
};

export default InputRadioButtonComponent;
