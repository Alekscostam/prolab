export class ViewResponseUtils {
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
