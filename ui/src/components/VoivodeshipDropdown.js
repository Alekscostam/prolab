/* eslint-disable react/jsx-handler-names */
import {PropTypes} from 'prop-types';
import React, {Component} from 'react';
import VoivodeshipDictionaryService from './../services/dictionary/VoivodeshipDictionaryService'
import InputDropdownComponent from './inputs/InputDropdownComponent';

class VoivodeshipDropdown extends Component {
	constructor(props) {
		super(props);
		this.dictionaryService = new VoivodeshipDictionaryService();
		this.state = {
			voivodeshipsOptions: [],
		};
		this._isMounted = false;
	}

	componentDidMount() {
		this._isMounted = true;
		if (this.props.rendered) {
			this.dictionaryService
				.getList()
				.then((voivodeshipsOptions) => {
					if (this._isMounted) {
						this.setState({
							voivodeshipsOptions: voivodeshipsOptions,
						});
					}
				})
				.catch(() => {});
		}
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	render() {
		const {
			appendTo,
			children,
			colClass,
			dataKey,
			disabled,
			filter,
			id,
			insideTable,
			label,
			name,
			onAfterStateChange,
			onChange,
			optionLabel,
			optionValue,
			placeholder,
			publicMode,
			showClear,
			showLabel,
			stateField,
			validator,
			validators,
			value,
			viewMode,
			rendered,
		} = this.props;
		if (rendered) {
			return (
				<InputDropdownComponent
					appendTo={appendTo}
					children={children}
					colClass={colClass}
					dataKey={dataKey}
					disabled={disabled}
					filter={filter}
					id={id}
					insideTable={insideTable}
					label={label}
					name={name}
					onAfterStateChange={onAfterStateChange}
					onChange={onChange}
					optionLabel={optionLabel}
					optionValue={optionValue}
					options={this.state.voivodeshipsOptions}
					placeholder={placeholder}
					publicMode={publicMode}
					showClear={showClear}
					showLabel={showLabel}
					stateField={stateField}
					validator={validator}
					validators={validators}
					value={value}
					viewMode={viewMode}
					validateViewMode={this.props.validateViewMode}
				/>
			);
		} else {
			return null;
		}
	}
}

VoivodeshipDropdown.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disabled: false,
	filter: false,
	filterBy: 'label',
	insideTable: false,
	placeholder: 'Wybierz',
	publicMode: false,
	rendered: true,
	showClear: false,
	showLabel: true,
	stateField: 'element',
	validateViewMode: false,
	validators: 'required',
	viewMode: 'VIEW',
};

VoivodeshipDropdown.propTypes = {
	colClass: PropTypes.string,
	dataKey: PropTypes.string,
	disabled: PropTypes.bool,
	filter: PropTypes.bool,
	filterBy: PropTypes.string,
	id: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	onAfterStateChange: PropTypes.func,
	onChange: PropTypes.func.isRequired,
	placeholder: PropTypes.string,
	rendered: PropTypes.bool,
	showClear: PropTypes.bool,
	showLabel: PropTypes.bool,
	stateField: PropTypes.string,
	validateViewMode: PropTypes.bool,
	validator: PropTypes.object.isRequired,
	validators: PropTypes.string,
	value: PropTypes.object,
	viewMode: PropTypes.string,
};

export default VoivodeshipDropdown;
