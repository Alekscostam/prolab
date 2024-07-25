import { StringUtils } from "./StringUtils";

export class ResponseUtils {
    static columnsFromGroupCreate(responseView) {
        const columnsTmp = [];
        let columnOrderCounter = 0;
        new Array(responseView.gridColumns).forEach((gridColumns) => {
            gridColumns?.forEach((group) => {
                group.columns?.forEach((column) => {
                    column.groupName = group.groupName;
                    column.freeze = StringUtils.isBlank(column?.freeze) ? group.freeze : column.freeze;
                    column.columnOrder = columnOrderCounter++;
                    columnsTmp.push(column);
                });
            });
        });
        return columnsTmp;
    }
    static pluginListCreate(responseView) {
        const pluginsListTmp = [];
        for (let plugin in responseView?.pluginsList) {
            pluginsListTmp.push({
                id: responseView?.pluginsList[plugin].id,
                label: responseView?.pluginsList[plugin].label,
            });
        }
        return pluginsListTmp;
    }
    static documentListCreate(responseView) {
        const documentsListTmp = [];
        for (let document in responseView?.documentsList) {
            documentsListTmp.push({
                id: responseView?.documentsList[document].id,
                label: responseView?.documentsList[document].label,
            });
        }
        return documentsListTmp;
    }
    static batchListCreate(responseView) {
        const batchesListTmp = [];
        for (let batch in responseView?.batchesList) {
            batchesListTmp.push({
                id: responseView?.batchesList[batch].id,
                label: responseView?.batchesList[batch].label,
            });
        }
        return batchesListTmp;
    }
    static filtersListCreate(responseView) {
        const filtersListTmp = [];
        for (let filter in responseView?.filtersList) {
            filtersListTmp.push({
                id: responseView?.filtersList[filter].id,
                label: responseView?.filtersList[filter].label,
            });
        }
        return filtersListTmp;
    }
    static editInfoToViewInfo(response, type, kindView) {
        return {
            ...response,
            viewInfo: {
                id: response.editInfo.viewId,
                name: response.editInfo.viewName,
                parentId: response.editInfo.parentId,
                type: type,
                kindView: kindView,
            },
            gridColumns: [
                {
                    groupName: '',
                    freeze: '',
                    columns: response.listColumns,
                },
            ],
            gridOptions: response.listOptions,
        };
    }
}
