import {StringUtils} from './StringUtils';

export class ResponseUtils {
    static columnsFromGroupCreate(responseView, propertyName = 'gridColumns') {
        const columnsTmp = [];
        let columnOrderCounter = 0;
        new Array(responseView[propertyName]).forEach((gridColumns) => {
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
    static columnsGroupCreate(responseView, propertyName = 'gridColumns') {
        const columnsTmp = [];
        let columnOrderCounter = 0;
        function processGroup(group) {
            group.isBand = true;
            group.caption = group.groupName;
            if (Array.isArray(group.columns)) {
                group.columns = group.columns.map((col) => {
                    if (col.columns) {
                        return processGroup(col);
                    } else {
                        col.groupName = group.groupName;
                        col.freeze = StringUtils.isBlank(col?.freeze) ? group.freeze : col.freeze;
                        col.columnOrder = columnOrderCounter++;
                        col.dataField = col.label;
                        col.caption = col.label;
                        return col;
                    }
                });
                const allChildrenInvisible = group.columns.every((child) => child.visible === false);
                group.visible = !allChildrenInvisible; // jeśli wszystkie false → grupa też false
            }
            return group;
        }
        new Array(responseView[propertyName]).forEach((gridColumns) => {
            gridColumns?.forEach((group) => {
                columnsTmp.push(processGroup(group));
            });
        });
        return columnsTmp;
    }
    static flattenColumns(gridColumns) {
        const flatColumns = [];
        let columnOrderCounter = 0;
        function collectColumns(group, parentGroupName, parentFreeze) {
            if (Array.isArray(group.columns)) {
                group.columns.forEach((col) => {
                    if (col.columns) {
                        collectColumns(col, col.groupName || parentGroupName, col.freeze || parentFreeze);
                    } else {
                        col.groupName = parentGroupName;
                        col.freeze = StringUtils.isBlank(col?.freeze) ? parentFreeze : col.freeze;
                        col.columnOrder = columnOrderCounter++;
                        col.dataField = col.label;
                        col.caption = col.label;
                        flatColumns.push(col);
                    }
                });
            }
        }
        new Array(gridColumns).forEach((gc) => {
            gc?.forEach((group) => {
                collectColumns(group, group.groupName, group.freeze);
            });
        });
        return flatColumns;
    }
    static pluginListCreateAndPass(responseView) {
        const pluginsListTmp = [];
        for (let plugin in responseView?.pluginsList) {
            pluginsListTmp.push({
                id: responseView?.pluginsList[plugin].id,
                label: responseView?.pluginsList[plugin].label,
            });
        }
        responseView.pluginsList = pluginsListTmp;
        return pluginsListTmp;
    }
    static documentListCreateAndPass(responseView) {
        const documentsListTmp = [];
        for (let document in responseView?.documentsList) {
            documentsListTmp.push({
                id: responseView?.documentsList[document].id,
                label: responseView?.documentsList[document].label,
            });
        }
        responseView.documentsList = documentsListTmp;
        return documentsListTmp;
    }
    static batchListCreateAndPass(responseView) {
        const batchesListTmp = [];
        for (let batch in responseView?.batchesList) {
            batchesListTmp.push({
                id: responseView?.batchesList[batch].id,
                label: responseView?.batchesList[batch].label,
            });
        }
        responseView.batchesList = batchesListTmp;
        return batchesListTmp;
    }
    static filtersListCreateAndPass(responseView) {
        const filtersListTmp = [];
        for (let filter in responseView?.filtersList) {
            filtersListTmp.push({
                id: responseView?.filtersList[filter].id,
                label: responseView?.filtersList[filter].label,
            });
        }
        responseView.filtersList = filtersListTmp;
        return filtersListTmp;
    }

    static mergeRows(columns, rows) {
        const columnsMerge = columns.filter((c) => c.isMerge);

        columnsMerge.forEach((column) => {
            const fieldExists = rows.some((row) => row[column.fieldName] !== undefined);
            if (!fieldExists) return;

            let count = 1;
            let startIndex = 0;

            for (let i = 0; i < rows.length; i++) {
                const currentValue = rows[i][column.fieldName];
                const nextValue = rows[i + 1] ? rows[i + 1][column.fieldName] : null;

                if (currentValue === nextValue) {
                    count++;
                } else {
                    rows[startIndex][column.fieldName + '_MERGE_COUNT'] = count;
                    for (let j = startIndex + 1; j <= i; j++) {
                        rows[j][column.fieldName + '_MERGE_COUNT'] = 'none';
                    }
                    count = 1;
                    startIndex = i + 1;
                }
            }
        });
        return rows;
    }

    static test() {
        const xd = this.mergeRows(
            [
                {fieldName: 'country', isMerge: true},
                {fieldName: 'city', isMerge: true},
            ],
            [
                {country: 'PL'},
                {country: 'PL'},
                {country: 'DE'},
                {country: 'DE'},
                {country: 'DE'},
                {country: 'FR'},
                {country: 'DE'},
                {country: 'PL'},
            ]
        );
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
