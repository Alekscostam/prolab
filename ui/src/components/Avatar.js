/* eslint-disable no-script-url */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import Image from "./Image";

export const Avatar = (props) => {
    const {userName, base64, rendered, collapsed} = props;
    const initials = userName.match(/(\b\S)?/g).join("").match(/(^\S|\S$)?/g).join("").toUpperCase();
    if (rendered) {
        return <React.Fragment>
            <div id='avatar' className={collapsed ? 'col-12' : 'col-2'}>
                {base64 ? <Image style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        verticalAlign: 'middle'
                    }} base64={base64}/> :
                    <div className="avatar-circle">
                         <span className="avatar-initials">{initials}</span>
                    </div>}
            </div>
            {collapsed ? null : <div id='user' className={'col-10'}
                                     style={{
                                         display: 'flex',
                                         justifyContent: 'left',
                                         alignItems: 'center'
                                     }}>
                {userName}
            </div>}
        </React.Fragment>;
    } else {
        return null;
    }
};

Avatar.defaultProps = {
    rendered: true,
    collapsed: false
};

Avatar.propTypes = {
    base64: PropTypes.string,
    userName: PropTypes.string,
    rendered: PropTypes.bool,
    collapsed: PropTypes.bool
};

export default Avatar;
