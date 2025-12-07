import React from 'react';
import PropTypes from 'prop-types';
import {Panel} from 'primereact/panel';
import SimpleReactValidator from '../validator';
import EditHeaderDialogComponent from './EditHeaderDialogComponent';

export class EditHeaderFullScreenComponent extends EditHeaderDialogComponent {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            windowSize: {
                width: '100%',
                height: '100%',
                maxHeight: '100%',
            },
        };
    }
    scaleSize(editField, side) {
        const left = editField.panels.find((panel) => panel.panel === 'left');
        const middle = editField.panels.find((panel) => panel.panel === 'middle');
        const right = editField.panels.find((panel) => panel.panel === 'right');
        const panelFounded = editField.panels.find((panel) => panel.panel === side);

        const leftSize = left ? left.size : 0;
        const rightSize = right ? right.size : 0;
        const middleSize = middle ? middle.size : 0;
        if (side === 'bottom') {
            const bottom = editField.panels.find((panel) => panel.panel === side);
            if (bottom) {
                return bottom?.size;
            }
            return undefined;
        }
        if (leftSize + middleSize + rightSize > 100) {
            if (leftSize + middleSize > 100) {
                if (leftSize > 100) {
                    if (side === 'middle' || side === 'right') {
                        return undefined;
                    }
                    return 100;
                } else {
                    if (side === 'middle') {
                        const sizeResult = 100 - leftSize;
                        return sizeResult === 0 ? undefined : sizeResult;
                    }
                    if (side === 'right') {
                        return undefined;
                    }
                    return panelFounded?.size;
                }
            } else {
                if (side === 'right') {
                    const sizeResult = 100 - (leftSize + middleSize);
                    return sizeResult === 0 ? undefined : sizeResult;
                }
                return panelFounded?.size;
            }
        } else {
            return panelFounded?.size;
        }
    }

    calcaulateMarginsForBottomPanel = (panel) => {
        if (panel) {
            const margin = Math.floor((100 - parseInt(panel.size)) / 2);
            return 'ccol-' + margin;
        }
    };

    getPanelColSize = (size) => {
        const panelSize = size ? size : 'col-lg-4';
        if (panelSize === 'col-lg-4') {
            return panelSize;
        }
        return 'ccol-' + panelSize;
    };
    renderFields(panel) {
        return panel.groups.map((group, index) => {
            const hiddenElements = group.fields.filter((field) => field.hidden);
            if (hiddenElements.length === group.fields.length) {
                return null;
            }
            return this.renderGroup(group, index);
        });
    }
    renderPanels(editData) {
        return editData?.editFields.map((editField, panelIndex) => {
            const left = editField.panels.find((panel) => panel.panel === 'left');
            const middle = editField.panels.find((panel) => panel.panel === 'middle');
            const right = editField.panels.find((panel) => panel.panel === 'right');
            const bottom = editField.panels.find((panel) => panel.panel === 'bottom');
            const marginsForBottomPanel = this.calcaulateMarginsForBottomPanel(bottom);
            const styleForPanels = {
                paddingRight: '0px',
                paddingLeft: '0px',
                boxShadow: 'none',
                paddingBottom: '0px',
            };
            const sizeLeft = this.scaleSize(editField, 'left') === 0 ? undefined : this.scaleSize(editField, 'left');
            const sizeRight = this.scaleSize(editField, 'right') === 0 ? undefined : this.scaleSize(editField, 'right');
            const sizeMiddle =
                this.scaleSize(editField, 'middle') === 0 ? undefined : this.scaleSize(editField, 'middle');
            const sizeBottom =
                this.scaleSize(editField, 'bottom') === 0 ? undefined : this.scaleSize(editField, 'bottom');
            return (
                <React.Fragment key={`panel_${panelIndex}`}>
                    {sizeLeft && (
                        <div
                            key={`div_col_left_${panelIndex}`}
                            className={`${this.getPanelColSize(sizeLeft)} col-md-6 col-sm-12`}
                        >
                            <Panel
                                key={`edit-row-panel-left-${panelIndex}`}
                                id={`panel_left_${panelIndex}`}
                                style={styleForPanels}
                            >
                                {this.renderFields(left)}
                            </Panel>
                        </div>
                    )}
                    {sizeMiddle && (
                        <div
                            key={`div_col_middle_${panelIndex}`}
                            className={`${this.getPanelColSize(sizeMiddle)} col-md-6 col-sm-12`}
                        >
                            <Panel
                                key={`edit-row-panel-middle-${panelIndex}`}
                                id={`panel_middle_${panelIndex}`}
                                style={styleForPanels}
                            >
                                {this.renderFields(middle)}
                            </Panel>
                        </div>
                    )}
                    {sizeRight && (
                        <div
                            key={`div_col_right_${panelIndex}`}
                            className={`${this.getPanelColSize(sizeRight)} col-md-6 col-sm-12`}
                        >
                            <Panel
                                key={`edit-row-panel-right-${panelIndex}`}
                                id={`panel_right_${panelIndex}`}
                                style={styleForPanels}
                            >
                                {this.renderFields(right)}
                            </Panel>
                        </div>
                    )}
                    {sizeBottom && (
                        <React.Fragment>
                            {marginsForBottomPanel && <div className={marginsForBottomPanel}></div>}
                            <div
                                key={`div_col_bottom_${panelIndex}`}
                                className={`${this.getPanelColSize(sizeBottom)} col-md-6 col-sm-12`}
                            >
                                <Panel
                                    key={`edit-row-panel-bottom-${panelIndex}`}
                                    id={`panel_bottom_${panelIndex}`}
                                    style={styleForPanels}
                                >
                                    {this.renderFields(bottom)}
                                </Panel>
                            </div>
                            {marginsForBottomPanel && <div className={marginsForBottomPanel}></div>}
                        </React.Fragment>
                    )}
                </React.Fragment>
            );
        });
    }
}

EditHeaderFullScreenComponent.defaultProps = {};

EditHeaderFullScreenComponent.propTypes = {
    visibleEditPanel: PropTypes.bool.isRequired,
    editData: PropTypes.object.isRequired,
    kindView: PropTypes.string,
    showErrorMessages: PropTypes.func.isRequired,
    onAfterStateChange: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    onSave: PropTypes.func.isRequired,
    onAutoFill: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onEditList: PropTypes.func,
    onHide: PropTypes.func.isRequired,
    validator: PropTypes.instanceOf(SimpleReactValidator).isRequired,
};

export default EditHeaderFullScreenComponent;
