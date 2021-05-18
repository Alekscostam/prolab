import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Password } from 'primereact/password';

class InputPasswordComponent extends Component {
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
						className={`p-inputtext-view icon_text ${titleElement ? ' title-element' : ''} ${iconName !== undefined ? iconColor : ''
							}`}
					>
						{iconSide === 'left' && iconName !== undefined ? (
							<i className={`icon mdi ${iconName} ${iconSize}`} />
						) : null}
						{'********'}
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
							className={`p-inputtext-view icon_text ${titleElement ? ' title-element' : ''} ${iconName !== undefined ? iconColor : ''
								}`}
						>
							{iconSide === 'left' && iconName !== undefined ? (
								<i className={`icon mdi ${iconName} ${iconSize}`} />
							) : null}
							{'********'}
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
			feedback,
			id,
			insideTable,
			label,
			labelForValidator,
			mediumLabel,
			name,
			onAfterStateChange,
			onChange,
			placeholder,
			publicMode,
			promptLabel,
			showLabel,
			stateField,
			strongLabel,
			validator,
			validators,
			value,
			weakLabel,
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
					<Password
						ariaDescribedBy={`${id}-error`}
						ariaLabel={label}
						ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
						key={id}
						id={id}
						name={name}
						placeholder={placeholder}
						style={{ width: '100%' }}
						value={value}
						onChange={e =>
							onChange ? onChange('TEXT', undefined, e, onAfterStateChange, stateField) : null
						}
						disabled={disabled}
						promptLabel={promptLabel}
						weakLabel={weakLabel}
						mediumLabel={mediumLabel}
						strongLabel={strongLabel}
						feedback={feedback}
						required={required}
					/>
					{validator
						? validator.message(
							id,
							labelForValidator ? labelForValidator : label,
							value,
							validators
						)
						: null}
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
						<Password
							ariaDescribedBy={`${id}-error`}
							ariaLabel={label}
							ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
							key={id}
							id={id}
							name={name}
							placeholder={placeholder}
							style={{ width: '100%' }}
							value={value}
							onChange={e =>
								onChange ? onChange('TEXT', undefined, e, onAfterStateChange, stateField) : null
							}
							disabled={disabled}
							promptLabel={promptLabel}
							weakLabel={weakLabel}
							mediumLabel={mediumLabel}
							strongLabel={strongLabel}
							feedback={feedback}
							required={required}
						/>
						{validator
							? validator.message(
								id,
								labelForValidator ? labelForValidator : label,
								value,
								validators
							)
							: null}
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

InputPasswordComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disabled: false,
	feedback: true,
	insideTable: false,
	mediumLabel: 'Średnie',
	placeholder: '',
	promptLabel: 'Wprowadź hasło',
	publicMode: false,
	rendered: true,
	showLabel: true,
	showPasswordVisible: false,
	stateField: 'element',
	strongLabel: 'Mocne',
	validators: 'required',
	viewMode: 'VIEW',
	weakLabel: 'Słabe',
};

InputPasswordComponent.propTypes = {
	colClass: PropTypes.string,
	disabled: PropTypes.bool,
	feedback: PropTypes.bool,
	id: PropTypes.string.isRequired,
	insideTable: PropTypes.bool,
	label: PropTypes.string.isRequired,
	labelForValidator: PropTypes.string,
	mediumLabel: PropTypes.string,
	name: PropTypes.string.isRequired,
	onAfterStateChange: PropTypes.func,
	onChange: PropTypes.func.isRequired,
	placeholder: PropTypes.string,
	promptLabel: PropTypes.string,
	publicMode: PropTypes.bool,
	rendered: PropTypes.bool,
	showLabel: PropTypes.bool,
	showPasswordVisible: PropTypes.bool,
	stateField: PropTypes.string,
	strongLabel: PropTypes.string,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	value: PropTypes.string,
	viewMode: PropTypes.string,
	weakLabel: PropTypes.string,
};

export default InputPasswordComponent;
