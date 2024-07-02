/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-max-props-per-line */
import React from 'react';
import PropTypes from 'prop-types';
import OperationsButtons from './OperationsButtons';
import {Breadcrumb} from '../../utils/BreadcrumbUtils';
import {DataGridUtils} from '../../utils/component/DataGridUtils';
import {TreeListUtils} from '../../utils/component/TreeListUtils';
import LocUtils from '../../utils/LocUtils';
//Komponent wyświetlający górną ramkę i okalający wszystkie przyciski, filtry ....
export const HeadPanel = (props) => {
    const currentBreadcrumb = Breadcrumb.currentBreadcrumbAsUrlParam();
    const subViewId = props.elementSubViewId;
    const parentId = props.elementRecordId;
    const viewId = DataGridUtils.getRealViewId(subViewId, props.elementId);

    const handleEdit = (e, props, viewId, parentId, currentBreadcrumb) => {
        if (props.elementKindView === 'ViewSpec' && props.selectedRowKeys.length > 0) {
            const idParams = props.selectedRowKeys.map((item) => item.ID);
            TreeListUtils.openEditSpec(
                viewId,
                parentId,
                idParams,
                currentBreadcrumb,
                () => props.handleUnblockUi(),
                (err) => props.showErrorMessages(err)
            );
        }
    };

    const handleSpecEdit = (e, props, viewId, parentId, currentBreadcrumb) => {
        let idParams = [];
        if (!e.selectAll) {
            idParams = props.selectedRowKeys.map((item) => item.ID);
        }
        TreeListUtils.openEditSpec(
            viewId,
            parentId,
            idParams,
            currentBreadcrumb,
            () => props.handleUnblockUi(),
            (err) => props.showErrorMessages(err)
        );
    };

    return (
        <React.Fragment>
            <div
                id='grid-selection-panel'
                className={
                    props.selectedRowKeys?.length > 0
                        ? 'd-flex flex-row grid-selection-panel grid-selection-panel-selection'
                        : 'd-flex flex-row grid-selection-panel grid-selection-panel-non-selection'
                }
            >
                {props.leftContent === undefined ? null : (
                    <React.Fragment>
                        <div id='grid-panel-left' className='grid-panel-left center-inside-div'>
                            {props.leftContent}
                        </div>
                    </React.Fragment>
                )}
                {props.selectedRowKeys?.length > 0 ? (
                    <React.Fragment>
                        <div id='grid-panel-selection' className='grid-panel-selection'>
                            <div
                                id='grid-buttons-fragment'
                                className=' grid-buttons-fragment'
                                style={{paddingTop: '5px', paddingLeft: '5px'}}
                            >
                                <OperationsButtons
                                    labels={props.labels}
                                    operations={props.operations}
                                    atLeastOneSelected={true}
                                    isFromHeader={true}
                                    handleBatch={(e) => {
                                        props.handleBatch(e);
                                    }}
                                    handleRestore={(e) => props.handleRestore(e)}
                                    handleFill={(e) => props.handleFill(e)}
                                    handleDownload={(e) => props.handleDownload(e)}
                                    handleDelete={(e) => props.handleDelete(e)}
                                    handlePublish={(e) => props.handlePublish(e)}
                                    handleCopy={(e) => props.handleCopy(e)}
                                    handleFormula={(e) => props.handleFormula(e)}
                                    handleArchive={(e) => props.handleArchive(e)}
                                    handleAttachments={(e) => props.handleAttachments(e)}
                                    handleEdit={(e) => handleEdit(e, props, viewId, parentId, currentBreadcrumb)}
                                    handleEditSpec={(e) => {
                                        let prevUrl = window.location.href;
                                        sessionStorage.setItem('prevUrl', prevUrl);
                                        handleSpecEdit(e, props, viewId, parentId, currentBreadcrumb);
                                    }}
                                    inverseColor={true}
                                    buttonShadow={false}
                                    handleBlockUi={(e) => props.handleUnblockUi()}
                                />
                            </div>
                        </div>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <div id='grid-panel-selection' className='grid-panel-selection'>
                            <div
                                id='grid-buttons-fragment'
                                className='grid-buttons-fragment'
                                style={{paddingTop: '5px', paddingLeft: '5px'}}
                            >
                                <OperationsButtons
                                    labels={props.labels}
                                    operations={props.operations}
                                    atLeastOneSelected={false}
                                    handleRestore={(e) => props.handleRestore(e)}
                                    handleDelete={(e) => props.handleDelete(e)}
                                    handleCopy={(e) => props.handleCopy(e)}
                                    handleDownload={(e) => props.handleDownload(e)}
                                    handleFormula={(e) => props.handleFormula(e)}
                                    handlePublish={(e) => props.handlePublish(e)}
                                    handleArchive={(e) => props.handleArchive(e)}
                                    handleAttachments={(e) => props.handleAttachments(e)}
                                    handleEdit={(e) => handleEdit(e, props, viewId, parentId, currentBreadcrumb)}
                                    handleEditSpec={(e) => {
                                        let prevUrl = window.location.href;
                                        sessionStorage.setItem('prevUrl', prevUrl);
                                        handleSpecEdit(e, props, viewId, parentId, currentBreadcrumb);
                                    }}
                                    inverseColor={false}
                                    handleFill={(e) => props.handleFill(e)}
                                    buttonShadow={true}
                                    handleBlockUi={() => {
                                        props.handleBlockUi();
                                    }}
                                />
                            </div>
                        </div>
                    </React.Fragment>
                )}
                {props.rightContent === undefined ? null : (
                    <React.Fragment>
                        <div id='grid-panel-right' className='grid-panel-right pt-1 pb-1'>
                            {props.rightContent}
                        </div>
                    </React.Fragment>
                )}
            </div>
        </React.Fragment>
    );
};

HeadPanel.defaultProps = {};

HeadPanel.propTypes = {
    elementId: PropTypes.string.isRequired,
    elementRecordId: PropTypes.string, // nie musi byc required jednak
    elementKindView: PropTypes.string,
    labels: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.array.isRequired]),
    selectedRowKeys: PropTypes.array,
    operations: PropTypes.array,
    handleDelete: PropTypes.func,
    handleRestore: PropTypes.func,
    handleCopy: PropTypes.func,
    handleArchive: PropTypes.func,
    handleFormula: PropTypes.func,
    handleAttachments: PropTypes.func,
    handleBlockUi: PropTypes.func,
    handleUnblockUi: PropTypes.func,
    showErrorMessages: PropTypes.func,
    elementSubViewId: PropTypes.string,
    leftContent: PropTypes.any,
    rightContent: PropTypes.any,
};

export default HeadPanel;
