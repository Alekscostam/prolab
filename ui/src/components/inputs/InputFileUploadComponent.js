import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ProgressBar } from 'primereact/progressbar';
import { Dialog } from 'primereact/dialog';
import ActionLink from '../ActionLink';
import { FileUpload } from 'primereact/fileupload';
import BaseService from '../../services/BaseService';
import AttachmentService from '../../services/AttachmentService';
import { saveAs } from 'file-saver';

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
			}).then((res) => {
				return Promise.resolve(res);
			});
		} else {
			return this.fetch(`${this.domain}/${this.path}/${code}/value`, {
				method: 'GET',
			}).then((res) => {
				return Promise.resolve(res);
			});
		}
	}
}

class InputFileUploadComponent extends Component {
	constructor(props, context) {
		super(props, context);
		this.downloadFile = this.downloadFile.bind(this);
		this.state = { visible: false, progress: 0 };
		const baseUrl = props.restApiUrl.substring(0, props.restApiUrl.indexOf('o/rest-api/') + 10);
		this.systemParameterService = new SystemParameterService(baseUrl, props.publicMode);
		this.attachmentService = new AttachmentService();
		this.handleBeforeUpload = this.handleBeforeUpload.bind(this);
		this.fileUploader = this.fileUploader.bind(this);
	}

	componentDidMount() {
		const { uploadExtParamName, uploadMaxSizeParamName, handleError } = this.props;
		if (uploadExtParamName) {
			this.systemParameterService
				.getValue(uploadExtParamName)
				.then((result) => {
					this.setState({
						acceptFromParams: result.value,
					});
				})
				.catch((err) => {
					console.log(`can not read system param ${uploadExtParamName}: ${err.message}`);
					if (handleError) {
						handleError(err.message);
					}
				});
		}
		if (uploadMaxSizeParamName) {
			this.systemParameterService
				.getValue(uploadMaxSizeParamName)
				.then((result) => {
					this.setState({
						maxFileSizeFromParams: parseInt(result.value),
					});
				})
				.catch((err) => {
					console.log(`can not read system param ${uploadMaxSizeParamName}: ${err.message}`);
					if (handleError) {
						handleError(err.message);
					}
				});
		}
	}

	downloadFile(fileName, originalFileName) {
		this.attachmentService
			.download(fileName)
			.then((response) => {
				saveAs(response, originalFileName);
				// return response.blob();
			})
			.catch((err) => {
				this.props.handleError(err.message);
			});
	}

	handleBeforeUpload(e, maxFileCountExceeded) {
		const xhr = e.xhr;
		e.xhr.onloadstart = () => {
			if (maxFileCountExceeded === true) {
				xhr.abort();
			}
		};
		this.setState({ visible: true });
	}
	handleBeforeSend(e){
		const xhr = e.xhr;
		xhr.setRequestHeader('Authorization', this.props.token);
	}

