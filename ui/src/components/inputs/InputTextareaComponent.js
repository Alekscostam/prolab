import { InputTextarea } from 'primereact/inputtextarea';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

class InputTextareaComponent extends Component {
	constructor(props, context) {
		super(props, context);
		this.textareaRef = React.createRef();
		this.state = { rows: props.rows };
		this.refreshRowCount = this.refreshRowCount.bind(this);
	}

	componentDidMount() {
		this.refreshRowCount();
	}

	refreshRowCount() {
		const { rows } = this.props;
		if (
			this.textareaRef.current !== null &&
			this.textareaRef.current !== undefined &&
			this.textareaRef.current.props !== null &&
			this.textareaRef.current.props !== undefined &&
			this.textareaRef.current.props.value !== null &&
			this.textareaRef.current.props.value !== undefined
		) {
			const calculatedRows =
				Math.ceil(
					this.textareaRef.current.props.value.length / this.textareaRef.current.props.cols
				) + 1;
			this.setState({
				rows: rows > calculatedRows ? rows : calculatedRows,
			});
		}
	}
	renderView() {
		const {
			colClass,
			id,
			insideTable,
			label,
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
					<span
						aria-label={label}
						aria-labelledby={`${id}-label-id`}
						className={'p-inputtext-view'}
					>
						{value}
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
							className={'p-inputtext-view'}
						>
							{value}
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
			autoResize,
			children,
			colClass,
			disabled,
			id,
			insideTable,
			label,
			name,
			onAfterStateChange,
			onChange,
			placeholder,
			publicMode,
			publicModeChildren,
			showLabel,
			stateField,
			validator,
			validators,
			value,
		} = this.props;
		const { rows } = this.state;
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
				<div className={`col-md-5 ${publicModeChildren ? 'col-11' : ''}`}>
					<InputTextarea
						ariaDescribedBy={`${id}-error`}
						ariaLabel={label}
						ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
						ref={this.textareaRef}
						id={id}
						name={name}
						rows={rows}
						placeholder={placeholder}
						style={{ width: '100%', height: 'auto' }}
						onChange={e =>
							onChange ? onChange('TEXTAREA', undefined, e, onAfterStateChange, stateField) : null
						}
						value={value}
						autoResize={autoResize}
						disabled={disabled}
						required={required}
					/>
					<div aria-live="assertive">
						{validator ? validator.message(id, label, value, validators) : null}
					</div>
				</div>
				{publicModeChildren ? <div className="col-md-1 col-1">{children}</div> : null}
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
						<InputTextarea
							ariaDescribedBy={`${id}-error`}
							ariaLabel={label}
							ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
							ref={this.textareaRef}
							id={id}
							name={name}
							rows={rows}
							placeholder={placeholder}
							style={{ width: '100%', height: 'auto' }}
							onChange={e =>
								onChange ? onChange('TEXTAREA', undefined, e, onAfterStateChange, stateField) : null
							}
							value={value}
							autoResize={autoResize}
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

InputTextareaComponent.defaultProps = {
	autoResize: false,
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disabled: false,
	insideTable: false,
	objectId: '',
	placeholder: '',
	publicMode: false,
	rendered: true,
	required: false,
	rows: 4,
	showLabel: true,
	stateField: 'element',
	validateViewMode: false,
	validators: 'required',
	viewMode: 'VIEW',
};

InputTextareaComponent.propTypes = {
	autoResize: PropTypes.bool,
	children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
	colClass: PropTypes.string,
	disabled: PropTypes.bool,
	id: PropTypes.string.isRequired,
	insideTable: PropTypes.bool,
	label: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	onAfterStateChange: PropTypes.func,
	onChange: PropTypes.func.isRequired,
	placeholder: PropTypes.string,
	publicMode: PropTypes.bool,
	publicModeChildren: PropTypes.bool,
	rendered: PropTypes.bool,
	rows: PropTypes.number,
	showLabel: PropTypes.bool,
	stateField: PropTypes.string,
	validateViewMode: PropTypes.bool,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	value: PropTypes.string,
	viewMode: PropTypes.string,
};

export default InputTextareaComponent;
