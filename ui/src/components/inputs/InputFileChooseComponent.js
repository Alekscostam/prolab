import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Files from '../base/Files';
import ActionLink from '../ActionLink';
import DownloadContent from '../DownloadContent';
import BaseService from '../../baseContainers/BaseService';

class SystemParameterService extends BaseService {
	constructor(domain, publicMode) {
		super(domain);
		this.path = 'common/parameters';
		this.publicMode = publicMode;
	}

	getValue(code) {
		if (this.publicMode) {
			return this.fetch(`${this.domain}/${this.path}/public/${code}/value`, {
				method: 'GET',
			}).then(res => {
				return Promise.resolve(res);
			});
		} else {
			return this.fetch(`${this.domain}/${this.path}/${code}/value`, {
				method: 'GET',
			}).then(res => {
				return Promise.resolve(res);
			});
		}
	}
}

class InputFileChooseComponent extends Component {
	constructor(props, context) {
		super(props, context);
		this.filesRef = React.createRef();
		this.error = false;
		this.state = { errorMsg: undefined };
		this.systemParameterService = new SystemParameterService(props.baseRestApiUrl, props.publicModeForParams);
	}

	componentDidMount() {
		const { uploadExtParamName, uploadMaxSizeParamName, handleError } = this.props;
		if (uploadExtParamName) {
			this.systemParameterService
				.getValue(uploadExtParamName)
				.then(result => {
					this.setState({
						acceptFromParams: result.value,
					});
				})
				.catch(err => {
					 ConsoleHelper(`can not read system param ${uploadExtParamName}: ${err.message}`);
					if (handleError) {
						handleError(err.message);
					}
				});
		}
		if (uploadMaxSizeParamName) {
			this.systemParameterService
				.getValue(uploadMaxSizeParamName)
				.then(result => {
					this.setState({
						maxFileSizeFromParams: parseInt(result.value),
					});
				})
				.catch(err => {
					 ConsoleHelper(`can not read system param ${uploadMaxSizeParamName}: ${err.message}`);
					if (handleError) {
						handleError(err.message);
					}
				});
		}
	}

