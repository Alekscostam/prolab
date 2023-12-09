/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import ActionButton from './ActionButton';
import ActionLink from './ActionLink';

class DownloadContent extends React.Component {
	downloadFile() {
		const { content, file, fileName } = this.props;
		if (fileName) {
			let blob;
			if (file) {
				blob = file;
			} else if (content) {
				blob = new Blob([content]);
			}
			if (blob) {
				if (navigator.msSaveBlob) {
					// IE 10+
					navigator.msSaveBlob(blob, fileName);
				} else {
					const link = document.createElement('a');
					// Browsers that support HTML5 download attribute
					if (link.download !== undefined) {
						const url = URL.createObjectURL(blob);
						link.setAttribute('href', url);
						link.setAttribute('download', fileName);
						link.style.visibility = 'hidden';
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
					}
				}
			}
		}
	}

	render() {
		const { disabled, id, label, mode, rendered } = this.props;
		if (rendered) {
			if (mode === 'BUTTON') {
				return (
					<ActionButton
						id={id === undefined ? `download-${label}-btn` : id}
						label={`${label}`}
						key={`download-${label}`}
						className="p-link"
						disabled={disabled}
						variant="accent"
						handleClick={e => {
							e.preventDefault();
							this.downloadFile();
						}}
						downloadFile
					/>
				);
			} else if (mode === 'LINK') {
				return (
					<ActionLink
						id={id === undefined ? `download-${label}-btn` : id}
						label={`${label}`}
						key={`download-${label}`}
						className="p-link"
						disabled={disabled}
						variant="accent"
						handleClick={e => {
							e.preventDefault();
							this.downloadFile();
						}}
						downloadFile
					/>
				);
			} else {
				return null;
			}
		} else {
			return null;
		}
	}
}

DownloadContent.defaultProps = {
	rendered: true,
	disabled: false,
	mode: 'BUTTON',
	params: {},
};

DownloadContent.propTypes = {
	className: PropTypes.string,
	content: PropTypes.instanceOf(ArrayBuffer),
	disabled: PropTypes.bool,
	file: PropTypes.instanceOf(File),
	fileName: PropTypes.string.isRequired,
	id: PropTypes.string,
	label: PropTypes.string.isRequired,
	mode: PropTypes.string.isRequired,
	rendered: PropTypes.bool,
};

export default DownloadContent;