	renderView() {
		const {
			colClass,
			file,
			fileList,
			id,
			insideTable,
			itemLabel,
			itemName,
			label,
			multiple,
			publicMode,
			showLabel,
			validateViewMode,
			validator,
			validators,
		} = this.props;
		let fileValidators = multiple ? 'array_required' : 'required';
		if (validators) {
			fileValidators = validators;
		}
		return publicMode ? (
			<div className='input_easy_label row pl-0'>
				{label !== undefined && showLabel ? (
					<label id={`${id}-label-id`} className='easy_label col-lg-2 col-md-3' htmlFor={id}>
						{label}
					</label>
				) : null}
				<div className='col-md-5'>
					<div className='row'>
						<div aria-label={label} aria-labelledby={`${id}-label-id`} className='col-12'>
							{multiple ? (
								fileList.map(function (item, i) {
									return (
										<div className='row' key={i}>
											<ActionLink
												variant='accent'
												label={item[itemLabel]}
												handleClick={(e) => {
													e.preventDefault();
													this.downloadFile(item[itemName], item[itemLabel]);
												}}
												key={`${id}-${i}-download-button`}
												className='p-link file'
												iconName='mdi-file'
												iconColor='accent'
												iconSize='xs'
												iconSide='left'
												downloadFile
											/>
										</div>
									);
								}, this)
							) : file ? (
								<div className='row' key={0}>
									<ActionLink
										variant='accent'
										label={file[itemLabel]}
										handleClick={(e) => {
											e.preventDefault();
											this.downloadFile(file[itemName], file[itemLabel]);
										}}
										className='p-link file'
										key='download-button'
										iconName='mdi-file'
										iconColor='accent'
										iconSize='xs'
										iconSide='left'
										downloadFile
									/>
								</div>
							) : null}
						</div>
						{validateViewMode && validator ? validator.message(id, label, multiple ? fileList : file, fileValidators) : null}
					</div>
				</div>
			</div>
		) : (
			<div className={insideTable ? '' : colClass}>
				<div className={insideTable ? '' : 'row'}>
					<div className={insideTable ? '' : 'col-md-12 form-group'}>
						{label !== undefined && showLabel ? (
							<label id={`${id}-label-id`} className='p-label' htmlFor={id} style={{ width: '100%' }}>
								{label}
							</label>
						) : null}
						<div aria-label={label} aria-labelledby={`${id}-label-id`} className='col-12'>
							{multiple ? (
								fileList.map(function (item, i) {
									return (
										<div className='row' key={i}>
											<ActionLink
												variant='accent'
												label={item[itemLabel]}
												handleClick={(e) => {
													e.preventDefault();
													this.downloadFile(item[itemName],item[itemLabel]);
												}}
												key={`${id}-${i}-download-button`}
												className='p-link file'
												iconName='mdi-file'
												iconColor='accent'
												iconSize='xs'
												iconSide='left'
												downloadFile
											/>
										</div>
									);
								}, this)
							) : file ? (
								<div className='row' key={0}>
									<ActionLink
										variant='accent'
										label={file[itemLabel]}
										handleClick={(e) => {
											e.preventDefault();
											this.downloadFile(file[itemName], file[itemLabel]);
										}}
										className='p-link file'
										key='download-button'
										iconName='mdi-file'
										iconColor='accent'
										iconSize='xs'
										iconSide='left'
										downloadFile
									/>
								</div>
							) : null}
						</div>
						{validateViewMode && validator ? validator.message(id, label, multiple ? fileList : file, fileValidators) : null}
					</div>
				</div>
			</div>
		);
	}

	handleUploadError(e) {
		this.setState({ visible: false });
		const { handleError } = this.props;
		let errMsg = e.message;
		if (e.xhr && e.xhr.response && typeof e.xhr.response == 'string') {
			const errObj = JSON.parse(e.xhr.response);
			if (errObj && errObj.message) {
				errMsg = errObj.message;
			}
		}
		if (handleError) {
			handleError(errMsg);
		}
		console.log(`can not upload file(s), err: ${errMsg}`);
	}

	fileUploader(event) {
		const { handleUpload, multiple, name, onAfterStateChange, onChange, stateField } = this.props;
		event.files.forEach((element) => {
			this.attachmentService
				.upload(element)
				.then((res) => {
					// if (handleUpload) {
					// 	handleUpload(event, name);
					// } else if (multiple) {
					// 	onChange('MULTI_FILE_UPLOAD', ['ADD', name], event, onAfterStateChange, stateField);
					// } else {
					// 	onChange('SINGLE_FILE_UPLOAD', ['ADD', name], event, onAfterStateChange, stateField);
					// }
					this.setState({ visible: false });
				})
				.catch((e) => {
					this.handleUploadError(e);
				});
		});
	}

	renderEdit() {
		return this.renderNew();
	}

