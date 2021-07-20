import React from 'react';
import BaseContainer from '../baseContainers/BaseContainer';
import CustomMessages from '../components/CustomMessages';
import DivContainer from '../components/DivContainer';
import BlockUi from '../components/waitPanel/BlockUi';
import {GridViewContainer} from "./GridViewContainer";


class TableContainer extends BaseContainer {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            list: [],
            coordinate: 0
        };
    }

    render() {
        return (
            <DivContainer colClass='dashboard'>
                <BlockUi tag='div' blocking={this.state.blocking || this.state.loading} loader={this.loader}>
                    <CustomMessages ref={(el) => (this.messages = el)}/>
                    {this.state.loading ? null : (
                        <form onSubmit={this.handleFormSubmit} onClick={this.handleClick} noValidate>
                            {this.renderDetails()}
                        </form>
                    )}
                </BlockUi>
            </DivContainer>
        );
    }


    renderDetails() {
        return (
            <React.Fragment>
                <GridViewContainer/>
            </React.Fragment>
        );
    }
}

export default TableContainer;
