import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Calendar } from 'primereact/calendar';

class InputCalendarRangeComponent extends Component {
	handleChange(event) {
		const { onChange, nameTo, to } = this.props;
		const fromEvent = {
			target: {
				name: event.target.name,
				value: event.target.value,
			},
		};
		if (!to.after(event.target.value)) {
			const toDate = new Date();
			toDate.setDate(new Date(event.target.value).getDate() + 1);
			const toEvent = {
				target: {
					name: nameTo,
					value: toDate,
				},
			};
			onChange(toEvent);
		}
		onChange(fromEvent);
	}

	renderView() {
		const {
			colClass,
			dateFormatMoment,
			from,
			idFrom,
			idTo,
			insideTable,
			label,
			labelFrom,
			labelTo,
			publicMode,
			showLabel,
			to,
			validateViewMode,
			validator,
			validators,
			validatorsTo,
			validatorsToType,
			timeOnly
		} = this.props;
		const range = `${from ? moment(from).format(dateFormatMoment) : ''} - ${to ? moment(to).format(dateFormatMoment) : ''
			}`;
		let validatorsToCalculated = validatorsTo ? validatorsTo : validators;
		let fromDate = undefined;
		if (from && moment.isDate(from) && moment(from).isValid()) {
			fromDate = new Date(from);
			if (!timeOnly) {
				validatorsToCalculated = `${validatorsToCalculated}|${validatorsToType}:${moment(
					fromDate
				).format(dateFormatMoment)},${dateFormatMoment}`;
			} else {
				validatorsToCalculated = `${validatorsToCalculated}|after_or_equal_time~${moment(from).format('HH:mm:ss').toString()}`;
			}
		}
		return publicMode ? (
			<div className="input_easy_label row pl-0">
				{label !== undefined && showLabel ? (
					<label
						id={`${idFrom}-label-id`}
						className="easy_label col-lg-2 col-md-3"
						htmlFor={idFrom}
					>
						{label}
					</label>
				) : null}
				<div className="col-md-5">
					<span
						aria-label={label}
						aria-labelledby={`${idFrom}-label-id`}
						className="p-inputtext-view"
					>
						{range}
					</span>
					{validateViewMode && validator
						? validator.message(idFrom, labelFrom, from, validators)
						: null}
					{validateViewMode && validator
						? validator.message(idTo, labelTo, to, validatorsToCalculated)
						: null}
				</div>
			</div>
		) : (
			<div className={insideTable ? '' : colClass}>
				<div className={insideTable ? '' : 'row'}>
					<div className={insideTable ? '' : 'col-md-12 form-group'}>
						{label !== undefined && showLabel ? (
							<label
								id={`${idFrom}-label-id`}
								className="p-label"
								htmlFor={idFrom}
								style={{ width: '100%' }}
							>
								{label}
							</label>
						) : null}
						<span
							aria-label={label}
							aria-labelledby={`${idFrom}-label-id`}
							className="p-inputtext-view"
						>
							{range}
						</span>
						{validateViewMode && validator
							? validator.message(idFrom, labelFrom, from, validators)
							: null}
						{validateViewMode && validator
							? validator.message(idTo, labelTo, to, validatorsToCalculated)
							: null}
					</div>
				</div>
			</div>
		);
	}

	renderEdit(pl) {
		return this.renderNew(pl);
	}

