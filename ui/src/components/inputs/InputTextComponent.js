import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {InputText} from 'primereact/inputtext';

class InputTextComponent extends Component {
	renderView() {
		const {
			colClass,
			formGroup,
			iconColor,
			iconName,
			iconSide,
			iconSize,
			id,
			insideTable,
			label,
			objectId,
			publicMode,
			showLabel,
			titleElement,
			titleElementClass,
			titleElementShowId,
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
					<span
						aria-label={label}
						aria-labelledby={`${id}-label-id`}
						className={`p-inputtext-view icon_text ${titleElement ? ' title-element' : ''} ${
							iconName !== undefined ? iconColor : ''
						}`}
					>
						{iconSide === 'left' && iconName !== undefined ? (
							<i className={`icon mdi ${iconName} ${iconSize}`} />
						) : null}
						{value}
						{iconSide === 'right' && iconName !== undefined ? (
							<i className={`icon mdi ${iconName} ${iconSize}`} />
						) : null}
					</span>
					{titleElement && titleElementShowId ? (
						<span className="p-inputtext-view">{` ID: ${objectId}`}</span>
					) : null}
					{validateViewMode && validator ? validator.message(id, label, value, validators) : null}
				</div>
			</div>
		) : (
			<div className={insideTable ? '' : titleElement ? titleElementClass : colClass}>
				<div className={insideTable ? '' : 'row'}>
					<div className={insideTable ? '' : `col-md-12 ${formGroup ? 'form-group' : ''}`}>
						{label !== undefined && showLabel && !titleElement ? (
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
							className={`p-inputtext-view icon_text ${titleElement ? ' title-element' : ''} ${
								iconName !== undefined ? iconColor : ''
							}`}
						>
							{iconSide === 'left' && iconName !== undefined ? (
								<i className={`icon mdi ${iconName} ${iconSize}`} />
							) : null}
							{value}
							{iconSide === 'right' && iconName !== undefined ? (
								<i className={`icon mdi ${iconName} ${iconSize}`} />
							) : null}
						</span>
						{titleElement && titleElementShowId ? (
							<span className="p-inputtext-view">{` ID: ${objectId}`}</span>
						) : null}
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
			keyfilter,
			label,
			max,
			name,
			onAfterStateChange,
			onChange,
			placeholder,
			publicMode,
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
					<label id={`${id}-label-id`} className="easy_label col-lg-2 col-md-3" htmlFor={id}>
						{label}
					</label>
				) : null}
				<div className="col-md-5">
					<InputText
						ariaDescribedBy={`${id}-error`}
						ariaLabel={label}
						ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
						key={id}
						id={id}
						name={name}
						max={max}
						style={{ width: '100%' }}
						type="text"
						keyfilter={keyfilter}
						placeholder={placeholder}
						value={value}
						onChange={e =>
							onChange ? onChange('TEXT', undefined, e, onAfterStateChange, stateField) : null
						}
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
						<InputText
							ariaDescribedBy={`${id}-error`}
							ariaLabel={label}
							ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
							key={id}
							id={id}
							name={name}
							max={max}
							type="text"
							keyfilter={keyfilter}
							placeholder={placeholder}
							style={{ width: '100%' }}
							value={value}
							onChange={e =>
								onChange ? onChange('TEXT', undefined, e, onAfterStateChange, stateField) : null
							}
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

InputTextComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disabled: false,
	formGroup: true,
	iconSide: 'left',
	insideTable: false,
	max: 255,
	objectId: '',
	placeholder: '',
	publicMode: false,
	rendered: true,
	showLabel: true,
	stateField: 'element',
	titleElement: false,
	titleElementShowId: false,
	titleElementClass: 'col-md-12',
	validateViewMode: false,
	validators: 'required',
	viewMode: 'VIEW',
};

InputTextComponent.propTypes = {
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
	max: PropTypes.number,
	name: PropTypes.string.isRequired,
	objectId: PropTypes.string,
	onAfterStateChange: PropTypes.func,
	onChange: PropTypes.func,
	placeholder: PropTypes.string,
	publicMode: PropTypes.bool,
	rendered: PropTypes.bool,
	showLabel: PropTypes.bool,
	stateField: PropTypes.string,
	titleElement: PropTypes.bool,
	titleElementClass: PropTypes.string,
	titleElementShowId: PropTypes.bool,
	validateViewMode: PropTypes.bool,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	value: PropTypes.string,
	viewMode: PropTypes.string,
};

export default InputTextComponent;
