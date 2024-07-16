import React from 'react';
import { StringUtils } from '../utils/StringUtils';

export const SelectedElements = ({selectedRowKeys, totalCounts}) => {
	if(StringUtils.isBlank(selectedRowKeys)){
	   return <div></div>
	}
	let length = selectedRowKeys.length;
	if(StringUtils.isBlank(totalCounts)){
		return <div></div>
	}
	return <div id='selected-elements-outer'><div id='selected-elements'>{length + `/${totalCounts}`}</div></div> 
};

SelectedElements.defaultProps = {
};

SelectedElements.propTypes = {
};

export default SelectedElements;