	render() {
		const {
			accepts,
			children,
			colClass,
			disabled,
			file,
			fileList,
			id,
			insideTable,
			label,
			maxFileSize,
			maxFiles,
			multiple,
			name,
			onAfterRemove,
			onAfterStateChange,
			onChange,
			publicMode,
			rendered,
			showLabel,
			stateField,
			validator,
			validators,
		} = this.props;
		const { errorMsg } = this.state;
		const { acceptFromParams, maxFileSizeFromParams } = this.state;
		let fileValidators = multiple ? 'array_required' : 'required';
		if (validators) {
			fileValidators = validators;
		}
		const acceptsFinal = acceptFromParams ? acceptFromParams : accepts;
		const maxFileSizeFinal = maxFileSizeFromParams ? maxFileSizeFromParams : maxFileSize;
		if (rendered) {
			return publicMode ? (
				<div className="input_easy_label row pl-0">
					{label !== undefined && showLabel ? (
						<label id={`${id}-label-id`} className="easy_label col-lg-2 col-md-3" htmlFor={id}>
							{label}
						</label>
					) : null}
					<div className="col-md-5">
						<Files
							ariaLabel={label}
							ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
							ariaDescribedBy={`${id}-error`}
							ref={this.filesRef}
							key={id}
							id={id}
							label={label}
							name={name}
							className="files-dropzone-list"
							onChange={e => {
								if (!this.error) {
									if (multiple) {
										onChange('MULTI_FILE_CHOOSE', ['ADD', name], e, onAfterStateChange, stateField);
									} else {
										onChange(
											'SINGLE_FILE_CHOOSE',
											['ADD', name],
											e,
											onAfterStateChange,
											stateField
										);
									}
								}
								this.error = false;
							}}
							onError={e => {
								this.error = true;
								this.setState({ errorMsg: e.message }, () =>
									setTimeout(() => {
										this.error = false;
										this.setState({ errorMsg: undefined });
									}, 15000)
								);
							}}
							accepts={acceptsFinal}
							multiple={multiple}
							maxFiles={maxFiles}
							maxFileSize={maxFileSizeFinal}
							minFileSize={0}
							clickable
							disabled={disabled}
						>
							{children}
						</Files>
						<div className="col-12">
							{multiple ? (
								fileList.map(function(item, i) {
									return (
										<div className="row" key={i}>
											<DownloadContent
												label={item.name}
												key={`${i}-${item.name}-case-download-button`}
												colClass="col-xl-12 col-lg-12 col-md-12 col-sm-12"
												fileName={item.name}
												mode="LINK"
												file={item}
											/>
											<ActionLink
												key={`${id}-${i}-remove-button`}
												className="file-upload-actionlink"
												label=""
												handleClick={e => {
													this.filesRef.current.removeFile(item);
													// eslint-disable-next-line max-len
													onChange(
														'MULTI_FILE_CHOOSE',
														['REMOVE', name, i],
														e,
														undefined,
														stateField
													);
												}}
												params={i}
												iconName="mdi-close-circle-outline"
												iconColor="grey"
												iconSize="m"
												iconSide="left"
											/>
										</div>
									);
								}, this)
							) : file ? (
								<div className="row" key={0}>
									<DownloadContent
										label={file.name}
										key={`${id}-download-button`}
										colClass="col-xl-12 col-lg-12 col-md-12 col-sm-12"
										fileName={file.name}
										mode="LINK"
										file={file}
									/>
									<ActionLink
										key={`${id}-${0}-remove-button`}
										className="file-upload-actionlink"
										label=""
										handleClick={e => {
											this.filesRef.current.removeFile(file);
											// eslint-disable-next-line max-len
											onChange(
												'SINGLE_FILE_CHOOSE',
												['REMOVE', name],
												e,
												onAfterRemove,
												stateField
											);
										}}
										params={0}
										iconName="mdi-close-circle-outline"
										iconColor="grey"
										iconSize="m"
										iconSide="left"
									/>
								</div>
							) : null}
						</div>
						{this.error && errorMsg !== undefined ? (
							<div id={`${id}-error`} className="srv-validation-message">
								{errorMsg}
							</div>
						) : null}
						{validator
							? validator.message(id, label, multiple ? fileList : file, fileValidators)
							: null}
					</div>
				</div>
			) : (
				<div className={insideTable ? '' : colClass}>
					<div className={insideTable ? '' : 'row'}>
						<div className={insideTable ? '' : 'col-md-12 form-group'}>
							{label !== undefined && showLabel ? (
								<label
									id={`${id}-label-id`}
									className="p-label"
									htmlFor={id}
									style={{ width: '100%' }}
								>
									{label}
								</label>
							) : null}
							<Files
								ariaLabel={label}
								ariaLabelledBy={label === undefined && showLabel ? `${id}-label-id` : undefined}
								ariaDescribedBy={`${id}-error`}
								ref={this.filesRef}
								key={id}
								id={id}
								label={label}
								name={name}
								className="files-dropzone-list"
								onChange={e => {
									if (!this.error) {
										if (multiple) {
											onChange(
												'MULTI_FILE_CHOOSE',
												['ADD', name],
												e,
												onAfterStateChange,
												stateField
											);
										} else {
											onChange(
												'SINGLE_FILE_CHOOSE',
												['ADD', name],
												e,
												onAfterStateChange,
												stateField
											);
										}
									}
									this.error = false;
								}}
								onError={e => {
									this.error = true;
									this.setState({ errorMsg: e.message }, () =>
										setTimeout(() => {
											this.error = false;
											this.setState({ errorMsg: undefined });
										}, 15000)
									);
								}}
								accepts={acceptsFinal}
								multiple={multiple}
								maxFiles={maxFiles}
								maxFileSize={maxFileSizeFinal}
								minFileSize={0}
								clickable
								disabled={disabled}
							>
								{children}
							</Files>
							<div className="col-12">
								{multiple ? (
									fileList.map(function(item, i) {
										return (
											<div className="row" key={i}>
												<DownloadContent
													label={item.name}
													key={`${i}-${item.name}-case-download-button`}
													colClass="col-xl-12 col-lg-12 col-md-12 col-sm-12"
													fileName={item.name}
													mode="LINK"
													file={item}
												/>
												<ActionLink
													key={`${id}-${i}-remove-button`}
													className="file-upload-actionlink"
													label=""
													handleClick={e => {
														this.filesRef.current.removeFile(item);
														// eslint-disable-next-line max-len
														onChange(
															'MULTI_FILE_CHOOSE',
															['REMOVE', name, i],
															e,
															undefined,
															stateField
														);
													}}
													params={i}
													iconName="mdi-close-circle-outline"
													iconColor="grey"
													iconSize="m"
													iconSide="left"
												/>
											</div>
										);
									}, this)
								) : file ? (
									<div className="row" key={0}>
										<DownloadContent
											label={file.name}
											key={`${id}-download-button`}
											colClass="col-xl-12 col-lg-12 col-md-12 col-sm-12"
											fileName={file.name}
											mode="LINK"
											file={file}
										/>
										<ActionLink
											key={`${id}-${0}-remove-button`}
											className="file-upload-actionlink"
											label=""
											handleClick={e => {
												this.filesRef.current.removeFile(file);
												// eslint-disable-next-line max-len
												onChange(
													'SINGLE_FILE_CHOOSE',
													['REMOVE', name],
													e,
													onAfterRemove,
													stateField
												);
											}}
											params={0}
											iconName="mdi-close-circle-outline"
											iconColor="grey"
											iconSize="m"
											iconSide="left"
										/>
									</div>
								) : null}
							</div>
							{this.error && errorMsg !== undefined ? (
								<div id={`${id}-error`} className="srv-validation-message">
									{errorMsg}
								</div>
							) : null}
							{validator
								? validator.message(id, label, multiple ? fileList : file, fileValidators)
								: null}
						</div>
					</div>
				</div>
			);
		} else {
			return null;
		}
	}
}

InputFileChooseComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disabled: false,
	insideTable: false,
	maxFileSize: 100000,
	maxFiles: 1,
	multiple: true,
	publicMode: false,
	publicModeForParams: false,
	rendered: true,
	showLabel: true,
	stateField: 'element',
	validateViewMode: false,
};

InputFileChooseComponent.propTypes = {
	accepts: PropTypes.array,
	baseRestApiUrl: PropTypes.string,
	children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
	colClass: PropTypes.string,
	disabled: PropTypes.bool,
	file: PropTypes.object,
	fileList: PropTypes.array,
	handleError: PropTypes.func,
	id: PropTypes.string.isRequired,
	insideTable: PropTypes.bool,
	label: PropTypes.string,
	maxFileSize: PropTypes.number,
	maxFiles: PropTypes.number,
	multiple: PropTypes.bool,
	name: PropTypes.string.isRequired,
	onAfterRemove: PropTypes.func,
	onAfterStateChange: PropTypes.func,
	onChange: PropTypes.func,
	publicMode: PropTypes.bool,
	publicModeForParams: PropTypes.bool,
	rendered: PropTypes.bool,
	showLabel: PropTypes.bool,
	stateField: PropTypes.string,
	uploadExtParamName: PropTypes.string,
	uploadMaxSizeParamName: PropTypes.string,
	uploadedFile: PropTypes.string,
	validateViewMode: PropTypes.bool,
	validator: PropTypes.object,
	validators: PropTypes.string,
};

export default InputFileChooseComponent;
