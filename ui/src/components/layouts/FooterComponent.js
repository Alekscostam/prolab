import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import DivContainer from '../DivContainer';

class FooterComponent extends Component {
	constructor(props) {
		super(props);
		this.authService = new AuthService();
	}

	render() {
		if (this.authService.loggedIn()) {
			return (
				<React.Fragment>
					<DivContainer colClass='container footer'>
						<DivContainer colClass='col-12'>
							<DivContainer colClass='row'>
								<div className='col-md-2' tabIndex='0' data-slick-index='0' aria-hidden='false'>
									<a href='https://moyastacja.pl/index-caffe.html' target='_blank' rel='noopener noreferrer' tabIndex='0'>
										<img className='footerLogos__image' src='/images/footer-caffe-moya.png' alt='Caffe moya' />
									</a>
								</div>
								<div className='col-md-2' tabIndex='0' data-slick-index='1' aria-hidden='false'>
									<a href='https://moyastacja.pl/karta-moya-firma.html' target='_blank' rel='noopener noreferrer' tabIndex='0'>
										<img className='footerLogos__image' src='/images/footer-moya-firma.png' alt='Firma' />
									</a>
								</div>
								<div className='col-md-2' tabIndex='0' data-slick-index='2' aria-hidden='false'>
									<a href='https://moyastacja.pl/on-moya-power.html' target='_blank' rel='noopener noreferrer' tabIndex='0'>
										<img className='footerLogos__image' src='/images/footer-on-power-diesel.png' alt='ON Power' />
									</a>
								</div>
								<div className='col-md-2' tabIndex='0' data-slick-index='3' aria-hidden='false'>
									<a href='https://moyastacja.pl/karta-rabatowa.html' target='_blank' rel='noopener noreferrer' tabIndex='0'>
										<img className='footerLogos__image' src='/images/footer-moya-vip.png' alt='Moya VIP' />
									</a>
								</div>
								<div className='col-md-2' tabIndex='0' data-slick-index='4' aria-hidden='false'>
									<a href='https://moyastacja.pl/program-jakosci-paliw-tank-q.html' target='_blank' rel='noopener noreferrer' tabIndex='0'>
										<img className='footerLogos__image' src='/images/footer-tanq.png' alt='TanQ' />
									</a>
								</div>
								<div className='col-md-2' tabIndex='0' data-slick-index='5' aria-hidden='false'>
									<a href='http://www.anwim.pl' target='_blank' rel='noopener noreferrer' tabIndex='0'>
										<img className='footerLogos__image' src='/images/footer-anwim.png' alt='Anwim' />
									</a>
								</div>
							</DivContainer>
							<DivContainer colClass='copyright'>
									<span>Copyright © Anwim realizacja: Primigenius</span>
							</DivContainer>
						</DivContainer>
					</DivContainer>
				</React.Fragment>
			);
		} else {
			return <React.Fragment></React.Fragment>;
		}
	}
}

export default withRouter(FooterComponent);
