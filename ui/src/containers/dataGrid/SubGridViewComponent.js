import React from 'react';
import PropTypes from "prop-types";
import DataGrid, {Column} from "devextreme-react/data-grid";
import {GridViewUtils} from "../../utils/GridViewUtils";
import ReactDOM from "react-dom";
import ShortcutButton from "../../components/prolab/ShortcutButton";
import ActionButtonWithMenu from "../../components/prolab/ActionButtonWithMenu";
import ConsoleHelper from "../../utils/ConsoleHelper";

class SubGridViewComponent extends React.Component {

    constructor(props) {
        super(props);
        ConsoleHelper('subGridViewComponent::constructor');
    }

    // //very important !!!
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (!!window.performance) {
            if (performance.navigation.type === 1) {
                return true;
            }
        }
        const viewId = this.props.subView?.viewInfo?.id;
        const nextViewId = nextProps.subView?.viewInfo?.id;
        const currentUrl = window.location.href
        if (viewId === nextViewId || currentUrl.includes('force=')) {
            ConsoleHelper('subGridViewComponent::shouldComponentUpdate update=false')
            return false;
        }
        ConsoleHelper('subGridViewComponent::shouldComponentUpdate update=true')
        return true;
    }

    render() {
        const {labels} = this.props;
        let showEditButton = false;
        let menuItems = [];
        this.props.subView?.headerOperations.forEach((operation) => {
            showEditButton = showEditButton || operation.type === 'OP_EDIT';
            if (
                operation.type === 'OP_PUBLIC' ||
                operation.type === 'OP_HISTORY' ||
                operation.type === 'OP_ATTACHMENTS'
            ) {
                menuItems.push(operation);
            }
        });
        let showMenu = menuItems.length > 0;
        let widthTmp = 0;
        if (showMenu) {
            widthTmp += 38;
        }
        if (showEditButton) {
            widthTmp += 38;
        }
        const rowAutoHeight = false;
        const columnAutoWidth = true;
        const subViewMode = !!this.props.subView;
        const viewId = this.props.subView?.viewInfo?.id;
        const recordId = this.props.subView?.headerData[0]?.ID;
        return (
            <React.Fragment>
                {subViewMode ? (
                    <div id='selection-row' className='float-left width-100'>
                        <DataGrid
                            id='selection-data-grid'
                            // keyExpr='ID'
                            ref={(ref) => this.props.handleOnInitialized(ref)}
                            dataSource={this.props.subView?.headerData}
                            wordWrapEnabled={rowAutoHeight}
                            columnAutoWidth={columnAutoWidth}
                            allowColumnReordering={true}
                            allowColumnResizing={true}
                            columnHidingEnabled={false}
                        >
                            {this.props.subView?.headerColumns
                                ?.filter((c) => c.visible === true)
                                .map((c) => {
                                    return (
                                        <Column
                                            allowFixing={true}
                                            caption={c.label}
                                            dataType={GridViewUtils.specifyColumnType(c?.type)}
                                            format={GridViewUtils.specifyColumnFormat(c?.type)}
                                            cellTemplate={GridViewUtils.cellTemplate(c)}
                                            dataField={c.fieldName}
                                        />
                                    );
                                })}
                            {showEditButton || showMenu ? (
                                <Column
                                    allowFixing={true}
                                    caption=''
                                    width={widthTmp}
                                    fixed={true}
                                    fixedPosition='right'
                                    cellTemplate={(element, info) => {
                                        ReactDOM.render(
                                            <div>
                                                <ShortcutButton
                                                    id={`${info.column.headerId}_menu_button`}
                                                    className={`action-button-with-menu`}
                                                    iconName={'mdi-pencil'}
                                                    handleClick={(e) => {
                                                        e.viewId = viewId;
                                                        e.recordId = recordId;
                                                        this.props.handleOnEditClick(e)
                                                    }}
                                                    label={''}
                                                    title={'Edycja'}
                                                    rendered={showEditButton}
                                                />
                                                <ActionButtonWithMenu
                                                    id='more_shortcut'
                                                    iconName='mdi-dots-vertical'
                                                    className={``}
                                                    items={menuItems}
                                                    rendered={showMenu}
                                                    title={labels['View_AdditionalOptions']}
                                                />
                                            </div>,
                                            element
                                        );
                                    }}
                                ></Column>
                            ) : null}
                        </DataGrid>
                    </div>
                ) : null}
            </React.Fragment>
        );
    }
}

SubGridViewComponent.defaultProps = {};
SubGridViewComponent.propTypes = {
    subView: PropTypes.object.isRequired,
    labels: PropTypes.object.isRequired,
    handleOnInitialized: PropTypes.func.isRequired,
    handleOnEditClick: PropTypes.func,
};

export default SubGridViewComponent;
