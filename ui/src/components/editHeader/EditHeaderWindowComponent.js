import PropTypes from 'prop-types';
import SimpleReactValidator from '../validator';
import EditHeaderDialogComponent from './EditHeaderDialogComponent';

export class EditHeaderWindowComponent extends EditHeaderDialogComponent {
    constructor(props) {
        super(props);
        const editData = this.props.editData;

        this.state = {
            ...this.state,
            windowSize: {
                width: editData?.editInfo?.windowSize?.width + 'px' || '100%',
                height: editData?.editInfo?.windowSize?.height + 'px' || '100%',
                maxHeight: undefined,
            },
        };
    }

    renderFields(editData) {
        return editData?.editFields
            .flatMap((editField) => editField.panels)
            .flatMap((panel) => panel.groups)
            .map((group, index) => {
                const hiddenElements = group.fields.filter((field) => field.hidden);
                if (hiddenElements.length === group.fields.length) {
                    return null;
                }
                return this.renderGroup(group, index);
            });
    }

    renderPanels(editData) {
        return this.renderFields(editData);
    }
}

EditHeaderWindowComponent.defaultProps = {};

EditHeaderWindowComponent.propTypes = {
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

export default EditHeaderWindowComponent;
