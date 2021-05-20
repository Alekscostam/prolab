import PropTypes from 'prop-types';
import React from 'react';
import {BreadcrumbsItem} from 'react-breadcrumbs-dynamic';
import BaseContainer from '../../baseContainers/BaseContainer';
import DivContainer from '../../components/DivContainer';
import UserService from '../../services/UserService';

class HelpContainer extends BaseContainer {
	constructor(props) {
		super(props, new UserService());
		this.state = {
			loading: true,
		};
	}

	prepareHeaderItems() {
		return [];
	}

	prepareFooterItems() {
		return [];
	}

	render() {
		return (
			<div className='container-fluid'>
				<BreadcrumbsItem to='/help-page' className='p-link'>
					{'Pomoc'}
				</BreadcrumbsItem>
				<DivContainer colClass='col-12 separator-container'>
					<DivContainer colClass='row'>
						<DivContainer colClass='separator'></DivContainer>
					</DivContainer>
				</DivContainer>
				<React.Fragment>
					<div className='row'>
						<div className='col-12 help-text'>
							Drogi użytkowniku, <br />
							<br />W przypadku problemów technicznych z platformą dostępową możesz z kontaktować się z naszymi konsultantami dostępnymi pod numerem telefonu <span className='help-phone'>22 372 82 82</span> lub wysłać zgłoszenie na adres
							e-mail: <a href='mailto:pomoc@anwim.pl'>pomoc@anwim.pl</a>. <br />
							<br />
							Zanim skontaktujesz się z naszymi konsultantami sprawdź czy masz połączenie z Twoją stacją poprzez sprawdzenie statusu połączenia dostępnego w liście stacji. Jeżeli przy danej stacji będziesz miał status{' '}
							<span class='icon_text p-button-text p-c accent'>
								<i class='icon mdi mdi-close-circle'></i>
							</span>
							, to należy najpierw zweryfikować czy na stacji jest Internet. Jeżeli na stacji jest Internet a Ty nadal nie możesz połączyć się ze swoją stacją lub masz inny problem techniczny skontaktuj się z naszymi konsultantami. Jeżeli
							konsultant podczas rozmowy poprosi Ciebie o udostępnienie Twojego pulpitu, prosimy o uruchomienie aplikacji dostępnej pod tym{' '}
							<a href='https://get.teamviewer.com/aa23ea2' target='_blank' rel='noopener noreferrer' tabIndex='0'>
								linkiem
							</a>
							.
						</div>
					</div>
				</React.Fragment>
			</div>
		);
	}
}

HelpContainer.defaultProps = {
	viewMode: 'EDIT',
};

HelpContainer.propTypes = {
	viewMode: PropTypes.string.isRequired,
};

export default HelpContainer;
