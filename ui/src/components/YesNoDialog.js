import React from 'react';
import PropTypes from 'prop-types';
import {Dialog} from 'primereact/dialog';
import ActionButton from './ActionButton';

export const YesNoDialog = (props) => {
	const { children, className, header, id, key, name, noButtonClassName, noButtonLabel, noButtonVariant, onAfterNoStateChange, onAfterYesStateChange, onChange, onHide, stateField, visible, yesButtonClassName, yesButtonLabel, yesButtonVariant , singleButton} = props;
	return (
		<Dialog ariaCloseIconLabel='Zamknij okno dialogowe' header={header} visible={visible} className={className} style={{ width: '30vw' }} key={`${key ? key : id ? id : name}-dialog`} onHide={() => (onHide ? onHide() : null)}>
			<div style={{ marginBottom: '20px' }} className='row col-12'>
				{children ? children : 'Czy jesteś pewien?'}
			</div>
			<div className='row col-12'>
				<ActionButton
					label={yesButtonLabel}
					variant={yesButtonVariant}
					className={yesButtonClassName}
					handleClick={() => (onChange ? onChange('YES_NO_DIALOG', undefined, { name, value: true }, onAfterYesStateChange, stateField) : null)}
					key={`${key ? key : id ? id : name}-yes-button`}
				/>
				{!singleButton ? <ActionButton
					label={noButtonLabel}
					variant={noButtonVariant}
					className={'ml-2 ' + noButtonClassName}
					handleClick={() => (onChange ? onChange('YES_NO_DIALOG', undefined, { name, value: false }, onAfterNoStateChange, stateField) : null)}
					key={`${key ? key : id ? id : name}-no-button`}
				/> : null }
				
			</div>
		</Dialog>
	);
};

YesNoDialog.defaultProps = {
	noButtonVariant: 'accent',
	noButtonLabel: 'Nie',
	stateField: 'element',
	yesButtonVariant: 'dark',
	yesButtonLabel: 'Tak',
	singleButton: false
};

YesNoDialog.propTypes = {
	children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
	className: PropTypes.string,
	header: PropTypes.string.isRequired,
	id: PropTypes.string,
	key: PropTypes.string,
	name: PropTypes.string.isRequired,
	noButtonClassName: PropTypes.string,
	noButtonLabel: PropTypes.string,
	noButtonVariant: PropTypes.string,
	onAfterNoStateChange: PropTypes.func,
	onAfterYesStateChange: PropTypes.func,
	onChange: PropTypes.func.isRequired,
	onHide: PropTypes.func,
	stateField: PropTypes.string,
	visible: PropTypes.bool.isRequired,
	yesButtonClassName: PropTypes.string,
	yesButtonLabel: PropTypes.string,
	yesButtonVariant: PropTypes.string,
	singleButton: PropTypes.bool
};

export default YesNoDialog;