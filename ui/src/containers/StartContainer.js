import React from 'react';
import BaseContainer from '../baseContainers/BaseContainer';
import CustomMessages from '../components/CustomMessages';
import DivContainer from '../components/DivContainer';
import BlockUi from '../components/waitPanel/BlockUi';
import {BreadcrumbsItem} from "react-breadcrumbs-dynamic";
import {Toast} from "primereact/toast";

class StartContainer extends BaseContainer {

    constructor(props) {
        super(props);
        this.state = {
            loading: true
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.setState({
            loading: false
        });
    }

    render() {
        return (
            <React.Fragment>
                <BreadcrumbsItem to='/start'>{'Strona startowa'}</BreadcrumbsItem>
                <Toast id='toast-messages' position='top-center' ref={(el) => this.messages = el}/>
                <BlockUi tag='div' blocking={this.state.blocking || this.state.loading} loader={this.loader}>
                    <DivContainer colClass='col-12 dashboard-link-container'>
                        <DivContainer colClass='row'>
                            <div className="font-medium mb-4">Witaj</div>
                        </DivContainer>
                        <DivContainer colClass='card-deck'>
                            {this.state.loading === false ? (this.renderContent()) : null}
                        </DivContainer>
                    </DivContainer>
                </BlockUi>
            </React.Fragment>
        );
    }

    renderDetails() {
        return (
            <React.Fragment>
                <DivContainer colClass='col-12 dashboard-link-container'>
                    <DivContainer colClass='row'>
                        <div className="font-medium mb-4">Witaj</div>
                    </DivContainer>
                </DivContainer>
            </React.Fragment>
        );
    }
}

export default StartContainer;
