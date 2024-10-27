import React from 'react';
import LocUtils from '../../utils/LocUtils';

function Loader(props) {
	return (
		<div id="cover-spin-container">
			<div id="cover-spin" />
			<div id="cover-spin-text">
				<p>{LocUtils.loc(props?.labels, 'Operation_in_progress', 'Operacja w toku, proszę czekać.')}</p>
			</div>
		</div>
	);
}

export default Loader;
