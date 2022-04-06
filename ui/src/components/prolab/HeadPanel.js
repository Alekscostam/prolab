/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import OperationsButtons from "./OperationsButtons";
import AppPrefixUtils from "../../utils/AppPrefixUtils";
import {Breadcrumb} from "../../utils/BreadcrumbUtils";
import {GridViewUtils} from "../../utils/GridViewUtils";
import UrlUtils from "../../utils/UrlUtils";
//Komponent wyświetlający górną ramkę i okalający wszystkie przyciski, filtry ....
export const HeadPanel = props => {
    const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
    const subViewId = props.elementSubViewId;
    const parentId = props.elementRecordId;
    let viewId = props.elementId;
    viewId = GridViewUtils.getRealViewId(subViewId, viewId);
    return (<React.Fragment>
        <div id="grid-selection-panel"
             className={props.selectedRowKeys?.length > 0 ? "d-flex flex-row grid-selection-panel grid-selection-panel-selection"
                 : "d-flex flex-row grid-selection-panel grid-selection-panel-non-selection"}>
            {props.leftContent === undefined ? null :
                <React.Fragment>
                    <div id="grid-panel-left" className="grid-panel-left center-inside-div">
                        {props.leftContent}
                    </div>
                </React.Fragment>}
            {props.selectedRowKeys?.length > 0 ?
                <React.Fragment>
                    <div id="grid-panel-selection" className="grid-panel-selection">
                        <div id="grid-separator" className="p-1 grid-separator-fragment"/>
                        <div id="grid-count-panel"
                             className="grid-count-fragment center-text-in-div">Pozycje: {props.selectedRowKeys.length | 0}</div>
                        <div id="grid-separator" className="p-1 grid-separator-fragment"/>
                        <div id="grid-buttons-fragment" className="p-1 grid-buttons-fragment">
                            <OperationsButtons labels={props.labels}
                                               operations={props.operations}
                                               handleRestore={(e) => props.handleRestore(e)}
                                               handleDelete={(e) => props.handleDelete(e)}
                                               handleCopy={(e) => props.handleCopy(e)}
                                               handleArchive={(e) => props.handleArchive(e)}
                                               handleEdit={() => {
                                                   if (props.elementKindView === 'ViewSpec' && props.selectedRowKeys.length > 0) {
                                                       const idParams = props.selectedRowKeys.map((item) => item.ID);
                                                       const recordParams = UrlUtils.getShortUrlParams('recordId', idParams)
                                                       const newUrl = AppPrefixUtils.locationHrefUrl(`/#/edit-spec/${viewId}?parentId=${parentId}&${recordParams}${currentBreadcrumb}`);
                                                       UrlUtils.navigateToExternalUrl(newUrl);
                                                   }
                                               }}
                                               inverseColor={true}
                                               buttonShadow={false}/>
                        </div>
                    </div>
                </React.Fragment> : null}
            {props.rightContent === undefined ? null :
                <React.Fragment>
                    <div id="grid-panel-right" className="grid-panel-right pt-1 pb-1">
                        {props.rightContent}
                    </div>
                </React.Fragment>}
        </div>
    </React.Fragment>);
}

HeadPanel.defaultProps = {};

HeadPanel.propTypes = {
    elementId: PropTypes.string.isRequired,
    elementSubViewId: PropTypes.string.isRequired,
    elementRecordId: PropTypes.string.isRequired,
    elementKindView:PropTypes.string.isRequired,
    labels: PropTypes.object.isRequired,
    selectedRowKeys: PropTypes.array.isRequired,
    operations: PropTypes.array.isRequired,
    handleDelete: PropTypes.func.isRequired,
    handleRestore: PropTypes.func.isRequired,
    handleCopy: PropTypes.func.isRequired,
    handleArchive: PropTypes.func.isRequired,
    leftContent: PropTypes.any,
    rightContent: PropTypes.any
};

export default HeadPanel;
