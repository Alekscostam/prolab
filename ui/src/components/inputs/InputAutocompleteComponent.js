import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AutoComplete } from 'primereact/autocomplete';

class InputAutoCompleteComponent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			query: undefined,
		};
		// this.handleAutoCompleteChange = this.handleAutoCompleteChange.bind(this);
	}

	filterList(event) {
		const { filterList, forceSelection } = this.props;
		if (event.query.length > 0) {
			if (forceSelection) {
				this.setState({ query: event.query });
			}
			filterList(event.query.toLowerCase());
		} else {
			if (forceSelection) {
				this.setState({ query: undefined });
			}
			filterList(undefined, true);
		}
	}

	renderView() {
		const {
			colClass,
			id,
			insideTable,
			field,
			label,
			publicMode,
			multiple,
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
					{!multiple ? (
						<span
							aria-label={label}
							aria-labelledby={`${id}-label-id`}
							className={'p-inputtext-view'}
						>
							{value}
						</span>
					) : value && value.length > 0 ? (
						value.map((v, index) => {
							return (
								<span
									aria-label={label}
									aria-labelledby={`${id}-label-id`}
									className={'p-inputtext-view'}
								>
									{!field
										? `${v}${index !== value.length - 1 ? ', ' : ''}`
										: `${v[field]}${index !== value.length - 1 ? ', ' : ''}`}
								</span>
							);
						})
					) : (
						''
					)}

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
						{!multiple ? (
							<span
								aria-label={label}
								aria-labelledby={`${id}-label-id`}
								className={'p-inputtext-view'}
							>
								{value}
							</span>
						) : value && value.length > 0 ? (
							value.map((v, index) => {
								return (
									<span
										aria-label={label}
										aria-labelledby={`${id}-label-id`}
										className={'p-inputtext-view'}
									>
										{!field
											? `${v}${index !== value.length - 1 ? ', ' : ''}`
											: `${v[field]}${index !== value.length - 1 ? ', ' : ''}`}
									</span>
								);
							})
						) : (
							''
						)}
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
			dropdown,
			dropdownMode,
			field,
			filteredList,
			forceSelection,
			id,
			insideTable,
			itemTemplate,
			label,
			name,
			onAfterStateChange,
			onChange,
			multiple,
			optionValue,
			placeholder,
			publicMode,
			showLabel,
			size,
			stateField,
			validator,
			validators,
			value,
		} = this.props;
		const required =
			validators !== undefined &&
			validators.includes('required') &&
			!validators.includes('not_required');
		const { query } = this.state;
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
					<AutoComplete
						ariaDescribedBy={`${id}-error`}
						ariaLabel={label}
						ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
						key={id}
						id={id}
						inputId={`${id}-input`}
						name={name}
						placeholder={placeholder}
						onChange={e => {
							if (!forceSelection && onChange) {
								onChange(
									'AUTOCOMPLETE',
									[optionValue ? optionValue : name],
									e,
									onAfterStateChange,
									stateField
								);
							} else if (forceSelection && onChange && (e.value === undefined || e.value === '')) {
								onChange(
									'AUTOCOMPLETE',
									[optionValue ? optionValue : name],
									e,
									onAfterStateChange,
									stateField
								);
							}
						}}
						onSelect={e => {
							if (forceSelection && onChange) {
								this.setState({ query: undefined });
								onChange(
									'AUTOCOMPLETE_FORCE',
									[optionValue ? optionValue : name],
									e,
									onAfterStateChange,
									stateField
								);
							}
						}}
						onUnselect={e =>
							forceSelection && onChange
								? onChange(
										'AUTOCOMPLETE_FORCE',
										[optionValue ? optionValue : name],
										e,
										onAfterStateChange,
										stateField
								  )
								: null
						}
						value={forceSelection ? query || value : value}
						suggestions={filteredList}
						completeMethod={this.filterList.bind(this)}
						field={field}
						size={size}
						minLength={1}
						multiple={multiple}
						dropdown={dropdown}
						dropdownMode={dropdownMode}
						disabled={disabled}
						onBlur={this.handleBlur.bind(this)}
						required={required}
						className={colClass}
						itemTemplate={itemTemplate}
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
								htmlFor={`${id}-input`}
								style={{ width: '100%' }}
							>
								{label}
							</label>
						) : null}
						<AutoComplete
							ariaDescribedBy={`${id}-error`}
							ariaLabel={label}
							ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
							key={id}
							id={id}
							inputId={`${id}-input`}
							name={name}
							placeholder={placeholder}
							onChange={e => {
								if (!forceSelection && onChange) {
									onChange(
										'AUTOCOMPLETE',
										[optionValue ? optionValue : name],
										e,
										onAfterStateChange,
										stateField
									);
								} else if (
									forceSelection &&
									onChange &&
									(e.value === undefined || e.value === '')
								) {
									onChange(
										'AUTOCOMPLETE',
										[optionValue ? optionValue : name],
										e,
										onAfterStateChange,
										stateField
									);
								}
							}}
							onSelect={e => {
								if (forceSelection && onChange) {
									this.setState({ query: undefined });
									onChange(
										'AUTOCOMPLETE_FORCE',
										[optionValue ? optionValue : name],
										e,
										onAfterStateChange,
										stateField
									);
								}
							}}
							onUnselect={e =>
								forceSelection && onChange
									? onChange(
											'AUTOCOMPLETE_FORCE',
											[optionValue ? optionValue : name],
											e,
											onAfterStateChange,
											stateField
									  )
									: null
							}
							value={forceSelection ? query || value : value}
							suggestions={filteredList}
							completeMethod={this.filterList.bind(this)}
							field={field}
							size={size}
							minLength={1}
							multiple={multiple}
							dropdown={dropdown}
							dropdownMode={dropdownMode}
							disabled={disabled}
							onBlur={this.handleBlur.bind(this)}
							required={required}
							className={colClass}
							itemTemplate={itemTemplate}
							/>
						<div aria-live="assertive">
							{validator ? validator.message(id, label, value, validators) : null}
						</div>
					</div>
				</div>
			</div>
		);
	}

	handleBlur(e) {
		const { onBlur } = this.props;
		this.setState({ query: undefined });
		if (onBlur) {
			onBlur(e);
		}
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

InputAutoCompleteComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disabled: false,
	dropdown: false,
	dropdownMode: 'blank',
	field: 'name',
	forceSelection: false,
	insideTable: false,
	multiple: false,
	placeholder: '',
	publicMode: false,
	rendered: true,
	showLabel: true,
	size: 10,
	stateField: 'element',
	validateViewMode: false,
	validators: 'required',
	viewMode: 'VIEW',
};

InputAutoCompleteComponent.propTypes = {
	colClass: PropTypes.string,
	disabled: PropTypes.bool,
	dropdown: PropTypes.bool,
	dropdownMode: PropTypes.string,
	field: PropTypes.string,
	filterList: PropTypes.func.isRequired,
	filteredList: PropTypes.array.isRequired,
	forceSelection: PropTypes.bool,
	id: PropTypes.string.isRequired,
	insideTable: PropTypes.bool,
	label: PropTypes.string.isRequired,
	multiple: PropTypes.bool,
	name: PropTypes.string.isRequired,
	onAfterStateChange: PropTypes.func,
	onBlur: PropTypes.func,
	onChange: PropTypes.func.isRequired,
	optionValue: PropTypes.string,
	placeholder: PropTypes.string,
	publicMode: PropTypes.bool,
	rendered: PropTypes.bool,
	showLabel: PropTypes.bool,
	size: PropTypes.number,
	stateField: PropTypes.string,
	validateViewMode: PropTypes.bool,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	value: PropTypes.string,
	viewMode: PropTypes.string,
	itemTemplate:PropTypes.func
};

export default InputAutoCompleteComponent;
