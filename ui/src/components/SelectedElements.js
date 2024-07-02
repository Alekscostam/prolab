/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-script-url */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import { StringUtils } from '../utils/StringUtils';

export const SelectedElements = ({selectedRowKeys, totalCounts}) => {
	
	if(selectedRowKeys?.length<1){
		return <div></div>
	}
	const countsWithSlash = StringUtils.isBlank(totalCounts) ? '' : `/${totalCounts}` 
	return <div id='selected-elements-outer'><div id='selected-elements'>{selectedRowKeys.length + countsWithSlash}</div></div> 
};

SelectedElements.defaultProps = {
};

SelectedElements.propTypes = {
};

export default SelectedElements;
