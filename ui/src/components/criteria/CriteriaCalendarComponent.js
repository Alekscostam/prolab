import React from 'react';
import PropTypes from 'prop-types';
import {Calendar} from 'primereact/calendar';
import {addLocale} from 'primereact/api';

class CriteriaCalendarComponent extends React.Component {
	componentDidMount() {}

	render() {
		const {
			appendTo,
			colClass,
			dateFormat,
			disabled,
			id,
			label,
			name,
			onChange,
			placeholder,
			readOnlyInput,
			showIcon,
			validator,
			validators,
			value,
			monthNavigator,
			yearNavigator,
			yearRange,
		} = this.props;
		const required =
			validators !== undefined &&
			validators.includes('required') &&
			!validators.includes('not_required');
		const info = '. Aby przejść do edycji kolejnego pola kliknij Esc następnie Tab';
		return (
			<div className={colClass}>
				<div className="row">
					<div className="col-md-12 form-group">
						{label !== undefined ? (
							// eslint-disable-next-line react/jsx-max-props-per-line
							<label
								id={`${id}-label-id`}
								className="p-label"
								htmlFor={`${id}-input`}
								style={{ width: '100%' }}
							>
								{label}
							</label>
						) : null}
						<Calendar
							appendTo={appendTo}
							ariaDescribedBy={`${id}-error`}
							ariaLabel={`${label} - data w formacie ${placeholder}${info}`}
							ariaLabelledBy={label === undefined ? `${id}-label-id` : undefined}
							key={id}
							id={id}
							inputId={`${id}-input`}
							name={name}
							style={{ width: '100%' }}
							value={value}
							onChange={onChange}
							readOnlyInput={readOnlyInput}
							locale='pl'
							dateFormat={dateFormat}
							placeholder={placeholder}
							showIcon={showIcon}
							disabled={disabled}
							monthNavigator={monthNavigator}
							yearNavigator={yearNavigator}
							yearRange={yearRange}
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
}

addLocale('pl', {
	firstDayOfWeek: 1,
	dayNames: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
	dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
	dayNamesMin: ['N', 'P', 'W', 'Ś', 'Cz', 'Pt', 'S'],
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
	today: 'Dzisiaj',
	clear: 'Wyczyść'
});

CriteriaCalendarComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	dateFormat: 'dd-mm-yy',
	disabled: false,
	placeholder: 'dd-mm-rrrr',
	readOnlyInput: false,
	showIcon: false,
	validators: 'not_required|date|date_format:DD-MM-YYYY,dd-mm-rrrr',
	monthNavigator: true,
	yearNavigator: true,
	yearRange: '1900:2030',
};

CriteriaCalendarComponent.propTypes = {
	appendTo: PropTypes.any,
	colClass: PropTypes.string,
	dateFormat: PropTypes.string,
	disabled: PropTypes.bool,
	id: PropTypes.string.isRequired,
	label: PropTypes.string,
	monthNavigator: PropTypes.bool,
	name: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	placeholder: PropTypes.string,
	readOnlyInput: PropTypes.bool,
	showIcon: PropTypes.bool,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	value: PropTypes.instanceOf(Date),
	yearNavigator: PropTypes.bool,
	yearRange: PropTypes.string,
};

export default CriteriaCalendarComponent;
