import {ArrayModel, ObjectModel} from 'objectmodel';

export const ViewInfo = ObjectModel({
    id: Number,
    name: String,
    type: ['gridView', 'cardView', 'dashboard', 'TreeList','gantt'],
    kindView: ['View', 'ViewSpec', 'NULL', null],
});

export const GridOptions = ObjectModel({
    showGroupPanel: [Boolean],
    groupExpandAll: [Boolean],
    columnAutoWidth: [Boolean],
    rowAutoHeight: [Boolean],
    headerAutoHeight: [Boolean],
});

export const CardOptions = ObjectModel({
    width: Number,
    height: Number,
});

export const Column = ObjectModel({
    id: Number,
    visible: Boolean,
    fieldName: String,
    label: String,
    type: String,
    sortIndex: [Number],
    sortOrder: [String],
    groupIndex: [Number],
    isSort: [Boolean],
    isGroup: [Boolean],
    isFilter: [Boolean],
    width: [Number],
});

export const GridColumns = ObjectModel({
    groupName: [String],
    freeze: [String],
    columns: ArrayModel(Column),
});

export const GanttColumns = ObjectModel({
    groupName: [String],
    freeze: [String],
    columns: ArrayModel(Column),
});

export const CardElement = ObjectModel({
    id: Number,
    visible: Boolean,
    fieldName: String,
    label: String,
    type: String,
});

export const Operations = ObjectModel({
    type: String,
    label: String,
});

export const ShortcutButtons = ObjectModel({
    type: [String],
    id: Number,
    label: String,
});

export const DocumentsList = ObjectModel({
    id: Number,
    label: String,
});

export const PluginsList = ObjectModel({
    id: Number,
    label: String,
});

export const BatchesList = ObjectModel({
    id: Number,
    label: String,
});

export const FiltersList = ObjectModel({
    id: Number,
    label: String,
});

export const ViewResponse = ObjectModel({
    viewInfo: ViewInfo,
    gridOptions: [GridOptions],
    cardOptions: [CardOptions],
    gridColumns: ArrayModel(GridColumns),
    operations: [ArrayModel(Operations)],
    shortcutButtons: [ArrayModel(ShortcutButtons)],
    documentsList: [ArrayModel(DocumentsList)],
    pluginsList: [ArrayModel(PluginsList)],
});
