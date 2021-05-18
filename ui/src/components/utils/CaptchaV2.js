import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Captcha } from 'primereact/captcha';
import SettingService from './../../services/SettingService';

export class CaptchaV2 extends Component {

	constructor(props) {
		super(props);
		this.settingService = new SettingService()
		this.state = {
			siteKey: "",
			loadingDone: false
		}
	}

	componentDidMount() {
		this.settingService
			.getCaptchaPublic()
			.then((resp) => {
				this.setState({
					siteKey: resp.value,
					loadingDone: true
				})
			}).catch((err) => console.error("Error get site code for captcha ! Exception = ", err));
	}

	render() {
		return (
			<div>
				{this.state.loadingDone ?
					<React.Fragment>
						<Captcha
							language={this.props.language}
							onResponse={this.props.handleOnSuccess}
							onExpire={this.props.handleOnExpire}
							siteKey={this.state.siteKey} ></Captcha>
					</React.Fragment> :
					<React.Fragment />}
			</div>)
	}
}

CaptchaV2.defaultProps = {
	language: "PL",
	theme: "light",
	type: "image",
	size: "normal",
};

CaptchaV2.propTypes = {
	language: PropTypes.string,
	theme: PropTypes.string,
	type: PropTypes.string,
	size: PropTypes.string,
	handleOnSuccess: PropTypes.func.isRequired,
	handleOnExpire: PropTypes.func,
};

export default CaptchaV2;