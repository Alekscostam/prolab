import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Checkbox} from 'primereact/checkbox';

class InputCheckboxComponent extends Component {

	renderView() {
		const {
			colClass,
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
						className={`p-inputtext-view${titleElement ? ' title-element' : ''}`}
					>
						{value ? 'TAK' : 'NIE'}
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
					<div className={insideTable ? '' : 'col-md-12 form-group'}>
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
							className={`p-inputtext-view${titleElement ? ' title-element' : ''}`}
						>
							{value ? 'TAK' : 'NIE'}
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
			label,
			labelOnRight,
			name,
			onAfterStateChange,
			onChange,
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
					<label
						id={`${id}-label-id`}
						className="easy_label col-lg-2 col-md-3"
						htmlFor={`${id}-input`}
					>
						{label}
					</label>
				) : null}
				<div className="col-md-5">
					<Checkbox
						ariaLabel={label}
						ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
						key={id}
						id={id}
						inputId={`${id}-input`}
						name={name}
						onChange={e =>
							onChange ? onChange('CHECKBOX', undefined, e, onAfterStateChange, stateField) : null
						}
						checked={value}
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
						{label !== undefined && showLabel && !labelOnRight ? (
							<label
								id={`${id}-label-id`}
								className="p-label"
								htmlFor={`${id}-input`}
								style={{ width: '100%' }}
							>
								{label}
							</label>
						) : null}
						<Checkbox
							ariaLabel={label}
							ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
							key={id}
							id={id}
							inputId={`${id}-input`}
							name={name}
							onChange={e =>
								onChange ? onChange('CHECKBOX', undefined, e, onAfterStateChange, stateField) : null
							}
							checked={value}
							disabled={disabled}
							required={required}
						/>
						{label !== undefined && showLabel && labelOnRight ? (
							<label htmlFor={`${id}-input`} className="p-checkbox-label p-label">
								{label}
							</label>
						) : null}
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

InputCheckboxComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disabled: false,
	insideTable: false,
	labelOnRight: false,
	objectId: '',
	publicMode: false,
	rendered: true,
	showLabel: true,
	stateField: 'element',
	titleElement: false,
	titleElementClass: 'col-md-12',
	titleElementShowId: false,
	validateViewMode: false,
	validators: 'required|boolean',
	viewMode: 'VIEW',
};

InputCheckboxComponent.propTypes = {
	colClass: PropTypes.string,
	disabled: PropTypes.bool,
	id: PropTypes.string.isRequired,
	insideTable: PropTypes.bool,
	label: PropTypes.string,
	labelOnRight: PropTypes.bool,
	name: PropTypes.string.isRequired,
	objectId: PropTypes.string,
	onAfterStateChange: PropTypes.func,
	onChange: PropTypes.func.isRequired,
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
	value: PropTypes.bool,
	viewMode: PropTypes.string,
};

export default InputCheckboxComponent;
