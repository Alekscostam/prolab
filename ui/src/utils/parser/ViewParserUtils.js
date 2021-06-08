import {
    Buttons,
    Column,
    DocumentsList,
    GridColumns,
    GridOptions,
    PluginsList,
    ShortcutButtons,
    ViewInfo,
    ViewResponse
} from "../../model/ViewModel";
import {parseBoolean} from "./ParserUtils";

export class ViewParserUtils {

    static parse(jsonData) {
        let parsedViewObject = JSON.parse(jsonData);
        const viewValidObject = new ViewResponse({
            viewInfo: new ViewInfo({
                id: parsedViewObject.viewInfo.id,
                name: parsedViewObject.viewInfo.name,
                type: parsedViewObject.viewInfo.type
            }),
            gridOptions: new GridOptions({
                showGroupPanel: parseBoolean(parsedViewObject.gridOptions?.showGroupPanel),
                groupExpandAll: parseBoolean(parsedViewObject.gridOptions?.groupExpandAll),
                columnAutoWidth: parseBoolean(parsedViewObject.gridOptions?.columnAutoWidth),
                rowAutoHeight: parseBoolean(parsedViewObject.gridOptions?.rowAutoHeight),
                headerAutoHeight: parseBoolean(parsedViewObject.gridOptions?.headerAutoHeight),
            }),
            gridColumns: parsedViewObject.gridColumns?.map((g) => new GridColumns({
                groupName: g.groupName,
                freeze: g.freeze,
                columns: g.columns?.map((c) => new Column({
                    id: c.id,
                    visible: c.visible,
                    fieldName: c.fieldName,
                    label: c.label,
                    type: c.type,
                    sortIndex: c.sortIndex,
                    sortOrder: c.sortOrder,
                    groupIndex: c.groupIndex,
                    isSort: parseBoolean(c.isSort),
                    isGroup: parseBoolean(c.isGroup),
                    isFilter: parseBoolean(c.isFilter),
                    width: c.width
                })),
            })),
            buttons: parsedViewObject.buttons?.map((b) => new Buttons({
                type: b.type,
                visible: parseBoolean(b.visible),
                label: b.label
            })),
            shortcutButtons:
                parsedViewObject.shortcutButtons?.map((s) => new ShortcutButtons({
                    type: s.type,
                    id: s.id,
                    label: s.label
                })),
            documentsList: parsedViewObject.documentsList?.map((d) => new DocumentsList({id: d.id, label: d.label})),
            pluginsList: parsedViewObject.pluginsList?.map((p) => new PluginsList({id: p.id, label: p.label}))
        });
        return viewValidObject;
    }

}