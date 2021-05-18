/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Checkbox} from 'primereact/checkbox';

class InputMultiCheckboxComponent extends Component {
	
	renderView() {
		const { colClass, id, insideTable, label, publicMode, showLabel, value, valueLabel, validateViewMode, validator, validators } = this.props;
		return publicMode ? (
			<div className='input_easy_label row pl-0'>
				{label !== undefined && showLabel ? (
					<label id={`${id}-label-id`} className='easy_label col-lg-2 col-md-3' htmlFor={id}>
						{label}
					</label>
				) : null}
				<div className='col-md-5'>
					<div aria-label={label} aria-labelledby={`${id}-label-id`} className='row'>
						{value && value.length > 0
							? value.map((val) => {
									return (
										<div className='col-xl-12 col-lg-12 col-md-12 col-sm-12'>
											<label className=' p-checkbox-label p-label'>{val[valueLabel]}</label>
										</div>
									);
							  })
							: null}
					</div>
					{validateViewMode && validator ? validator.message(id, label, value, validators) : null}
				</div>
			</div>
		) : (
			<div className={insideTable ? '' : colClass}>
				<div className={insideTable ? '' : 'row'}>
					<div className={insideTable ? '' : 'col-md-12 form-group'}>
						{label !== undefined && showLabel ? (
							<label id={`${id}-label-id`} className='p-label' htmlFor={id} style={{ width: '100%' }}>
								{label}
							</label>
						) : null}
						<div aria-label={label} aria-labelledby={`${id}-label-id`} className='row'>
							{value && value.length > 0
								? value.map((val) => {
										return (
											<div className='col-xl-12 col-lg-12 col-md-12 col-sm-12'>
												<label className=' p-checkbox-label p-label'>{val[valueLabel]}</label>
											</div>
										);
								  })
								: null}
						</div>
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
			itemCheckboxColClass,
			itemColClass,
			label,
			labelOnRight,
			name,
			onAfterStateChange,
			onChange,
			options,
			publicMode,
			renderAfterCheckbox,
			showLabel,
			stateField,
			validator,
			validators,
			value,
			valueKey,
			valueLabel,
		} = this.props;
		return publicMode ? (
			<div className='input_easy_label row pl-0'>
				{label !== undefined && showLabel ? (
					<label id={`${id}-label-id`} className='easy_label col-lg-2 col-md-3' htmlFor={id}>
						{label}
					</label>
				) : null}
				<div id={id} aria-label={label} aria-labelledby={`${id}-label-id`} className='col-md-5'>
					{options && options.length > 0
						? options.map((val) => {
								return (
									<div className={itemColClass} key={`div-${val[valueKey]}`}>
										<div className='row'>
											<div className={itemCheckboxColClass}>
												<Checkbox
													ariaDescribedBy={`${id}-error}`}
													ariaLabel={`${label} ${val[valueLabel]}`}
													key={`${id}-${val[valueKey]}`}
													id={`${id}-${val[valueKey]}`}
													inputId={`${id}-input-${val[valueKey]}`}
													name={name}
													onChange={(e) => (onChange ? onChange('MULTI_CHECKBOX', [valueKey, val], e, onAfterStateChange, stateField) : null)}
													checked={value ? value.some((e) => e[valueKey] === val[valueKey]) : false}
													disabled={disabled}
												/>
												{labelOnRight ? (
													<span key={`label-${val[valueKey]}`} className='p-checkbox-label p-label'>
														{val[valueLabel]}
													</span>
												) : null}
												{!!renderAfterCheckbox && renderAfterCheckbox instanceof Function ? renderAfterCheckbox(val) : null}
											</div>
										</div>
									</div>
								);
						  })
						: null}
					<div aria-live='assertive'>{validator ? validator.message(id, label, value, validators) : null}</div>
				</div>
			</div>
		) : (
			<div className={insideTable ? '' : colClass}>
				<div className={insideTable ? '' : 'row'}>
					<div className={insideTable ? '' : 'col-md-12 form-group'}>
						{label !== undefined && showLabel ? (
							<label id={`${id}-label-id`} className='p-label' htmlFor={id} style={{ width: '100%' }}>
								{label}
							</label>
						) : null}
						<div id={id} aria-label={label} aria-labelledby={`${id}-label-id`} className='row'>
							{options && options.length > 0
								? options.map((val) => {
										return (
											<div className={itemColClass} key={`div-${val[valueKey]}`}>
												<div className='row'>
													<div className={itemCheckboxColClass}>
														<Checkbox
															ariaDescribedBy={`${id}-error}`}
															ariaLabel={`${label} ${val[valueLabel]}`}
															key={`${id}-${val[valueKey]}`}
															id={`${id}-${val[valueKey]}`}
															inputId={`${id}-input-${val[valueKey]}`}
															name={name}
															onChange={(e) => (onChange ? onChange('MULTI_CHECKBOX', [valueKey, val], e, onAfterStateChange, stateField) : null)}
															checked={value ? value.some((e) => e[valueKey] === val[valueKey]) : false}
															disabled={disabled}
														/>
														{labelOnRight ? (
															<span key={`label-${val[valueKey]}`} className='p-checkbox-label p-label'>
																{val[valueLabel]}
															</span>
														) : null}
														{!!renderAfterCheckbox && renderAfterCheckbox instanceof Function ? renderAfterCheckbox(val) : null}
													</div>
												</div>
											</div>
										);
								  })
								: null}
						</div>
						<div aria-live='assertive'>{validator ? validator.message(id, label, value, validators) : null}</div>
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

InputMultiCheckboxComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disabled: false,
	insideTable: false,
	itemCheckboxColClass: 'col-xl-12 col-lg-12 col-md-12 col-sm-12',
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

InputMultiCheckboxComponent.propTypes = {
	colClass: PropTypes.string,
	disabled: PropTypes.bool,
	id: PropTypes.string.isRequired,
	insideTable: PropTypes.bool,
	itemCheckboxColClass: PropTypes.string,
	itemColClass: PropTypes.string,
	label: PropTypes.string,
	labelOnRight: PropTypes.bool,
	name: PropTypes.string.isRequired,
	onAfterStateChange: PropTypes.func,
	onChange: PropTypes.func.isRequired,
	options: PropTypes.array.isRequired,
	publicMode: PropTypes.bool,
	renderAfterCheckbox: PropTypes.func,
	rendered: PropTypes.bool,
	showLabel: PropTypes.bool,
	stateField: PropTypes.string,
	validateViewMode: PropTypes.bool,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	value: PropTypes.array,
	valueKey: PropTypes.string.isRequired,
	valueLabel: PropTypes.string.isRequired,
	viewMode: PropTypes.string,
};

export default InputMultiCheckboxComponent;
