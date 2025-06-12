import {Column} from 'devextreme-react/cjs/data-grid';
import {ArrayUtils} from './ArrayUtils';
import {StringUtils} from './StringUtils';

export class ColumnUtils {
    static applyFilters(filtersIn, column) {
        filtersIn = filtersIn || [];
        if (!ArrayUtils.isEmpty(filtersIn)) {
            const filterFounded = this.getFilter(filtersIn, column?.name);
            if (filterFounded) {
                column.selectedFilterOperation = filterFounded[1];
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

    static getFixed(columnDefinition) {
        return columnDefinition.freeze !== undefined && columnDefinition?.freeze !== null
            ? columnDefinition?.freeze?.toLowerCase() === 'left' || columnDefinition?.freeze?.toLowerCase() === 'right'
            : false;
    }
    static getFixedPosition(columnDefinition) {
        return !!columnDefinition.freeze ? columnDefinition.freeze?.toLowerCase() : null;
    }
}
