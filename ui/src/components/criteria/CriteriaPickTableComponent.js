import PropTypes from 'prop-types';
import React from 'react';

class CriteriaPickTableComponent extends React.Component {
	componentDidMount() { }

	render() {
		const {
			appendTo,
			colClass,
			dateFormat,
			dateFormatMoment,
			disabled,
			from,
			idFrom,
			idTo,
			label,
			labelFrom,
			labelTo,
			nameFrom,
			nameTo,
			onChange,
			placeholderFrom,
			placeholderTo,
			readOnlyInput,
			showIcon,
			to,
			validator,
			validators,
			validatorsFromExt,
			monthNavigator,
			yearNavigator,
			yearRange,
			timeOnly,
			showTime,
			validateOnChange
		} = this.props;
		let validatorsTo = validators;
		let validatorsFrom = validatorsFromExt ? validatorsFromExt : validators;
		let fromDate = undefined;
		let toDate = undefined;
		addLocale('pl', {
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
		});
		if (from && moment.isDate(from) && moment(from).isValid()) {
			fromDate = new Date(from);
			if (!timeOnly) {
				validatorsTo = `${validatorsTo}|after_or_equal:${moment(fromDate).format(
					dateFormatMoment
				)},${dateFormatMoment}`;
			} else {
				validatorsTo = `${validatorsTo}|after_or_equal_time~${moment(fromDate).format('HH:mm:ss').toString()}`;
			}
		}
		if (to && moment.isDate(to) && moment(to).isValid()) {
			toDate = new Date(to);
			if (!timeOnly) {
				validatorsFrom = `${validatorsFrom}|before_or_equal:${moment(toDate).format(
					dateFormatMoment
				)},${dateFormatMoment}`;
			} else {
				validatorsFrom = `${validatorsFrom}|before_or_equal_time~${moment(toDate).format('HH:mm:ss').toString()}`;
			}
		}
		const requiredFrom =
			validatorsFrom !== undefined &&
			validatorsFrom.includes('required') &&
			!validatorsFrom.includes('not_required');
		const requiredTo =
			validatorsTo !== undefined &&
			validatorsTo.includes('required') &&
			!validatorsTo.includes('not_required');
		const info = '. Aby przejść do edycji kolejnego pola kliknij Esc następnie Tab';
		return (
			<div className={colClass}>
				<div className="row">
					<div className="col-md-12 form-group">
						<div className="row">
							<div className="col-padding">
								{label !== undefined ? (
									<span className="p-label" style={{ width: '100%' }}>
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
									onChange={onChange}
									readOnlyInput={readOnlyInput}
									locale='pl'
									dateFormat={dateFormat}
									placeholder={placeholderFrom}
									showIcon={showIcon}
									disabled={disabled}
									monthNavigator={monthNavigator}
									yearNavigator={yearNavigator}
									yearRange={yearRange}
									maxDate={!timeOnly ? new Date() : undefined}
									required={requiredFrom}
									timeOnly={timeOnly}
									showTime={showTime}
								/>
								<div aria-live="assertive">
									{validator ? validator.message(idFrom, labelFrom, from, validatorsFrom) : null}
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
									onChange={onChange}
									readOnlyInput={readOnlyInput}
									minDate={validateOnChange ? fromDate : undefined}
									locale='pl'
									dateFormat={dateFormat}
									placeholder={placeholderTo}
									showIcon={showIcon}
									disabled={disabled}
									monthNavigator={monthNavigator}
									yearNavigator={yearNavigator}
									yearRange={yearRange}
									maxDate={!timeOnly ? new Date() : undefined}
									required={requiredTo}
									timeOnly={timeOnly}
									showTime={showTime}
								/>
								<div aria-live="assertive">
									{validator ? validator.message(idTo, labelTo, to, validatorsTo) : null}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

CriteriaPickTableComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	dateFormat: 'dd-mm-yy',
	dateFormatMoment: 'DD-MM-YYYY',
	disabled: false,
	labelFrom: 'Od',
	labelTo: 'Do',
	placeholderFrom: 'dd-mm-rrrr',
	placeholderTo: 'dd-mm-rrrr',
	readOnlyInput: false,
	showIcon: true,
	validators: 'not_required|date|date_format:DD-MM-YYYY,dd-mm-rrrr',
	monthNavigator: true,
	yearNavigator: true,
	yearRange: '1900:2030',
	timeOnly: false,
	showTime: false,
	validateOnChange: true
};

CriteriaPickTableComponent.propTypes = {
	appendTo: PropTypes.any,
	colClass: PropTypes.string,
	dateFormat: PropTypes.string,
	dateFormatMoment: PropTypes.string,
	disabled: PropTypes.bool,
	from: PropTypes.instanceOf(Date).isRequired,
	idFrom: PropTypes.string.isRequired,
	idTo: PropTypes.string.isRequired,
	label: PropTypes.string,
	labelFrom: PropTypes.string,
	labelTo: PropTypes.string,
	monthNavigator: PropTypes.bool,
	nameFrom: PropTypes.string.isRequired,
	nameTo: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	placeholderFrom: PropTypes.string,
	placeholderTo: PropTypes.string,
	readOnlyInput: PropTypes.bool,
	showIcon: PropTypes.bool,
	to: PropTypes.instanceOf(Date).isRequired,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	validatorsFromExt: PropTypes.string,
	yearNavigator: PropTypes.bool,
	yearRange: PropTypes.string,
	timeOnly: PropTypes.bool,
	showTime: PropTypes.bool,
	maxDateToday: PropTypes.bool,
};

export default CriteriaPickTableComponent;
