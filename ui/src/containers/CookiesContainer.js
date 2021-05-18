import PropTypes from 'prop-types';
import React from 'react';
import { BreadcrumbsItem } from 'react-breadcrumbs-dynamic';
import BaseContainer from '../baseContainers/BaseContainer';
import DivContainer from '../components/DivContainer';
import UserService from '../services/UserService';

class CookiesContainer extends BaseContainer {
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
			<div className='container'>
				<BreadcrumbsItem to='/cookies-page' className='p-link'>
					{'Pomoc'}
				</BreadcrumbsItem>
				<DivContainer colClass='col-12 separator-container'>
					<DivContainer colClass='row'>
						<DivContainer colClass='separator'></DivContainer>
					</DivContainer>
				</DivContainer>
				<React.Fragment>
					<div className='row'>
						<div className='col-12 cookie-text'>
							<h5>
								<center>
									<u>POLITYKA COOKIES</u>
								</center>
							</h5>
							<br />
							Niniejsza Polityka dotyczy plików „cookies” i odnosi się do stron internetowych, których operatorem jest Anwim S.A. z siedzibą w
							Warszawie, przy ul. Stańczyka 3, 01-127 Warszawa (zwanych dalej: „stronami internetowymi”).
							<br />
							<ol>
								<li>
									Strony Internetowe nie zbierają w sposób automatyczny żadnych informacji, z wyjątkiem informacji zawartych w plikach
									cookies.
								</li>
								<li>
									Pliki cookies (tzw. „ciasteczka”) stanowią dane informatyczne, w szczególności pliki tekstowe, które przechowywane są w
									urządzeniu końcowym użytkownika i przeznaczone są do korzystania ze stron internetowych. Cookies zazwyczaj zawierają nazwę
									strony internetowej, z której pochodzą, czas przechowywania ich na urządzeniu końcowym, unikalny numer oraz o czasie
									ważności danego pliku cookies.
								</li>
								<li>
									Podmiotem zamieszczającym na urządzeniu końcowym użytkownika pliki cookies oraz uzyskującym do nich dostęp jest operator
									strony internetowej z siedzibą pod adresem: ul. Daimlera 2, 02-460 Warszawa
								</li>
								<li>Pliki cookies wykorzystywane są w celu:</li>
								<ul>
									<li>
										dostosowania zawartości stron internetowych do preferencji Użytkownika oraz optymalizacji korzystania ze stron
										internetowych; w szczególności pliki te pozwalają rozpoznać urządzenie użytkownika i odpowiednio wyświetlić stronę
										internetową, dostosowaną do jego indywidualnych potrzeb;
									</li>
									<li>
										tworzenia statystyk, które pomagają zrozumieć, w jaki sposób użytkownicy korzystają ze stron internetowych, co
										umożliwia ulepszanie ich struktury i zawartości;
									</li>
								</ul>
								<li>
									Stosowane są dwa zasadnicze rodzaje plików cookies: „sesyjne” (session cookies) oraz „stałe” (persistent cookies). Cookies
									„sesyjne” są plikami tymczasowymi, które przechowywane są w urządzeniu końcowym użytkownika do czasu wylogowania,
									opuszczenia strony internetowej lub wyłączenia oprogramowania (przeglądarki internetowej). „Stałe” pliki cookies
									przechowywane są w urządzeniu końcowym użytkownika przez czas określony w parametrach plików cookies lub do czasu ich
									usunięcia przez użytkownika.
								</li>
								<li>Stosowane są następujące rodzaje plików cookies:</li>
								<ul>
									<li>
										„niezbędne” pliki cookies, umożliwiające korzystanie z usług dostępnych, np. uwierzytelniające pliki cookies
										wykorzystywane do usług wymagających uwierzytelniania;
									</li>
									<li>
										pliki cookies służące do zapewnienia bezpieczeństwa, np. wykorzystywane do wykrywania nadużyć w zakresie
										uwierzytelniania;
									</li>
									<li>„wydajnościowe” pliki cookies, umożliwiające zbieranie informacji o sposobie korzystania ze stron internetowych;</li>
									<li>
										„funkcjonalne” pliki cookies, umożliwiające „zapamiętanie” wybranych przez Użytkownika ustawień i personalizację
										interfejsu użytkownika, np. w zakresie wybranego języka lub regionu, z którego pochodzi użytkownik, rozmiaru czcionki,
										wyglądu strony internetowej itp.;
									</li>
									<li>
										„reklamowe” pliki cookies, umożliwiające dostarczanie użytkownikom treści reklamowych bardziej dostosowanych do ich
										zainteresowań.
									</li>
								</ul>
								<li>
									W wielu przypadkach oprogramowanie służące do przeglądania stron internetowych (przeglądarka internetowa) domyślnie
									dopuszcza przechowywanie plików cookies w urządzeniu końcowym użytkownika. Użytkownicy mogą dokonać w każdym czasie zmiany
									ustawień dotyczących plików cookies. Ustawienia te mogą zostać zmienione w szczególności w taki sposób, aby blokować
									automatyczną obsługę plików cookies w ustawieniach przeglądarki internetowej bądź informować o ich każdorazowym
									zamieszczeniu w urządzeniu użytkownika. Szczegółowe informacje o możliwości i sposobach obsługi plików cookies dostępne są w
									ustawieniach oprogramowania (przeglądarki internetowej).
								</li>
								<li>
									Anwim informuje, że ograniczenia stosowania plików cookies mogą wpłynąć na niektóre funkcjonalności dostępne na stronach
									internetowych.
								</li>
								<li>
									Pliki cookies zamieszczane w urządzeniu końcowym użytkownika mogą być również wykorzystywane przez współpracujących z
									operatorem Anwim, reklamodawców oraz partnerów.
								</li>
							</ol>
						</div>
					</div>
				</React.Fragment>
			</div>
		);
	}
}

CookiesContainer.defaultProps = {
	viewMode: 'EDIT',
};

CookiesContainer.propTypes = {
	viewMode: PropTypes.string.isRequired,
};

export default CookiesContainer;
