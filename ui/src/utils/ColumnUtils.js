import {Column} from 'devextreme-react/cjs/data-grid';
import {ArrayUtils} from './ArrayUtils';
import {StringUtils} from './StringUtils';
import {DateUtils} from './DateUtlis';

export class ColumnUtils {
    static applyFilters(filtersIn = [], column) {
        if (!ArrayUtils.isEmpty(filtersIn)) {
            const filtersFounded = this.getFiltersForColumn(filtersIn, column?.name);
            if (filtersFounded?.length !== 0) {
                if (filtersFounded?.length === 1) {
                    const filterFounded = filtersFounded[0];
                    column.selectedFilterOperation = filterFounded[1];
                    column.filterValue = filterFounded[2];
                } else {
                    const filterFirst = filtersFounded[0];
                    const filterSecond = filtersFounded[1];
                    column.selectedFilterOperation = 'between';
                    column.filterValue = [filterFirst[2], filterSecond[2]];
                }
            }
        }
    }
    static getFilter(filtersIn = [], columnName) {
        if (columnName) {
            return filtersIn?.find(
                (filter) => (Array.isArray(filter) && filter[0] === columnName) || filter === columnName
            );
        }
        return null;
    }
    static getFiltersForColumn(filtersIn = [], columnName) {
        if (columnName) {
            return filtersIn?.filter(
                (filter) => (Array.isArray(filter) && filter[0] === columnName) || filter === columnName
            );
        }
        return null;
    }

    static getValueFromFilter(filtersIn = [], columnName) {
        const filtersFounded = this.getFiltersForColumn(filtersIn, columnName);
        if (filtersFounded?.length !== 0) {
            if (filtersFounded?.length === 1) {
                const filterFounded = filtersFounded[0];
                if (DateUtils.containsDate(filterFounded[2])) {
                    return new Date(filterFounded[2]);
                }
                return filterFounded[2];
            } else {
                const filterFirst = filtersFounded[0];
                const filterSecond = filtersFounded[1];
                if (DateUtils.containsDate(filterFirst[2])) {
                    return [new Date(filterFirst[2]), new Date(filterSecond[2])];
                }
                return [filterFirst[2], filterSecond[2]];
            }
        }
        return null;
    }

    static getOperationFromFilter(filtersIn = [], columnName) {
        const filtersFounded = this.getFiltersForColumn(filtersIn, columnName);
        if (filtersFounded?.length !== 0) {
            if (filtersFounded?.length === 1) {
                const filterFounded = filtersFounded[0];
                return filterFounded[1];
            } else {
                return 'between';
            }
        }
        return null;
    }

    static filterColumnPair(filters, columns) {
        if (!Array.isArray(filters)) return [];

        let result = [];

        if (Array.isArray(filters[0])) {
            for (const filter of filters) {
                if (Array.isArray(filter)) {
                    result = result.concat(this.filterColumnPair(filter, columns));
                }
            }
        } else {
            let columnDataField = undefined;
            if (typeof filters.columnIndex === 'number') {
                columnDataField = columns[filters.columnIndex]?.dataField;
            } else {
                columnDataField = columns[filters[0]?.columnIndex]?.dataField;
            }
            const element = {
                field: columnDataField,
                operation: filters[1],
                value: filters[2],
            };
            result.push(element);
        }
        return result;
    }

