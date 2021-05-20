import React from 'react';
import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';

export const CustomDialog = props => {
	const { children, className, header, id, modal, name, onHide, rendered, visible } = props;
	return rendered && visible ? (
		<Dialog
			id={id ? id : name}
			key={`${id ? id : name}-dialog`}
			ariaCloseIconLabel="Zamknij okno dialogowe"
			header={header}
			visible={visible}
			className={className}
			modal={visible && modal}
			onHide={() => (onHide ? onHide() : null)}
		>
			{children}
		</Dialog>
	) : null;
};

CustomDialog.defaultProps = {
	modal: false,
	rendered: true,
};

CustomDialog.propTypes = {
	children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
	className: PropTypes.string,
	header: PropTypes.string.isRequired,
	id: PropTypes.string,
	modal: PropTypes.bool,
	name: PropTypes.string.isRequired,
	onHide: PropTypes.func.isRequired,
	rendered: PropTypes.bool,
	visible: PropTypes.bool.isRequired,
};

export default CustomDialog;
