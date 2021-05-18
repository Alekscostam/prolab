import React from 'react';
import BaseContainer from '../baseContainers/BaseContainer';
import CustomMessages from '../components/CustomMessages';
import DivContainer from '../components/DivContainer';
import NavComponent from '../components/layouts/NavComponent';
import BlockUi from '../components/waitPanel/BlockUi';

class StartContainer extends BaseContainer {
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
			<DivContainer colClass='container'>
				<DivContainer colClass='dashboard'>
					<BlockUi tag='div' blocking={this.state.blocking || this.state.loading} loader={this.loader}>
						<CustomMessages ref={(el) => (this.messages = el)} />
						{this.state.loading ? null : (
							<form onSubmit={this.handleFormSubmit} noValidate>
								{this.renderDetails()}
							</form>
						)}

					</BlockUi>
				</DivContainer>
			</DivContainer >
		);
	}

	renderDetails() {
		return (
			<React.Fragment>
				<DivContainer colClass='col-12 dashboard-link-container'>
					<DivContainer colClass='row'>
						<NavComponent />
					</DivContainer>
				</DivContainer>
			</React.Fragment>
		);
	}
}

export default StartContainer;
