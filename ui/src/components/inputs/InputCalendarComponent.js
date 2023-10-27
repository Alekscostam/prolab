import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Calendar} from 'primereact/calendar';
import {addLocale} from "primereact/api";

class InputCalendarComponent extends Component {
    handleChange(event) {
        const {onChange} = this.props;
        if (moment(event.target.value).isValid()) {
            onChange(event);
        }
    }

    renderView() {
        const {
            colClass,
            dateFormatMoment,
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
					<span aria-label={label} aria-labelledby={`${id}-label-id`} className="p-inputtext-view">
						{value ? moment(value).format(dateFormatMoment) : ''}
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
                                style={{width: '100%'}}
                            >
                                {label}
                            </label>
                        ) : null}
                        <span
                            aria-label={label}
                            aria-labelledby={`${id}-label-id`}
                            className="p-inputtext-view"
                        >
							{value ? moment(value).format(dateFormatMoment) : ''}
						</span>
                        {validateViewMode && validator ? validator.message(id, label, value, validators) : null}
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
            disabled,
            id,
            insideTable,
            label,
            name,
            onAfterStateChange,
            onChange,
            placeholder,
            publicMode,
            readOnlyInput,
            showIcon,
            showLabel,
            stateField,
            validator,
            validators,
            value,
            monthNavigator,
            yearNavigator,
            yearRange,
            showTime,
            minDate
        } = this.props;
        const required =
            validators !== undefined &&
            validators.includes('required') &&
            !validators.includes('not_required');
        const info = '. Aby przejść do edycji kolejnego pola kliknij Esc następnie Tab';
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
                    <Calendar
                        appendTo={appendTo}
                        ariaDescribedBy={`${id}-error`}
                        ariaLabel={`${label} - data w formacie ${placeholder}${info}`}
                        ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
                        key={id}
                        id={id}
                        inputId={`${id}-input`}
                        name={name}
                        style={{width: '100%'}}
                        value={value}
                        onChange={e =>
                            onChange ? onChange('CALENDAR', undefined, e, onAfterStateChange, stateField) : null
                        }
                        readOnlyInput={readOnlyInput}
                        locale={'pl'}
                        dateFormat={dateFormat}
                        placeholder={placeholder}
                        showIcon={showIcon}
                        disabled={disabled}
                        monthNavigator={monthNavigator}
                        yearNavigator={yearNavigator}
                        yearRange={yearRange}
                        required={required}
                        showTime={showTime}
                        minDate={minDate}
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
                                style={{width: '100%'}}
                            >
                                {label}
                            </label>
                        ) : null}
                        <Calendar
                            appendTo={appendTo}
                            ariaDescribedBy={`${id}-error`}
                            ariaLabel={`${label} - data w formacie ${placeholder}${info}`}
                            ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
                            key={id}
                            id={id}
                            inputId={`${id}-input`}
                            name={name}
                            style={{width: '100%'}}
                            value={value}
                            onChange={e =>
                                onChange ? onChange('CALENDAR', undefined, e, onAfterStateChange, stateField) : null
                            }
                            readOnlyInput={readOnlyInput}
                            locale={'pl'}
                            dateFormat={dateFormat}
                            placeholder={placeholder}
                            showIcon={showIcon}
                            disabled={disabled}
                            monthNavigator={monthNavigator}
                            yearNavigator={yearNavigator}
                            yearRange={yearRange}
                            required={required}
                            showTime={showTime}
                            minDate={minDate}
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
        const {rendered, viewMode} = this.props;
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

InputCalendarComponent.defaultProps = {
    colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
    dateFormat: 'dd-mm-yy',
    dateFormatMoment: 'DD-MM-YYYY',
    disabled: false,
    insideTable: false,
    placeholder: 'dd-mm-rrrr',
    showIcon: false,
    showLabel: true,
    stateField: 'element',
    publicMode: false,
    rendered: true,
    readOnlyInput: false,
    validateViewMode: false,
    validators: 'required|date|date_format:DD-MM-YYYY,dd-mm-rrrr',
    viewMode: 'VIEW',
    monthNavigator: true,
    yearNavigator: true,
    yearRange: '1900:2030',
    showTime: false,
    minDate: undefined
};

InputCalendarComponent.propTypes = {
    appendTo: PropTypes.any,
    colClass: PropTypes.string,
    dateFormat: PropTypes.string,
    dateFormatMoment: PropTypes.string,
    disabled: PropTypes.bool,
    id: PropTypes.string.isRequired,
    insideTable: PropTypes.bool,
    label: PropTypes.string.isRequired,
    monthNavigator: PropTypes.bool,
    name: PropTypes.string.isRequired,
    onAfterStateChange: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    publicMode: PropTypes.bool,
    readOnlyInput: PropTypes.bool,
    rendered: PropTypes.bool,
    showIcon: PropTypes.bool,
    showLabel: PropTypes.bool,
    stateField: PropTypes.string,
    validateViewMode: PropTypes.bool,
    validator: PropTypes.object.isRequired,
    validators: PropTypes.string,
    value: PropTypes.instanceOf(Date),
    viewMode: PropTypes.string,
    yearNavigator: PropTypes.bool,
    yearRange: PropTypes.string,
    showTime: PropTypes.bool,
    minDate: PropTypes.instanceOf(Date),
};

export default InputCalendarComponent;
