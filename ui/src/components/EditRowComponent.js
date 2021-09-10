/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import DivContainer from "./DivContainer";
import {InputText} from "primereact/inputtext";
import BaseContainer from "../baseContainers/BaseContainer";
import {Panel} from "primereact/panel";

export class EditRowComponent extends BaseContainer {

    constructor(props) {
        super(props);
    }

    render() {
        let editData = this.props.editData;
        return <React.Fragment>
            <div id="row-edit">
                <b>Funkcjonalność w przygotowaniu ...</b>
                <br/>
                <div className="label">{editData.editInfo?.viewName}</div>
                <br/>
                {editData.editFields?.map((group, index) => {
                        return this.renderGroup(group, index)
                    }
                )}
            </div>
        </React.Fragment>
    }

    renderGroup(group, groupIndex) {
        return <React.Fragment>
            <Panel className={'mb-4'} header={group.groupName} toggleable>
                <DivContainer>
                    {group.fields?.map((field, index) => {
                            return this.renderField(field, index)
                        }
                    )}
                </DivContainer>
            </Panel>
        </React.Fragment>;
    }

    renderField(field, fieldIndex) {
        return <React.Fragment>
            {field.visible ?
                <DivContainer colClass={'row mb-2'}>
                    <DivContainer>
                    <span className="p-float-label">
                        <InputText id={`field_${fieldIndex}`}
                                   style={{width: '100%'}}
                                   type="text"
                                   value={field.value}/>
                        <label htmlFor={`field_${fieldIndex}`}>{field.label}</label>
                    </span>
                    </DivContainer>
                </DivContainer>
                : null}

        </React.Fragment>;
    }
}

EditRowComponent.defaultProps = {};

EditRowComponent.propTypes = {
    editData: PropTypes.object.isRequired,
};

export default EditRowComponent;
