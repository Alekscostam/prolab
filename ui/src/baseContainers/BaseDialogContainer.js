import React from 'react';
import BaseDetailsContainer from "./BaseDetailsContainer";
import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';
import {Card} from 'primereact/card';
import BlockUi from '../components/waitPanel/BlockUi';
import {Messages} from 'primereact/messages';

class BaseDialogContainer extends BaseDetailsContainer{
    constructor(props, service) {
		super(props);
        console.log(props)
		this.service = service;
        this.state={}
    }
    prepareFooterItems() {
		const { viewMode } = this.props;
		switch (viewMode) {
			case 'EDIT':
			case 'NEW':
				return [
					{ label: 'Anuluj',  onClick: this.props.onHide },
					{
						label: 'Zapisz',
						className: 'float-right',
						onClick: this.handleFormSubmit,
					},
				];
			case 'VIEW':
			default:
				return [];
		}
	}

    renderDetails(){
        return;
    }
    prepareHeaderItems() {
		return [];
	}
	onKeyDown(e){
		if (e.key === 'Enter') {
			e.preventDefault();
			this.handleFormSubmit();
		}
}
    render() {
        const {className, header, id, key, name, onHide, visible, style } = this.props;
        return (
            <BlockUi tag='div' blocking={this.state.blocking || this.state.loading} loader={this.loader}>
            <Messages id="custom-messages" ref={(el) => (this.messages = el)} ></Messages>
            <Dialog ariaCloseIconLabel='Zamknij okno dialogowe' header={header} visible={visible} className={className} style={style} key={`${key ? key : id ? id : name}-dialog`} onHide={() => (onHide ? onHide() : null)}>
                <div style={{ marginBottom: '20px' }} className='row col-12'>
                    {this.renderHeader()}
                </div>					
                {this.state.loading ? null : (
						<Card footer={this.renderFooter()}>
							<form onSubmit={this.handleFormSubmit} noValidate onKeyDown={e => this.onKeyDown(e)}>
								{this.renderDetails()}
							</form>
						</Card>
					)}
            </Dialog>
            </BlockUi>
        );
    };
}
BaseDialogContainer.defaultProps = {
	currentUser: undefined,
	viewMode: 'VIEW',
	style: { width: '30vw' }
};

BaseDialogContainer.propTypes = {
	backUrl: PropTypes.string,
	cancelUrl: PropTypes.string,
	currentUser: PropTypes.object,
	editUrl: PropTypes.string,
	viewMode: PropTypes.string,
	style: PropTypes.object
};

export default BaseDialogContainer;