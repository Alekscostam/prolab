import React from 'react';
import LocUtils from '../../utils/LocUtils';

function Loader(props) {
    return (
        <div id='cover-spin-container'>
            <div id='cover-spin' />
            <div id='cover-spin-text'></div>
        </div>
    );
}

export default Loader;