	renderNew(pl) {
		const {
			appendTo,
			colClass,
			dateFormat,
			dateFormatMoment,
			disabled,
			from,
			idFrom,
			idTo,
			insideTable,
			label,
			labelFrom,
			labelTo,
			nameFrom,
			nameTo,
			onAfterStateChange,
			onChange,
			placeholderFrom,
			placeholderTo,
			publicMode,
			readOnlyInput,
			showIcon,
			showLabel,
			stateField,
			to,
			validator,
			validators,
			validatorsTo,
			validatorsToType,
			monthNavigator,
			yearNavigator,
			yearRange,
			showTime,
			timeOnly,
			validateOnChange
		} = this.props;
		let validatorsToCalculated = validatorsTo ? validatorsTo : validators;
		let fromDate = undefined;
		if (from && moment.isDate(from) && moment(from).isValid()) {
			fromDate = new Date(from);
			if (!timeOnly) {
				validatorsToCalculated = `${validatorsToCalculated}|${validatorsToType}:${moment(
					fromDate
				).format(dateFormatMoment)},${dateFormatMoment}`;
			} else {
				validatorsToCalculated = `${validatorsToCalculated}|after_or_equal_time~${moment(from).format('HH:mm:ss').toString()}`;
			}
		}
		const requiredFrom =
			validators !== undefined &&
			validators.includes('required') &&
			!validators.includes('not_required');
		const requiredTo =
			validatorsTo !== undefined &&
			validatorsTo.includes('required') &&
			!validatorsTo.includes('not_required');
		const info = '. Aby przejść do edycji kolejnego pola kliknij Esc następnie Tab';
		return publicMode ? (
			<div className="input_easy_label row pl-0">
				{label !== undefined && showLabel ? (
					<span
						id={`${idFrom}-label-id`}
						className="easy_label col-lg-2 col-md-3"
						htmlFor={`${idFrom}-input`}
					>
						{label}
					</span>
				) : null}
				<div className="col-md-5">
					<Calendar
						appendTo={appendTo}
						ariaDescribedBy={`${idFrom}-error`}
						ariaLabel={`${label} ${labelFrom} - data w formacie ${placeholderFrom}${info}`}
						key={idFrom}
						id={idFrom}
						inputId={`${idFrom}-input`}
						name={nameFrom}
						style={{ width: '100%' }}
						value={from}
						onChange={e => onChange('CALENDAR_FROM', undefined, e, onAfterStateChange, stateField)}
						readOnlyInput={readOnlyInput}
						locale={'pl'}
						dateFormat={dateFormat}
						placeholder={placeholderFrom}
						showIcon={showIcon}
						disabled={disabled}
						monthNavigator={monthNavigator}
						yearNavigator={yearNavigator}
						yearRange={yearRange}
						required={requiredFrom}
						showTime={showTime}
						timeOnly={timeOnly}
					/>
					<div aria-live="assertive">
						{validator ? validator.message(idFrom, labelFrom, from, validators) : null}
					</div>
				</div>
				<div className="col-md-3" />
				<label className="easy_label col-lg-2 col-md-3" />
				<div className="col-md-5">
					<Calendar
						appendTo={appendTo}
						ariaDescribedBy={`${idTo}-error`}
						ariaLabel={`${label} ${labelTo} - data w formacie ${placeholderTo}${info}`}
						key={idTo}
						id={idTo}
						inputId={`${idTo}-input`}
						name={nameTo}
						style={{ width: '100%' }}
						value={to}
						// eslint-disable-next-line max-len
						onChange={e =>
							onChange ? onChange('CALENDAR', undefined, e, onAfterStateChange, stateField) : null
						}
						readOnlyInput={readOnlyInput}
						locale={'pl'}
						minDate={validateOnChange ? fromDate : undefined}
						dateFormat={dateFormat}
						placeholder={placeholderTo}
						showIcon={showIcon}
						disabled={disabled}
						monthNavigator={monthNavigator}
						yearNavigator={yearNavigator}
						yearRange={yearRange}
						required={requiredTo}
						showTime={showTime}
						timeOnly={timeOnly}
					/>
					<div aria-live="assertive">
						{validator ? validator.message(idTo, labelTo, to, validatorsToCalculated) : null}
					</div>
				</div>
			</div>
		) : (
			<div className={insideTable ? '' : colClass}>
				<div className={insideTable ? '' : 'row'}>
					<div className={insideTable ? '' : 'col-md-12 form-group'}>
						<div className="row">
							<div className="col-padding">
								{label !== undefined && showLabel ? (
									<span id={`${idFrom}-label-id`} className="p-label" style={{ width: '100%' }}>
										{label}
									</span>
								) : null}
							</div>
							<div className="col-md-6">
								<Calendar
									appendTo={appendTo}
									ariaDescribedBy={`${idFrom}-error`}
									ariaLabel={`${label} ${labelFrom} - data w formacie ${placeholderFrom}${info}`}
									key={idFrom}
									id={idFrom}
									inputId={`${idFrom}-input`}
									name={nameFrom}
									style={{ width: '100%' }}
									value={from}
									onChange={e =>
										onChange('CALENDAR_FROM', undefined, e, onAfterStateChange, stateField)
									}
									readOnlyInput={readOnlyInput}
									locale={'pl'}
									dateFormat={dateFormat}
									placeholder={placeholderFrom}
									showIcon={showIcon}
									disabled={disabled}
									monthNavigator={monthNavigator}
									yearNavigator={yearNavigator}
									yearRange={yearRange}
									required={requiredFrom}
									showTime={showTime}
									timeOnly={timeOnly}
								/>
								<div aria-live="assertive">
									{validator ? validator.message(idFrom, labelFrom, from, validators) : null}
								</div>
							</div>
							<div className="col-md-6">
								<Calendar
									appendTo={appendTo}
									ariaDescribedBy={`${idTo}-error`}
									ariaLabel={`${label} ${labelTo} - data w formacie ${placeholderTo}${info}`}
									key={idTo}
									id={idTo}
									inputId={`${idTo}-input`}
									name={nameTo}
									style={{ width: '100%' }}
									value={to}
									// eslint-disable-next-line max-len
									onChange={e =>
										onChange
											? onChange('CALENDAR', undefined, e, onAfterStateChange, stateField)
											: null
									}
									readOnlyInput={readOnlyInput}
									locale={'pl'}
									minDate={validateOnChange ? fromDate : undefined}
									dateFormat={dateFormat}
									placeholder={placeholderTo}
									showIcon={showIcon}
									disabled={disabled}
									monthNavigator={monthNavigator}
									yearNavigator={yearNavigator}
									yearRange={yearRange}
									required={requiredTo}
									showTime={showTime}
									timeOnly={timeOnly}
								/>
								<div aria-live="assertive">
									{validator ? validator.message(idTo, labelTo, to, validatorsToCalculated) : null}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	render() {
		const { rendered, viewMode } = this.props;
		const pl = {
			today: 'Dzisiaj',
			clear: 'Wyczyść',
			monthNames: [
				'Styczeń',
				'Luty',
				'Marzec',
				'Kwiecień',
				'Maj',
				'Czerwiec',
				'Lipiec',
				'Sierpień',
				'Wrzesień',
				'Październik',
				'Listopad',
				'Grudzień',
			],
			monthNamesShort: [
				'Sty',
				'Lut',
				'Mar',
				'Kwi',
				'Maj',
				'Cze',
				'Lip',
				'Sie',
				'Wrz',
				'Paź',
				'Lis',
				'Gru',
			],
			dayNames: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
			dayNamesShort: ['Nie', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'So'],
			dayNamesMin: ['N', 'P', 'W', 'Ś', 'Cz', 'Pt', 'S'],
			firstDayOfWeek: 1,
		};
		if (rendered) {
			switch (viewMode) {
				case 'NEW':
					return this.renderNew(pl);
				case 'EDIT':
					return this.renderEdit(pl);
				case 'VIEW':
				default:
					return this.renderView();
			}
		} else {
			return null;
		}
	}
}

InputCalendarRangeComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	dateFormat: 'dd-mm-yy',
	dateFormatMoment: 'DD-MM-YYYY',
	disabled: false,
	insideTable: false,
	labelFrom: 'Od',
	labelTo: 'Do',
	placeholderFrom: 'dd-mm-rrrr',
	placeholderTo: 'dd-mm-rrrr',
	publicMode: false,
	rendered: true,
	readOnlyInput: false,
	showIcon: false,
	showLabel: true,
	stateField: 'element',
	validateViewMode: false,
	validators: 'required|date|date_format:DD-MM-YYYY,dd-mm-rrrr',
	validatorsToType: 'after_or_equal',
	viewMode: 'VIEW',
	monthNavigator: true,
	yearNavigator: true,
	yearRange: '1900:2030',
	showTime: false,
	timeOnly: false,
	validateOnChange: true
};

InputCalendarRangeComponent.propTypes = {
	appendTo: PropTypes.any,
	children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
	colClass: PropTypes.string,
	dateFormat: PropTypes.string,
	dateFormatMoment: PropTypes.string,
	disabled: PropTypes.bool,
	from: PropTypes.instanceOf(Date),
	idFrom: PropTypes.string.isRequired,
	idTo: PropTypes.string.isRequired,
	insideTable: PropTypes.bool,
	label: PropTypes.string.isRequired,
	labelFrom: PropTypes.string.isRequired,
	labelTo: PropTypes.string.isRequired,
	monthNavigator: PropTypes.bool,
	nameFrom: PropTypes.string.isRequired,
	nameTo: PropTypes.string.isRequired,
	onAfterStateChange: PropTypes.func,
	onChange: PropTypes.func.isRequired,
	placeholderFrom: PropTypes.string,
	placeholderTo: PropTypes.string,
	publicMode: PropTypes.bool,
	publicModeChildren: PropTypes.bool,
	readOnlyInput: PropTypes.bool,
	rendered: PropTypes.bool,
	showIcon: PropTypes.bool,
	showLabel: PropTypes.bool,
	stateField: PropTypes.string,
	to: PropTypes.instanceOf(Date),
	validateViewMode: PropTypes.bool,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	validatorsTo: PropTypes.string,
	validatorsToType: PropTypes.string,
	viewMode: PropTypes.string,
	yearNavigator: PropTypes.bool,
	yearRange: PropTypes.string,
	showTime: PropTypes.bool,
	timeOnly: PropTypes.bool,
	validateOnChange: PropTypes.bool,
};

export default InputCalendarRangeComponent;
