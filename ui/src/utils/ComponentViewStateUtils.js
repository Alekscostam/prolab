export class ComponentViewStateUtils {
    static getFilter(component) {
        if (!component) {
            component = window.dataGrid;
        }

        return {
            filter: component?.getCombinedFilter(),
        };
    }

    static getSort(component) {
        if (!component) {
            component = window.dataGrid;
        }

        if (!component) {
            return {
                sort: [],
            };
        }

        const sort = component
            .getVisibleColumns()
            .filter((column) => column.sortOrder)
            .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0))
            .map((column) => ({
                selector: column.dataField,
                desc: column.sortOrder === 'desc',
            }));

        return {
            sort,
        };
    }

    static bodyWithSortAndFilter(body, component) {
        return {
            ...body,
            ...this.getFilter(component),
            ...this.getSort(component),
        };
    }
}