	renderNew() {
		const {
			colClass,
			customHeaders,
			disabled,
			file,
			fileList,
			handleRemove,
			handleUpload,
			id,
			insideTable,
			itemLabel,
			itemName,
			label,
			maxFileCount,
			maxFileSize,
			accept,
			messages,
			multiple,
			name,
			onAfterStateChange,
			onChange,
			publicMode,
			restApiUrl,
			showLabel,
			stateField,
			validator,
			validators,
			uploadExtParamName,
			uploadMaxSizeParamName,
			restrictExt,
			onFileCountExceeded,
		} = this.props;
		const { acceptFromParams, maxFileSizeFromParams } = this.state;
		const { progress, visible } = this.state;
		let fileValidators = multiple ? 'array_required' : 'required';
		if (validators) {
			fileValidators = validators;
		}
		const acceptFinal = acceptFromParams ? acceptFromParams : accept;
		const maxFileSizeFinal = maxFileSizeFromParams ? maxFileSizeFromParams : maxFileSize;
		let uploadUrl = restApiUrl;
		let paramAdded = false;
		if (uploadExtParamName && restrictExt === true) {
			uploadUrl += `?ext=${uploadExtParamName}`;
			paramAdded = true;
		}
		if (uploadMaxSizeParamName) {
			if (paramAdded) {
				uploadUrl += '&';
			} else {
				uploadUrl += '?';
			}
			uploadUrl += `max=${uploadMaxSizeParamName}`;
		}
		let maxFileCountExceeded = false;
		return publicMode ? (
			<div className='input_easy_label row pl-0'>
				<Dialog
					ariaCloseIconLabel='Zamknij okno dialogowe'
					key={`${id}-dialog`}
					visible={visible}
					style={{ width: '100vw', height: '100vh' }}
					modal
					closable={false}
					header={null}
					className='file-upload-dialog'
					onHide={() => this.setState({ visible: false })}>
					<ProgressSpinner className='file-upload-spinner' />
					<ProgressBar className='file-upload-bar' value={progress} showValue unit='%' mode='determinate' />
				</Dialog>
				{label !== undefined && showLabel ? <span className='easy_label col-lg-2 col-md-3'>{label}</span> : null}
				<div className='col-md-5'>
					<FileUpload
						ariaLabel={`${label} przeglądaj pliki`}
						ariaDescribedBy={`${id}-error`}
						key={id}
						id={id}
						mode='advanced'
						name={name}
						multiple={multiple}
						url={uploadUrl}
						maxFileSize={maxFileSizeFinal}
						accept={acceptFinal}
						onUpload={(e) => {
							if (handleUpload) {
								handleUpload(e, name);
							} else if (multiple) {
								onChange('MULTI_FILE_UPLOAD', ['ADD', name], e, onAfterStateChange, stateField);
							} else {
								onChange('SINGLE_FILE_UPLOAD', ['ADD', name], e, onAfterStateChange, stateField);
							}
							this.setState({ visible: false });
						}}
						auto
						onError={this.handleUploadError.bind(this)}
						onProgress={(e) => {
							const progress = Math.round((100 * e.originalEvent.loaded) / e.originalEvent.total);
							this.setState({ progress });
						}}
						onBeforeUpload={(e) => this.handleBeforeUpload(e, maxFileCountExceeded)}
						onBeforeSend={(e) => this.handleBeforeSend(e)}
						chooseLabel='Przeglądaj'
						invalidFileSizeMessageSummary='{0}: Niedopuszczalny rozmiar pliku, '
						invalidFileSizeMessageDetail='maksymalny rozmiar pliku to {0}.'
						disabled={disabled || (fileList && fileList.length > maxFileCount)}
						className='public'
						onSelect={(e) => {
							maxFileCountExceeded = false;
							if (fileList.length + e.files.length > maxFileCount) {
								console.log('file count exceeded...');
								maxFileCountExceeded = true;
								if (onFileCountExceeded) {
									onFileCountExceeded(maxFileCount);
								}
							}
						}}
						messages={messages}
						customHeaders={customHeaders}
						// customUpload
						// uploadHandler={this.fileUploader}
					/>
					<div className='col-12'>
						{multiple ? (
							fileList.map(function (item, i) {
								return (
									<div className='row file-uploaded' key={i}>
										<ActionLink
											variant='accent'
											label={item[itemLabel]}
											handleClick={(e) => {
												e.preventDefault();
												this.downloadFile(item[itemName],item[itemLabel]);
											}}
											key={`${id}-${i}-download-button`}
											className='p-link file'
											iconName='mdi-file'
											iconColor='accent'
											iconSize='xs'
											iconSide='left'
											downloadFile
										/>
										<ActionLink
											key={`${id}-${i}-remove-button`}
											className='file-upload-actionlink'
											label=''
											handleClick={(e) => {
												if (handleRemove) {
													handleRemove(e, i);
												} else {
													// eslint-disable-next-line max-len
													onChange('MULTI_FILE_UPLOAD', ['REMOVE', name, i], e, undefined, stateField);
												}
											}}
											params={i}
											iconName='mdi-close-circle-outline'
											iconColor='grey'
											iconSize='m'
											iconSide='left'
										/>
									</div>
								);
							}, this)
						) : file ? (
							<div className='row' key={0}>
								<ActionLink
									variant='accent'
									label={file[itemLabel]}
									handleClick={(e) => {
										e.preventDefault();
										this.downloadFile(file[itemName], file[itemLabel]);
									}}
									className='p-link file'
									key={`${id}-download-button`}
									iconName='mdi-file'
									iconColor='accent'
									iconSize='xs'
									iconSide='left'
									downloadFile
								/>
								<ActionLink
									key={`${id}-${0}-remove-button`}
									className='file-upload-actionlink'
									label=''
									handleClick={(e) => {
										if (handleRemove) {
											handleRemove(e, 0);
										} else {
											// eslint-disable-next-line max-len
											onChange('SINGLE_FILE_UPLOAD', ['REMOVE', name], e, undefined, stateField);
										}
									}}
									params={0}
									iconName='mdi-close-circle-outline'
									iconColor='grey'
									iconSize='m'
									iconSide='left'
								/>
							</div>
						) : null}
					</div>
					{validator ? validator.message(id, label, multiple ? fileList : file, fileValidators) : null}
				</div>
			</div>
		) : (
			<div className={insideTable ? '' : colClass}>
				<Dialog
					ariaCloseIconLabel='Zamknij okno dialogowe'
					key={`${id}-dialog`}
					visible={visible}
					style={{ width: '100vw', height: '100vh' }}
					modal
					closable={false}
					header={null}
					className='file-upload-dialog'
					onHide={() => this.setState({ visible: false })}>
					<ProgressSpinner className='file-upload-spinner' />
					<ProgressBar className='file-upload-bar' value={progress} showValue unit='%' mode='determinate' />
				</Dialog>
				<div className={insideTable ? '' : 'row'}>
					<div className={insideTable ? '' : 'col-md-12 form-group'}>
						{label !== undefined && showLabel ? (
							<span className='p-label' style={{ width: '100%' }}>
								{label}
							</span>
						) : null}
						<FileUpload
							ariaLabel={`${label} przeglądaj pliki`}
							ariaDescribedBy={`${id}-error`}
							key={id}
							id={id}
							mode='advanced'
							name={name}
							multiple={multiple}
							url={uploadUrl}
							maxFileSize={maxFileSizeFinal}
							accept={acceptFinal}
							onUpload={(e) => {
								if (handleUpload) {
									handleUpload(e, name);
								} else if (multiple) {
									onChange('MULTI_FILE_UPLOAD', ['ADD', name], e, onAfterStateChange, stateField);
								} else {
									onChange('SINGLE_FILE_UPLOAD', ['ADD', name], e, onAfterStateChange, stateField);
								}
								this.setState({ visible: false });
							}}
							auto
							onError={this.handleUploadError.bind(this)}
							onProgress={(e) => {
								const progress = Math.round((100 * e.originalEvent.loaded) / e.originalEvent.total);
								this.setState({ progress });
							}}
							onBeforeUpload={(e) => this.handleBeforeUpload(e, maxFileCountExceeded)}
							onBeforeSend={(e) => this.handleBeforeSend(e)}
							chooseLabel='Przeglądaj'
							invalidFileSizeMessageSummary='{0}: Niedopuszczalny rozmiar pliku, '
							invalidFileSizeMessageDetail='maksymalny rozmiar pliku to {0}.'
							disabled={disabled || (fileList && fileList.length > maxFileCount)}
							onSelect={(e) => {
								maxFileCountExceeded = false;
								if (fileList.length + e.files.length > maxFileCount) {
									console.log('file count exceeded...');
									maxFileCountExceeded = true;
									if (onFileCountExceeded) {
										onFileCountExceeded(maxFileCount);
									}
								}
							}}
							messages={messages}
							customHeaders={customHeaders}
							// customUpload
							// uploadHandler={this.fileUploader}
						/>
						<div className='col-12'>
							{multiple ? (
								fileList.map(function (item, i) {
									return (
										<div className='row file-uploaded' key={i}>
											<ActionLink
												variant='accent'
												label={item[itemLabel]}
												handleClick={(e) => {
													e.preventDefault();
													this.downloadFile(item[itemName],item[itemLabel]);
												}}
												key={`${id}-${i}-download-button`}
												className='p-link file'
												iconName='mdi-file'
												iconColor='accent'
												iconSize='xs'
												iconSide='left'
												downloadFile
											/>
											<ActionLink
												key={`${id}-${i}-remove-button`}
												className='file-upload-actionlink'
												label=''
												handleClick={(e) => {
													if (handleRemove) {
														handleRemove(e, i);
													} else {
														// eslint-disable-next-line max-len
														onChange('MULTI_FILE_UPLOAD', ['REMOVE', name, i], e, undefined, stateField);
													}
												}}
												params={i}
												iconName='mdi-close-circle-outline'
												iconColor='grey'
												iconSize='m'
												iconSide='left'
											/>
										</div>
									);
								}, this)
							) : file ? (
								<div className='row' key={0}>
									<ActionLink
										variant='accent'
										label={file[itemLabel]}
										handleClick={(e) => {
											e.preventDefault();
											this.downloadFile(file[itemName], file[itemLabel]);
										}}
										className='p-link file'
										key={`${id}-download-button`}
										iconName='mdi-file'
										iconColor='accent'
										iconSize='xs'
										iconSide='left'
										downloadFile
									/>
									<ActionLink
										key={`${id}-${0}-remove-button`}
										className='file-upload-actionlink'
										label=''
										handleClick={(e) => {
											if (handleRemove) {
												handleRemove(e, 0);
											} else {
												// eslint-disable-next-line max-len
												onChange('SINGLE_FILE_UPLOAD', ['REMOVE', name], e, undefined, stateField);
											}
										}}
										params={0}
										iconName='mdi-close-circle-outline'
										iconColor='grey'
										iconSize='m'
										iconSide='left'
									/>
								</div>
							) : null}
						</div>
						{validator ? validator.message(id, label, multiple ? fileList : file, fileValidators) : null}
					</div>
				</div>
			</div>
		);
	}

