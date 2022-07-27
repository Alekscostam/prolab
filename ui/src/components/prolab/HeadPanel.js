/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import OperationsButtons from "./OperationsButtons";
import {Breadcrumb} from "../../utils/BreadcrumbUtils";
import {DataGridUtils} from "../../utils/component/DataGridUtils";
import {TreeListUtils} from "../../utils/component/TreeListUtils";
//Komponent wyświetlający górną ramkę i okalający wszystkie przyciski, filtry ....
export const HeadPanel = props => {
    const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
    const subViewId = props.elementSubViewId;
    const parentId = props.elementRecordId;
    let viewId = props.elementId;
    viewId = DataGridUtils.getRealViewId(subViewId, viewId);

    const handleEdit = (e, props, viewId, parentId, currentBreadcrumb) => {
        if (props.elementKindView === 'ViewSpec' && props.selectedRowKeys.length > 0) {
            const idParams = props.selectedRowKeys.map((item) => item.ID);
            TreeListUtils.openEditSpec(viewId, parentId, idParams, currentBreadcrumb,
                () => props.handleUnblockUi(),
                (err) => props.showErrorMessages(err));
        } else {
            //TODO w przyszłości może trzeba będzie dodać normalną edycja wiersza, na razie nie jest wykorzystywana
        }
    }

    const handleSpecEdit = (e, props, viewId, parentId, currentBreadcrumb) => {
        let idParams = [];
        if (!e.selectAll) {
            idParams = props.selectedRowKeys.map((item) => item.ID);
        }
        TreeListUtils.openEditSpec(viewId, parentId, idParams, currentBreadcrumb,
            () => props.handleUnblockUi(),
            (err) => props.showErrorMessages(err));
    }

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
                        <div id="grid-buttons-fragment" className="p-2 grid-buttons-fragment">
                            <OperationsButtons labels={props.labels}
                                               operations={props.operations}
                                               atLeastOneSelected={true}
                                               handleRestore={(e) => props.handleRestore(e)}
                                               handleDelete={(e) => props.handleDelete(e)}
                                               handleCopy={(e) => props.handleCopy(e)}
                                               handleArchive={(e) => props.handleArchive(e)}
                                               handleEdit={(e) => handleEdit(e, props, viewId, parentId, currentBreadcrumb)}
                                               handleEditSpec={(e) => handleSpecEdit(e, props, viewId, parentId, currentBreadcrumb)}
                                               inverseColor={true}
                                               buttonShadow={false}
                                               handleBlockUi={(e) =>props.handleUnblockUi()}
                                               />
                        </div>
                    </div>
                </React.Fragment>
                :
                <React.Fragment>
                    <div id="grid-panel-selection" className="grid-panel-selection">
                        <div id="grid-buttons-fragment" className="p-2 grid-buttons-fragment">
                    <OperationsButtons labels={props.labels}
                                       operations={props.operations}
                                       atLeastOneSelected={false}
                                       handleRestore={(e) => props.handleRestore(e)}
                                       handleDelete={(e) => props.handleDelete(e)}
                                       handleCopy={(e) => props.handleCopy(e)}
                                       handleArchive={(e) => props.handleArchive(e)}
                                       handleEdit={(e) => handleEdit(e, props, viewId, parentId, currentBreadcrumb)}
                                       handleEditSpec={(e) => handleSpecEdit(e, props, viewId, parentId, currentBreadcrumb)}
                                       inverseColor={false}
                                       buttonShadow={true}
                                       handleBlockUi={() => {
                                           props.handleBlockUi()
                                       }}/>
                        </div>
                    </div>
                </React.Fragment>}
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
    elementRecordId: PropTypes.string.isRequired,
    elementKindView:PropTypes.string,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    selectedRowKeys: PropTypes.array.isRequired,
    operations: PropTypes.array.isRequired,
    handleDelete: PropTypes.func.isRequired,
    handleRestore: PropTypes.func.isRequired,
    handleCopy: PropTypes.func.isRequired,
    handleArchive: PropTypes.func.isRequired,
    handleBlockUi: PropTypes.func.isRequired,
    handleUnblockUi: PropTypes.func.isRequired,
    showErrorMessages: PropTypes.func.isRequired,
    elementSubViewId: PropTypes.string,
    leftContent: PropTypes.any,
    rightContent: PropTypes.any
};

export default HeadPanel;
