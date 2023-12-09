import PropTypes from 'prop-types';
import React from 'react';
import CriteriaInputNumberComponent from './CriteriaInputNumberComponent';

class CriteriaNumberRangeComponent extends React.Component {
	componentDidMount() { }

	render() {
		const {
			appendTo,
			colClass,
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
			to,
			validator,
			validators,
			viewMode,
			minFrom,
			maxFrom,
			minTo,
			maxTo,
			mode,
			locale,
			currency,
			minFractionDigits,
			maxFractionDigits,
		} = this.props;

		return (
			<div className={`${colClass} range`}>
				<div className='row'>
					<div className='col-md-12 form-group'>
						<div className='row'>
							<div className='col-md-6 order-1 order-md-1'>
								<label id={`${idFrom}-label-id`} className='p-label' htmlFor={idFrom} >
									{label} {labelFrom}
								</label>
							</div>
							
							<div className='col-md-6 order-3 order-md-2'>
								<label id={`${idFrom}-label-id`} className='p-label' htmlFor={idFrom}>
									{label} {labelTo}
								</label>
							</div>

							<div className='col-md-6 order-2 order-md-3'>
								<CriteriaInputNumberComponent
									appendTo={appendTo}
									ariaDescribedBy={`${idFrom}-error`}
									key={idFrom}
									id={idFrom}
									inputId={`${idFrom}-input`}
									name={nameFrom}
									value={from}
									onChange={onChange}
									readOnlyInput={readOnlyInput}
									placeholder={placeholderFrom}
									disabled={disabled}
									viewMode={viewMode}
									min={minFrom}
									max={maxFrom}
									mode={mode}
									locale={locale}
									currency={currency}
									minFractionDigits={minFractionDigits}
									maxFractionDigits={maxFractionDigits}
									validator={validator}
									validators={validators}
								/>
							</div>
							
							<div className='col-md-6 order-4 order-md-4'>
								<CriteriaInputNumberComponent
									appendTo={appendTo}
									ariaDescribedBy={`${idTo}-error`}
									key={idTo}
									id={idTo}
									inputId={`${idTo}-input`}
									name={nameTo}
									value={to}
									onChange={onChange}
									readOnlyInput={readOnlyInput}
									placeholder={placeholderTo}
									disabled={disabled}
									viewMode={viewMode}
									min={minTo}
									max={maxTo}
									mode={mode}
									locale={locale}
									currency={currency}
									minFractionDigits={minFractionDigits}
									maxFractionDigits={maxFractionDigits}
									validator={validator}
									validators={validators}
								/>
							</div>

						</div>
					</div>
				</div>
			</div>
		);
	}
}

CriteriaNumberRangeComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	dateFormat: 'dd-mm-yy',
	dateFormatMoment: 'DD-MM-YYYY',
	disabled: false,
	labelFrom: 'od',
	labelTo: 'do',
	readOnlyInput: false,
	validators: 'not_required',
	viewMode: 'EDIT',
	minFrom: undefined,
	maxFrom: undefined,
	minTo: undefined,
	maxTo: undefined,
};

CriteriaNumberRangeComponent.propTypes = {
	appendTo: PropTypes.any,
	colClass: PropTypes.string,
	disabled: PropTypes.bool,
	from: PropTypes.number.isRequired,
	to: PropTypes.number.isRequired,
	idFrom: PropTypes.string.isRequired,
	idTo: PropTypes.string.isRequired,
	label: PropTypes.string,
	labelFrom: PropTypes.string,
	labelTo: PropTypes.string,
	nameFrom: PropTypes.string.isRequired,
	nameTo: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	placeholderFrom: PropTypes.string,
	placeholderTo: PropTypes.string,
	readOnlyInput: PropTypes.bool,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	viewMode: PropTypes.string,
	minFrom: PropTypes.number,
	maxFrom: PropTypes.number,
	minTo: PropTypes.number,
	maxTo: PropTypes.number,
	mode: PropTypes.string,
	locale: PropTypes.string,
	currency: PropTypes.string,
	minFractionDigits: PropTypes.number,
	maxFractionDigits: PropTypes.number,
};

export default CriteriaNumberRangeComponent;