	render() {
		const { rendered, viewMode } = this.props;
		if (rendered) {
			switch (viewMode) {
				case 'NEW':
					return this.renderNew();
				case 'EDIT':
					return this.renderEdit();
				case 'VIEW':
				default:
					return this.renderView();
			}
		} else {
			return null;
		}
	}
}

InputFileUploadComponent.defaultProps = {
	colClass: 'col-xl-4 col-lg-6 col-md-6 col-sm-12',
	disabled: false,
	insideTable: false,
	itemLabel: 'originalFileName',
	itemName: 'fileName',
	maxFileCount: 15,
	maxFileSize: 100000,
	multiple: true,
	publicMode: false,
	rendered: true,
	showLabel: true,
	stateField: 'element',
	validateViewMode: false,
	viewMode: 'VIEW',
	restrictExt: false,
};

InputFileUploadComponent.propTypes = {
	accept: PropTypes.string,
	colClass: PropTypes.string,
	customHeaders: PropTypes.object,
	disabled: PropTypes.bool,
	file: PropTypes.object,
	fileList: PropTypes.array,
	handleError: PropTypes.func,
	handleRemove: PropTypes.func,
	handleUpload: PropTypes.func,
	id: PropTypes.string.isRequired,
	insideTable: PropTypes.bool,
	itemLabel: PropTypes.string,
	itemName: PropTypes.string,
	label: PropTypes.string.isRequired,
	maxFileCount: PropTypes.number,
	maxFileSize: PropTypes.number,
	messages: PropTypes.any,
	multiple: PropTypes.bool,
	name: PropTypes.string.isRequired,
	onAfterStateChange: PropTypes.func,
	onChange: PropTypes.func,
	onFileCountExceeded: PropTypes.func,
	publicMode: PropTypes.bool,
	rendered: PropTypes.bool,
	restApiUrl: PropTypes.string.isRequired,
	restrictExt: PropTypes.bool,
	showLabel: PropTypes.bool,
	stateField: PropTypes.string,
	uploadExtParamName: PropTypes.string,
	uploadMaxSizeParamName: PropTypes.string,
	validateViewMode: PropTypes.bool,
	validator: PropTypes.object,
	validators: PropTypes.string,
	viewMode: PropTypes.string,
};

export default InputFileUploadComponent;
