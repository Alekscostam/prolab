import React from 'react';
import UrlUtils from '../../utils/UrlUtils';
import PropTypes from 'prop-types';

export const BreadcrumbButton = ({name, isLast, redirectUrl, afterClick}) => {
    
    const shouldShowEditQuitConfirmationDialog = () => {
        return UrlUtils.isBatch() || UrlUtils.isEditSpec();
    }
    return (
        <React.Fragment>
            <button className='breadcrumb-button' onClick={()=>{
                if(afterClick && shouldShowEditQuitConfirmationDialog() && !isLast){
                    afterClick(()=>{
                        window.location.href = redirectUrl;
                    })
                }
                else{
                    window.location.href = redirectUrl;
                }
            }} >{name}</button>
        </React.Fragment>
    );

};

BreadcrumbButton.defaultProps = {
    name: "",
    isLast: false,
};

BreadcrumbButton.propTypes = {
    name: PropTypes.string,
    afterClick: PropTypes.func,
    isLast: PropTypes.bool,
    redirectUrl: PropTypes.string,
};

export default BreadcrumbButton;

