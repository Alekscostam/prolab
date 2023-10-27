import React, {Component} from 'react';
import AuthService from '../../services/AuthService';

class HeaderComponent extends Component {
	constructor(props) {
		super(props);
		this.authService = new AuthService();
		this.state = {
			timer: this.authService.expirationTimer(),
			loggedIn: this.authService.loggedIn(),
		};
	}

	componentDidMount() {
		this.timer = setInterval(() => {
			this.setState({
				timer: this.authService.expirationTimer(),
			});
			if (!this.authService.loggedIn()) {
				if (this.props.logout) {
					this.props.logout();
				} else {
					this.authService.logout();
				}
			}
		}, 1000);
		this.setState({
			loggedIn: this.authService.loggedIn(),
			timer: this.authService.expirationTimer(),
		});
	}

	componentWillUnmount() {
		clearTimeout(this.timer);
	}

	render() {
		return (
			<React.Fragment>
				{this.authService.loggedIn() ? (
					<header className='container-fluid'>
						<div className='container'>
							<div className='row row-eq-height'>
								<img className='header-logo moya-anwim' src={`/images/header_logo.svg`} alt='Logo Anwim' />
								<span className='header-label user-label'>{this.authService.getProfile().sub}</span>
								<div className='session-div'>
									<span className='header-label session-label'>
										Czas do końca sesji <span className='session-time'>{this.state.timer}</span>
									</span>
								</div>
							</div>
						</div>
					</header>
				) : null}
			</React.Fragment>
		);
	}
}

export default HeaderComponent;
