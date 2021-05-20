/* eslint-disable max-len */
/* eslint-disable react/jsx-max-props-per-line */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ActionLink from '../ActionLink';
import {Dropdown} from 'primereact/dropdown';

class InputMultiDropdownComponent extends Component {

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
			addLabel,
			dataKey,
			disabled,
			filter,
			handleAdd,
			handleRemove,
			id,
			insideTable,
			label,
			name,
			onAfterStateChange,
			optionLabel,
			options,
			onChange,
			placeholder,
			publicMode,
			requiredField,
			showClear,
			showLabel,
			stateField,
			validator,
			validators,
			value,
		} = this.props;
		return publicMode ? (
			<div className="input_easy_label row pl-0">
				{label !== undefined && showLabel ? (
					<label id={`${id}-label-id`} className="easy_label col-lg-2 col-md-3" htmlFor={id}>
						{label}
					</label>
				) : null}
				<div id={id} aria-label={label} aria-labelledby={`${id}-label-id`} className="col-md-5">
					{value && value.map
						? value.map((val, i) => {
								let calculatedOptions = options;
								if (calculatedOptions !== null && calculatedOptions !== undefined) {
									calculatedOptions = calculatedOptions.filter(o => {
										let remove = false;
										value.forEach(v => {
											if (
												v !== null &&
												v[dataKey] === o[dataKey] &&
												(val === null || v[dataKey] !== val[dataKey])
											) {
												remove = true;
											}
										});
										return !remove;
									});
								}
								return (
									<div className="col-md-12 col-12">
										<div className="row">
											<div className="multi-dropdown">
												<Dropdown
													ariaLabel={label}
													ariaLabelledBy={
														label === undefined && showLabel ? `${id}-label-id` : undefined
													}
													key={`${id}-drop-${i}`}
													id={`${id}-drop-${i}`}
													name={name}
													style={{
														width: '100%',
													}}
													value={val}
													options={calculatedOptions}
													optionLabel={optionLabel}
													dataKey={dataKey}
													onChange={e =>
														onChange
															? // eslint-disable-next-line max-len
															  onChange('MULTI_DROPDOWN', [i], e, onAfterStateChange, stateField)
															: null
													}
													placeholder={placeholder}
													filter={filter}
													filterBy="label"
													showClear={showClear}
													validator={validator}
													validators={validators}
													disabled={disabled || val[requiredField]}
												/>
											</div>
											<div className="multi-dropdown-delete">
												<ActionLink
													key={`${id}-remove-button`}
													className="multi-dropdown-delete-actionlink"
													label=""
													handleClick={e => {
														e.preventDefault();
														handleRemove(i);
													}}
													rendered={!disabled}
													iconName="mdi-close-circle-outline"
													iconColor="grey"
													iconSize="m"
													iconSide="left"
												/>
											</div>
											<div aria-live="assertive">
												{validator ? validator.message(id, label, val, validators) : null}
											</div>
										</div>
									</div>
								);
						  })
						: null}
					<ActionLink
						key={`${id}-add-button`}
						className="multi-dropdown-add-actionlink"
						label={addLabel}
						variant="public"
						handleClick={e => {
							e.preventDefault();
							handleAdd();
						}}
						rendered={!disabled}
					/>
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
						{value && value.map
							? value.map((val, i) => {
									let calculatedOptions = options;
									if (calculatedOptions !== null && calculatedOptions !== undefined) {
										calculatedOptions = calculatedOptions.filter(o => {
											let remove = false;
											value.forEach(v => {
												if (
													v !== null &&
													v[dataKey] === o[dataKey] &&
													(val === null || v[dataKey] !== val[dataKey])
												) {
													remove = true;
												}
											});
											return !remove;
										});
									}
									return (
										<div className="col-md-12 col-12">
											<div className="row">
												<div className="multi-dropdown">
													<Dropdown
														ariaLabel={label}
														ariaLabelledBy={
															label === undefined && showLabel ? `${id}-label-id` : undefined
														}
														key={`${id}-drop-${i}`}
														id={id}
														name={name}
														style={{
															width: '100%',
														}}
														value={val}
														options={calculatedOptions}
														optionLabel={optionLabel}
														dataKey={dataKey}
														onChange={e =>
															onChange
																? // eslint-disable-next-line max-len
																  onChange('MULTI_DROPDOWN', [i], e, onAfterStateChange, stateField)
																: null
														}
														placeholder={placeholder}
														filter={filter}
														filterBy="label"
														showClear={showClear}
														validator={validator}
														validators={validators}
														disabled={disabled || val[requiredField]}
													/>
												</div>
												<div className="multi-dropdown-delete">
													<ActionLink
														key={`${id}-remove-button`}
														className="multi-dropdown-delete-actionlink"
														label=""
														handleClick={e => {
															e.preventDefault();
															handleRemove(i);
														}}
														rendered={!disabled}
														iconName="mdi-close-circle-outline"
														iconColor="grey"
														iconSize="m"
														iconSide="left"
													/>
												</div>
												<div aria-live="assertive">
													{validator ? validator.message(id, label, val, validators) : null}
												</div>
											</div>
										</div>
									);
							  })
							: null}
						<ActionLink
							key={`${id}-add-button`}
							className="multi-dropdown-add-actionlink"
							label={addLabel}
							handleClick={e => {
								e.preventDefault();
								handleAdd();
							}}
							rendered={!disabled}
						/>
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

InputMultiDropdownComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	dataKey: 'id',
	disabled: false,
	insideTable: false,
	placeholder: 'Wybierz',
	publicMode: false,
	rendered: true,
	required: false,
	showClear: false,
	showLabel: true,
	stateField: 'element',
	validateViewMode: false,
	validators: 'required',
	viewMode: 'VIEW',
};

InputMultiDropdownComponent.propTypes = {
	addLabel: PropTypes.string.isRequired,
	colClass: PropTypes.string,
	dataKey: PropTypes.string,
	disabled: PropTypes.bool,
	filter: PropTypes.bool,
	handleAdd: PropTypes.func.isRequired,
	handleRemove: PropTypes.func.isRequired,
	id: PropTypes.string.isRequired,
	insideTable: PropTypes.bool,
	label: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	onAfterStateChange: PropTypes.func,
	onChange: PropTypes.func.isRequired,
	optionLabel: PropTypes.string,
	options: PropTypes.array.isRequired,
	placeholder: PropTypes.string,
	publicMode: PropTypes.bool,
	rendered: PropTypes.bool,
	requiredField: PropTypes.string,
	showClear: PropTypes.bool,
	showLabel: PropTypes.bool,
	stateField: PropTypes.string,
	validateViewMode: PropTypes.bool,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	value: PropTypes.array,
	viewMode: PropTypes.string,
};

export default InputMultiDropdownComponent;
