import {ArrayModel, ObjectModel} from "objectmodel";

export const ViewInfo = ObjectModel({
    id: Number,
    name: String,
    type: ["gridView", "cardView"]
});

export const GridOptions = ObjectModel({
    showGroupPanel: [Boolean],
    groupExpandAll: [Boolean],
    columnAutoWidth: [Boolean],
    rowAutoHeight: [Boolean],
    headerAutoHeight: [Boolean]
})

export const Column = ObjectModel({
    id: Number,
    visible: Number,
    fieldName: String,
    label: String,
    type: String,
    sortIndex: [Number],
    sortOrder: [String],
    groupIndex: [Number],
    isSort: [Boolean],
    isGroup: [Boolean],
    isFilter: [Boolean],
    width: [Number]
})

export const GridColumns = ObjectModel({
    groupName: [String],
    freeze: [String],
    columns: ArrayModel(Column)
})

export const Buttons = ObjectModel({
    type: [String],
    visible: [Boolean],
    label: String
})

export const ShortcutButtons = ObjectModel({
    type: [String],
    id: Number,
    label: String
})

export const DocumentsList = ObjectModel({
    id: Number,
    label: String
})

export const PluginsList = ObjectModel({
    id: Number,
    label: String
})

export const ViewResponse = ObjectModel({
    viewInfo: ViewInfo,
    gridOptions: GridOptions,
    gridColumns: ArrayModel(GridColumns),
    buttons: ArrayModel(Buttons),
    shortcutButtons: ArrayModel(ShortcutButtons),
    documentsList: ArrayModel(DocumentsList),
    pluginsList: ArrayModel(PluginsList)
});