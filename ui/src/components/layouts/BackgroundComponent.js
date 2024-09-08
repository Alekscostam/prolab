import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import AuthService from '../../services/AuthService';

class BackgroundComponent extends Component {
	constructor(props, context) {
		super(props, context);
		this.auth = new AuthService();
		this.loginBackGroundImgSrc = 'images/moya_back.jpg';
	}

	render() {
		const backgroundStyle = {
			backgroundImage: `url(${this.loginBackGroundImgSrc})`,
			backgroundSize: 'cover',
			backgroundRepeat: 'no-repeat',
		};
		let containerClassName = this.auth.isLoggedUser() ? 'container-fluid flex-fill-after-login' : 'container-fluid flex-fill';
		return (
			<React.Fragment>
				<main id='main-login' className={containerClassName} style={backgroundStyle}>
					{this.props.children}
				</main>
			</React.Fragment>
		);
	}
}

export default withRouter(BackgroundComponent);
