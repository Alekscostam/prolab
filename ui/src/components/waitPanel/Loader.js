import React from 'react';

function Loader() {
	return (
		<div id="cover-spin-container">
			<div id="cover-spin" />
			<div id="cover-spin-text">
				<p>Operacja w toku, proszę czekać.</p>
			</div>
		</div>
	);
}

export default Loader;
