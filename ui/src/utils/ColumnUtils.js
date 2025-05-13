import {ArrayUtils} from './ArrayUtils';
import {StringUtils} from './StringUtils';

export class ColumnUtils {
    static applyFilters(filtersIn, column) {
        filtersIn = filtersIn || [];
        if (!ArrayUtils.isEmpty(filtersIn)) {
            const filterFounded = this.getFilter(filtersIn, column?.name);
            if (filterFounded) {
                column.filterValue = filterFounded[2];
            }
        }
    }
    static getFilter(filtersIn, columnName) {
        filtersIn = filtersIn || [];
        if (columnName) {
            return filtersIn?.find((filter) => Array.isArray(filter) && filter[0] === columnName);
        }
        return null;
    }

    static getValueFromFilter(filtersIn, columnName) {
        const filter = this.getFilter(filtersIn, columnName);
        if (!StringUtils.isBlank(filter)) {
            return filter[2];
        }
        return null;
    }
    static replaceFunctionsWithDataField(filters, columns) {
        if (!Array.isArray(filters)) return filters;
        const isSingleCondition = typeof filters[0] === 'function' && typeof filters.columnIndex === 'number';
        if (isSingleCondition) {
            const columnDataField = columns[filters.columnIndex]?.dataField;
            filters[0] = columnDataField;
            return filters;
        }
        return filters.map((item) => {
            if (Array.isArray(item)) {
                const replaced = this.replaceFunctionsWithDataField(item, columns);
                for (const key in item) {
                    if (!Number.isInteger(+key)) {
                        replaced[key] = item[key];
                    }
                }
                if (typeof item[0] === 'function' && typeof item.columnIndex === 'number') {
                    const column = columns[item.columnIndex];
                    if (column && column.dataField) {
                        replaced[0] = column.dataField;
                    }
                }

                return replaced;
            }
            return item;
        });
    }

    static findFirstVisibleLeafColumn(columns) {
        const sortedGroups = [...columns].sort((a, b) => {
            const aHasFreeze = !!(a.freeze && String(a.freeze).trim() !== '');
            const bHasFreeze = !!(b.freeze && String(b.freeze).trim() !== '');
            return aHasFreeze === bHasFreeze ? 0 : aHasFreeze ? -1 : 1;
        });
        for (const group of sortedGroups) {
            if (group.columns && Array.isArray(group.columns)) {
                for (const col of group.columns) {
                    if (col.columns) {
                        const found = this.findFirstVisibleLeafColumn([col]);
                        if (found) return found;
                    } else if (col.visible !== false) {
                        return {
                            label: col.label,
                            fieldName: col.fieldName,
                            type: col.type,
                        };
                    }
                }
            }
        }
        return null;
    }
}