    static replaceFunctionsWithDataField(filters, columns) {
        if (!Array.isArray(filters)) return filters;

        const isFunctionWithColumnIndex = (item) => typeof item === 'function' && typeof item.columnIndex === 'number';

        const getDataField = (columnIndex) => columns[columnIndex]?.dataField;

        const replaceSingleCondition = () => {
            if (typeof filters[0] === 'function' && typeof filters.columnIndex === 'number') {
                filters[0] = getDataField(filters.columnIndex);
                return filters;
            }

            if (isFunctionWithColumnIndex(filters[0])) {
                filters[0] = getDataField(filters[0].columnIndex);
                return filters;
            }

            return null;
        };

        const replacedSingle = replaceSingleCondition();
        if (replacedSingle) return replacedSingle;

        return filters.map((item) => {
            if (!Array.isArray(item)) return item;

            const replaced = this.replaceFunctionsWithDataField(item, columns);

            for (const key in item) {
                if (!Number.isInteger(+key)) {
                    replaced[key] = item[key];
                }
            }

            if (typeof item[0] === 'function') {
                const columnIndex = item.columnIndex ?? item[0]?.columnIndex;
                if (typeof columnIndex === 'number') {
                    const columnDataField = getDataField(columnIndex);
                    if (columnDataField) replaced[0] = columnDataField;
                }
            }

            return replaced;
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

    static generateGroupColumns(viewColumns) {
        const renderColumns = (group, keyPrefix = '') => {
            if (group.isBand && Array.isArray(group.columns)) {
                return (
                    <Column
                        visible={group.visible}
                        alignment='center'
                        fixed={this.getFixed(group)}
                        fixedPosition={this.getFixedPosition(group)}
                        key={keyPrefix + '-column-group'}
                        caption={group.caption}
                        isBand={true}
                    >
                        {group.columns.map((child, idx) => renderColumns(child, keyPrefix + '-' + idx))}
                    </Column>
                );
            } else {
                let sortOrder;
                if (!!group?.sortIndex && group?.sortIndex > 0 && !!group?.sortOrder) {
                    sortOrder = group?.sortOrder?.toLowerCase();
                }
                return (
                    <Column
                        visible={group.visible}
                        key={keyPrefix + '-column'}
                        dataField={group.fieldName}
                        sortOrder={sortOrder}
                        caption={group.caption}
                        sortIndex={group?.sortIndex}
                    />
                );
            }
        };
        const columns = viewColumns.map((group, index) => renderColumns(group, 'col-' + index));
        return columns;
    }

    static filteredResults(array = [], filters = []) {
        for (let index = 0; index < filters.length; index++) {
            const filter = filters[index];
            const allTheElements = filters.filter((el) => el.field === filter.field);
            const operation = allTheElements?.length === 2 ? 'between' : filter.operation;
            switch (operation) {
                case 'contains':
                    array = array.filter((el) =>
                        el[filter.field]?.toString().toLowerCase().includes(filter.value.toLowerCase())
                    );
                    break;
                case 'notcontains':
                    array = array.filter(
                        (el) => !el[filter.field]?.toString().toLowerCase().includes(filter.value.toLowerCase())
                    );
                    break;
                case 'equals':
                case '=':
                    array = array.filter(
                        (el) => el[filter.field]?.toString().toLowerCase() === filter.value.toLowerCase()
                    );
                    break;
                case 'notEquals':
                case '<>':
                    array = array.filter(
                        (el) => el[filter.field]?.toString().toLowerCase() !== filter.value.toLowerCase()
                    );
                    break;
                case 'startsWith':
                    array = array.filter((el) =>
                        el[filter.field]?.toString().toLowerCase().startsWith(filter.value.toLowerCase())
                    );
                    break;
                case 'endsWith':
                    array = array.filter((el) =>
                        el[filter.field]?.toString().toLowerCase().endsWith(filter.value.toLowerCase())
                    );
                    break;
                case '>=':
                case 'greaterThanOrEqual':
                    array = array.filter((el) => {
                        const field = el[filter.field];
                        if (field) {
                            const transformedDate = new Date(field);
                            const filterDate = new Date(filter.value);
                            return transformedDate >= filterDate;
                        }
                        return false;
                    });
                    break;
                case '>':
                case 'greaterThan':
                    array = array.filter((el) => {
                        const field = el[filter.field];
                        if (field) {
                            const transformedDate = new Date(field);
                            const filterDate = new Date(filter.value);
                            return transformedDate > filterDate;
                        }
                        return false;
                    });
                    break;
                case '<=':
                case 'lessThanOrEqual':
                    array = array.filter((el) => {
                        const field = el[filter.field];
                        if (field) {
                            const transformedDate = new Date(field);
                            const filterDate = new Date(filter.value);
                            return transformedDate <= filterDate;
                        }
                        return false;
                    });
                    break;
                case '<':
                case 'lessThan':
                    array = array.filter((el) => {
                        const field = el[filter.field];
                        if (field) {
                            const transformedDate = new Date(field);
                            const filterDate = new Date(filter.value);
                            return transformedDate < filterDate;
                        }
                        return false;
                    });
                    break;
                case 'between':
                    array = array.filter((el) => {
                        const field = el[filter.field];
                        if (StringUtils.isEmpty(field)) {
                            return false;
                        }
                        const elementOne = allTheElements[0];
                        const elementTwo = allTheElements[1];
                        const date = new Date(field);
                        const from = new Date(elementOne.value);
                        const to = new Date(elementTwo.value);
                        return date >= from && date <= to;
                    });
                    break;
                default:
                    console.warn(`Nieobsługiwana operacja filtra: ${filter.operation}, wartość: ${filter.value}`);
                    break;
            }
        }
        return array;
    }

    static getFixed(columnDefinition) {
        return columnDefinition.freeze !== undefined && columnDefinition?.freeze !== null
            ? columnDefinition?.freeze?.toLowerCase() === 'left' || columnDefinition?.freeze?.toLowerCase() === 'right'
            : false;
    }
    static getFixedPosition(columnDefinition) {
        return !!columnDefinition.freeze ? columnDefinition.freeze?.toLowerCase() : null;
    }
}
