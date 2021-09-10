/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';

export class EditRowComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <React.Fragment>
            <b>Funkcjonalność w przygotowaniu ...</b>
            <br/>
            {JSON.stringify(this.props.editData)}
        </React.Fragment>
    }
}

EditRowComponent.defaultProps = {};

EditRowComponent.propTypes = {
    editData: PropTypes.object.isRequired,
};

export default EditRowComponent;
