import PropTypes from 'prop-types';
import React from 'react';
import InputTextComponent from './inputs/InputTextComponent';
import VoivodeshipDropdown from '../components/VoivodeshipDropdown';
import SimpleReactValidator from './validator';
import InputNumberComponent from './inputs/InputNumberComponent';

class Address extends React.Component {
	render() {
		const { idPrefix } = this.props;
		return (
			<React.Fragment>

				<InputTextComponent
					id={`${idPrefix}postCode`}
					name='postCode'
					label={'Kod pocztowy'}
					colClass={this.props.colClass}
					value={this.props.element?.postCode}
					stateField={this.props.stateField}
					validator={this.props.validator}
					validators={`zipcode${this.props.required ? '|required' : ''}`}
					onChange={this.props.handleChange}
					viewMode={this.props.viewMode}
					disabled={this.props.disabled}
					validateViewMode
					placeholder="Wpisz kod pocztowy"
				/>
				<InputTextComponent
					id={`${idPrefix}city`}
					name='city'
					label={'Miejscowość'}
					colClass={this.props.colClass}
					value={this.props.element?.city}
					stateField={this.props.stateField}
					onChange={this.props.handleChange}
					viewMode={this.props.viewMode}
					validator={this.props.validator}
					validators={`max:100|alpha_space_dash${this.props.required ? '|required' : ''}`}
					disabled={this.props.disabled}
					validateViewMode
					placeholder="Wpisz miejscowość"
				/>
				<InputTextComponent
					id={`${idPrefix}street`}
					name='street'
					label={'Ulica'}
					colClass={this.props.colClass}
					value={this.props.element?.street}
					stateField={this.props.stateField}
					onChange={this.props.handleChange}
					viewMode={this.props.viewMode}
					validator={this.props.validator}
					validators='max:100'
					disabled={this.props.disabled}
					validateViewMode
					placeholder="Wpisz ulicę"
				/>

				<InputTextComponent
					id={`${idPrefix}route`}
					name='route'
					label={'Droga'}
					colClass={this.props.colClass}
					value={this.props.element?.route}
					stateField={this.props.stateField}
					onChange={this.props.handleChange}
					viewMode={this.props.viewMode}
					validator={this.props.validator}
					validators='max:50'
					disabled={this.props.disabled}
					validateViewMode
					placeholder="Wpisz drogę"
				/>
				<VoivodeshipDropdown
					id={`${idPrefix}voivodeship`}
					label='Województwo'
					colClass={this.props.colClass}
					name='voivodeship'
					value={this.props.element?.voivodeship}
					stateField={this.props.stateField}
					onChange={this.props.handleChange}
					viewMode={this.props.voivodeshipReadOnly ? 'VIEW' : this.props.viewMode}
					validator={this.props.validator}
					validators={`${this.props.required ? 'required' : 'not_required'}`}
					optionLabel='name'
					dataKey='id'
					rendered={this.props.voivodeship}
					disabled={this.props.disabled}
					validateViewMode
					placeholder="Wpisz województwo"
				/>
			</React.Fragment>
		);
	}
}

Address.defaultProps = {
	element: null,
	idPrefix: '',
	viewMode: 'VIEW',
	stateField: 'element.address',
	voivodeship: false,
	voivodeshipReadOnly: false,
	voivodeshipVisibility: true,
	required: false,
	colClass: 'col-md-4',
	disabled: false
};

Address.propTypes = {
	element: PropTypes.object,
	idPrefix: PropTypes.string,
	stateField: PropTypes.string,
	viewMode: PropTypes.string.isRequired,
	handleChange: PropTypes.func.isRequired,
	validator: PropTypes.instanceOf(SimpleReactValidator).isRequired,
	voivodeship: PropTypes.bool,
	voivodeshipReadOnly: PropTypes.bool,
	voivodeshipVisibility: PropTypes.bool,
	required: PropTypes.bool,
	colClass: PropTypes.string,
	disabled: PropTypes.bool,
};

export default Address;
