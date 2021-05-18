import React from 'react';
import { Prompt } from 'react-router-dom';
import { ConfirmDialog } from 'primereact/confirmdialog';
export class LeaveFormConfirmationComponent extends React.Component {
	state = {
		modalVisible: false,
		lastLocation: null,
		confirmedNavigation: false,
	};
	showModal = (location) =>
		this.setState({
			modalVisible: true,
			lastLocation: location,
		});
	closeModal = (callback) =>
		this.setState(
			{
				modalVisible: false,
			},
			callback
		);
	handleBlockedNavigation = (nextLocation) => {
		const { confirmedNavigation } = this.state;
        const {shouldBlockNavigation} = this.props
		if (!confirmedNavigation && shouldBlockNavigation(nextLocation)) {
			this.showModal(nextLocation);
			return false;
		}

		return true;
	};
	handleConfirmNavigationClick = () =>
		this.closeModal(() => {
			const { navigate } = this.props;
			const { lastLocation } = this.state;
			if (lastLocation) {
				this.setState(
					{
						confirmedNavigation: true,
					},
					() => {
                        navigate(lastLocation.pathname)
					}
				);
			}
		});

	onHide(name) {
		this.setState({
			[`${name}`]: false,
			modalVisible: false,
		});
	}

	render() {
		const { when } = this.props;
		const { modalVisible, lastLocation } = this.state;
		return (
			<>
				<Prompt when={when} message={this.handleBlockedNavigation} />
				<ConfirmDialog
                    acceptLabel='TAK'
                    rejectLabel='NIE'
					visible={modalVisible}
					onHide={() => this.onHide()}
					message="Czy chesz opuścić formularz bez zapisywania zmian?"
					header=""
					icon="pi pi-exclamation-triangle"
					accept={() => this.handleConfirmNavigationClick()}
					reject={() => this.closeModal()}
				/>
			</>
		);
	}
}
export default LeaveFormConfirmationComponent;
