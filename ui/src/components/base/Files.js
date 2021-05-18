import React from 'react';
import PropTypes from 'prop-types';

const mimeTypeRegexp = /^(application|audio|example|image|message|model|multipart|text|video)\/[a-z0-9\.\+\*-]+$/;
const extRegexp = /\.[a-zA-Z0-9]*$/;

class Files extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.handleDrop = this.handleDrop.bind(this);
		this.handleDragEnter = this.handleDragEnter.bind(this);
		this.handleDragLeave = this.handleDragLeave.bind(this);
		this.openFileChooser = this.openFileChooser.bind(this);

		this.id = 1;

		this.state = {
			files: [],
		};
	}

	handleDrop(event) {
		const { maxFiles, multiple, onChange } = this.props;
		const { files } = this.state;
		event.preventDefault();
		this.handleDragLeave(event);

		// Collect added files, perform checking, cast pseudo-array to Array,
		// then return to method
		let filesAdded = event.dataTransfer ? event.dataTransfer.files : event.target.files;

		// Multiple files dropped when not allowed
		if (multiple === false && filesAdded.length > 1) {
			filesAdded = [filesAdded[0]];
		}

		const filesArray = [];
		for (let i = 0; i < filesAdded.length; i++) {
			const file = filesAdded[i];

			// Assign file an id
			file.id = `files-${this.id++}`;

			// Tell file it's own extension
			file.extension = this.fileExtension(file);

			// Tell file it's own readable size
			file.sizeReadable = this.fileSizeReadable(file.size);

			// Add preview, either image or file extension
			if (file.type && this.mimeTypeLeft(file.type) === 'image') {
				file.preview = {
					type: 'image',
					url: window.URL.createObjectURL(file),
				};
			} else {
				file.preview = {
					type: 'file',
				};
			}

			// Check for file max limit
			if (files.length + filesArray.length >= maxFiles) {
				//	filesArray = files;
				this.handleError(
					{
						code: 4,
						message: 'Osiągnięto maksymalną dopuszczalną liczbę przesłanych plików',
					},
					file
				);
				break;
			}

			// If file is acceptable, push or replace
			if (this.fileTypeAcceptable(file) && this.fileSizeAcceptable(file)) {
				filesArray.push(file);
			}
		}
		this.setState(
			{
				files:
					multiple === false
						? filesArray.length > 0
							? filesArray
							: files
						: [...files, ...filesArray],
			},
			() => {
				if (filesArray !== undefined && filesArray !== null && filesArray.length > 0) {
					const { files } = this.state;
					onChange(files);
				}
			}
		);
	}

	handleDragOver(event) {
		event.preventDefault();
		event.stopPropagation();
	}

	handleDragEnter() {
		const { dropActiveClassName } = this.props;
		const el = this.dropzone;
		el.className += ` ${dropActiveClassName}`;
	}

	handleDragLeave() {
		const { dropActiveClassName } = this.props;
		const el = this.dropzone;
		this.dropzone.className = el.className.replace(` ${dropActiveClassName}`, '');
	}

	openFileChooser() {
		this.inputElement.value = null;
		this.inputElement.click();
	}

	fileTypeAcceptable(file) {
		const { accepts } = this.props;
		if (!accepts) {
			return true;
		}

		const result = accepts.some(accept => {
			if (file.type && accept.match(mimeTypeRegexp)) {
				const typeLeft = this.mimeTypeLeft(file.type);
				const typeRight = this.mimeTypeRight(file.type);
				const acceptLeft = accept.split('/')[0];
				const acceptRight = accept.split('/')[1];
				if (acceptLeft && acceptRight) {
					if (acceptLeft === typeLeft && acceptRight === '*') {
						return true;
					}
					if (acceptLeft === typeLeft && acceptRight === typeRight) {
						return true;
					}
				}
			} else if (file.extension && accept.match(extRegexp)) {
				const ext = accept.substr(1);
				return file.extension.toLowerCase() === ext.toLowerCase();
			}
			return false;
		});

		if (!result) {
			this.handleError(
				{
					code: 1,
					message: `${file.name}: plik nie jest wymaganego typu(${accepts}).`,
				},
				file
			);
		}

		return result;
	}

	fileSizeAcceptable(file) {
		const { maxFileSize, minFileSize } = this.props;
		if (file.size > maxFileSize) {
			let maxFileSizeMessage = '';
			if (maxFileSize >= 1000000000) {
				maxFileSizeMessage = `${(maxFileSize / 1000000000).toFixed(2)} GB`;
			} else if (maxFileSize >= 1000000) {
				maxFileSizeMessage = `${(maxFileSize / 1000000).toFixed(2)} MB`;
			} else if (maxFileSize >= 1000) {
				maxFileSizeMessage = `${(maxFileSize / 1000).toFixed(2)} KB`;
			} else {
				maxFileSizeMessage = `${maxFileSize} B`;
			}
			this.handleError(
				{
					code: 2,
					message: `${
						file.name
					}: Niedopuszczalny rozmiar pliku, maksymalny rozmiar pliku to ${maxFileSizeMessage}.`,
				},
				file
			);
			return false;
		} else if (file.size < minFileSize) {
			this.handleError(
				{
					code: 3,
					message: `${file.name}: plik jest za mały.`,
				},
				file
			);
			return false;
		} else {
			return true;
		}
	}

	mimeTypeLeft(mime) {
		return mime.split('/')[0];
	}

	mimeTypeRight(mime) {
		return mime.split('/')[1];
	}

	fileExtension(file) {
		const extensionSplit = file.name.split('.');
		if (extensionSplit.length > 1) {
			return extensionSplit[extensionSplit.length - 1];
		} else {
			return 'none';
		}
	}

	fileSizeReadable(size) {
		if (size >= 1000000000) {
			return `${Math.ceil(size / 1000000000)}GB`;
		} else if (size >= 1000000) {
			return `${Math.ceil(size / 1000000)}MB`;
		} else if (size >= 1000) {
			return `${Math.ceil(size / 1000)}kB`;
		} else {
			return `${Math.ceil(size)}B`;
		}
	}

	handleError(error, file) {
		const { onError } = this.props;
		onError(error, file);
	}

	removeFile(fileToRemove) {
		const { onChange } = this.props;
		const { files } = this.state;
		this.setState(
			{
				files: files.filter(file => file.id !== fileToRemove.id),
			},
			() => {
				const { files } = this.state;
				onChange(files);
			}
		);
	}

	removeFiles() {
		const { onChange } = this.props;
		const { files } = this.state;
		this.setState(
			{
				files: [],
			},
			() => {
				onChange(files);
			}
		);
	}

	render() {
		const {
			ariaLabel,
			ariaLabelledBy,
			ariaDescribedBy,
			accepts,
			children,
			className,
			clickable,
			id,
			multiple,
			name,
			style,
		} = this.props;
		const inputAttributes = {
			type: 'file',
			id,
			accept: accepts ? accepts.join() : '',
			multiple,
			name,
			style: { display: 'none' },
			ref: element => {
				this.inputElement = element;
			},
			onChange: this.handleDrop,
			tabIndex: 0,
		};

		return (
			<div>
				<input
					{...inputAttributes}
					aria-label={ariaLabel}
					aria-labelledby={ariaLabelledBy}
					aria-describedby={ariaDescribedBy}
				/>
				<div
					title={`${ariaLabel} kliknij "Enter" aby wybrać plik do przesłania`}
					onKeyDown={e => {
						if (e.key === 'Enter') {
							e.preventDefault();
							if (clickable === true) {
								this.openFileChooser();
							}
						}
					}}
					tabIndex="0"
					className={className}
					onClick={clickable === true ? this.openFileChooser : null}
					onDrop={this.handleDrop}
					onDragOver={this.handleDragOver}
					onDragEnter={this.handleDragEnter}
					onDragLeave={this.handleDragLeave}
					ref={dropzone => {
						this.dropzone = dropzone;
					}}
					style={style}
				>
					{children}
				</div>
			</div>
		);
	}
}

Files.propTypes = {
	accepts: PropTypes.array,
	ariaDescribedBy: PropTypes.string,
	ariaLabel: PropTypes.string,
	ariaLabelledBy: PropTypes.string,
	children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
	className: PropTypes.string.isRequired,
	clickable: PropTypes.bool,
	dropActiveClassName: PropTypes.string,
	id: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	maxFileSize: PropTypes.number,
	maxFiles: PropTypes.number,
	minFileSize: PropTypes.number,
	multiple: PropTypes.bool,
	name: PropTypes.string,
	onChange: PropTypes.func,
	onError: PropTypes.func,
	style: PropTypes.object,
};

Files.defaultProps = {
	onChange(files) {
		console.log(files);
	},
	onError(error) {
		console.log(`error code ${error.code}: ${error.message}`);
	},
	className: 'files-dropzone',
	dropActiveClassName: 'files-dropzone-active',
	accepts: null,
	multiple: true,
	maxFiles: Infinity,
	maxFileSize: Infinity,
	minFileSize: 0,
	name: 'file',
	clickable: true,
};

export default Files;
