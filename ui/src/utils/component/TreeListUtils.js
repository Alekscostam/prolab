import {ViewDataCompUtils} from './ViewDataCompUtils';
import {compress} from 'int-compress-string/src';
import {EditSpecUtils} from '../EditSpecUtils';
import EditSpecService from '../../services/EditSpecService';
import EntryResponseHelper from '../helper/EntryResponseHelper';
import { v4 as uuidv4 } from 'uuid';

export class TreeListUtils extends ViewDataCompUtils {
    static editSpecService = new EditSpecService();

    static getEditSpecService() {
        return TreeListUtils.editSpecService;
    }

    static conditionForTrueValue(value) {
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'number') {
            return value === 1;
        }
        if (typeof value === 'string') {
            return (
                value === 'T' ||
                value === 't' ||
                value === '1' ||
                value.toLowerCase() === 'true' ||
                value.toLowerCase() === 'tak'
            );
        }
        return value;
    }

    static paintDatas = (datas) => {
        datas.forEach((data) => {
            this.recursionPainting(data, 100, datas);
        });
        return datas;
    };

    static recursionPainting = (data, value, datas) => {
        if (!data._LINE_COLOR_GRADIENT) {
            data._LINE_COLOR_GRADIENT = [value];
        } else {
            data._LINE_COLOR_GRADIENT.push(value);
        }
        const childrens = datas.filter((el) => {
            if (!data._ID) {
                return false;
            }
            return data._ID === el._ID_PARENT;
        });
        if (childrens.length) {
            childrens.forEach((children) => {
                this.recursionPainting(children, value - 10, datas);
            });
        }
    };
    static findAllDescendants(tree, parentId) {
        const descendants = [];
        function findChildren(parentId) {
            const children = tree.filter((node) => node._ID_PARENT === parentId);
            children.forEach((child) => {
                descendants.push(child);
                findChildren(child._ID);
            });
        }
        findChildren(parentId);
        return descendants;
    }
    static removeLineColorGradient(array) {
        array.forEach(element => {
            delete element._LINE_COLOR_GRADIENT;
            if (Array.isArray(element.children)) {
                this.removeLineColorGradient(element.children);
            }
        });
    }
    static elementsToCalculate = (startIndex, allTheElements) => {
        const array = [];
        const parent = allTheElements.find((el) => {
            return el._ID === startIndex;
        });
        array.push(parent);
        TreeListUtils.recursionElementTocalculate(parent, array, allTheElements);
        return array;
    };

    static recursionElementTocalculate = (parent, array, allTheElements) => {
        allTheElements.forEach((el) => {
            if (el._ID_PARENT === parent._ID) {
                array.push(el);
                this.recursionElementTocalculate(el, array, allTheElements);
            }
        });
    };

    static openEditSpec = (
        viewId,
        parentId,
        recordIds,
        currentBreadcrumb,
        handleUnblockUiCallback,
        showErrorMessagesCallback
    ) => {
        TreeListUtils.getEditSpecService()
            .getViewEntry(viewId, parentId, recordIds, null)
            .then((entryResponse) => {
                EntryResponseHelper.run(
                    entryResponse,
                    () => {
                        if (!!entryResponse.next) {
                            const compressedRecordId = compress(recordIds);
                            EditSpecUtils.navToEditSpec(viewId, parentId, compressedRecordId, currentBreadcrumb);
                        } else {
                            handleUnblockUiCallback();
                        }
                    },
                    () => handleUnblockUiCallback(),
                    () => handleUnblockUiCallback()
                );
            })
            .catch((err) => {
                showErrorMessagesCallback(err);
            });
    };

    static isKindViewSpec(parsedGridView) {
        return parsedGridView?.viewInfo?.kindView === 'ViewSpec';
    }

    //utworzenie request body dla listy podpowiedzi
    static createBodyToEditList(editData) {
        let arrayTmp = [];
        for (const item in editData) {
            const elementTmp = {
                fieldName: item,
                value: editData[item],
            };
            arrayTmp.push(elementTmp);
        }
        return {data: arrayTmp};
    }

    //wyszukanie w wybranym wierszu specyfikacji
    //poprzez zwrócenie obiektu callbacka wartości pola o nazwie :searchFieldName
    static searchField(editData, searchFieldName, callback) {
        callback({value: editData[searchFieldName]});
        return;
    }

    static sortTreeByParameter(items, parentId = 0, order = 'asc', field = '_ORDER', result = []) {
        const children = items
            .filter(item => item._ID_PARENT === parentId)
            .sort((a, b) => {
                if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
                if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
                return 0;
            });
        children.forEach(child => {
            result.push(child);
            this.sortTreeByParameter(items, child._ID, order, field, result);
        });
        return result;
    }

    static addSelectionColumn(listColumns, options = {}) {
        const defaultColumn = {
            width: options.width || 60,
            id: 0,
            checkbox: true,
            visible: true,
            freeze: 'left',
            fixed: true,
            disabledEditing: true,
            fieldName: 'selection',
            type: 'string',
            label: '',
            isFilter: false,
            isGroup: false,
            isSort: false,
        };
        listColumns.unshift(defaultColumn);
        return listColumns;
    }

    static addOrderColumn(listColumns, visible) {
        const defaultColumn = {
            width: 0,
            checkbox: false,
            visible: visible,
            disabledEditing: true,
            fieldName: '_ORDER',
            type: 'string',
            isSort: true,
            sortOrder: "asc",
            sortIndex: 0

        };
        listColumns.push(defaultColumn);
        return listColumns;
    }

    static addUuidColumn(listColumns){
        const uuidColumn = {
            id: 0,
            visible: false,
            fieldName:  'uuid-'+ uuidv4(),
            label: '',
            isFilter: false,
            isGroup: false,
            isSort: false,
        };
        listColumns.push(uuidColumn);
    }
    static createSelectionColumn(listColumns, parsedGridViewData) {
        const width = this.calculateWidthOfSelectionColumn(parsedGridViewData);     
        return this.addSelectionColumn(listColumns, {width});
    }

    static createSelectionStaticColumn(listColumns) {     
        return this.addSelectionColumn(listColumns);
    }

    static calculateWidthOfSelectionColumn(parsedGridViewData) {
        const longestBranch = this.findLongestBranchLength(parsedGridViewData);
        if (longestBranch === 0 || longestBranch === 1 || longestBranch === 2) {
            return '60px';
        }
        if(longestBranch=== null){
            return "60px"
        }
        return longestBranch * 25 + 'px';
    }

    static findLongestBranchLength(nodes) {
        const nodeMap = new Map(nodes.map((node) => [node._ID, node]));
        const pathLengths = new Array(nodes.length).fill(0);
        function findPathLength(nodeId) {
            const node = nodeMap.get(nodeId);
            if (!node._ID_PARENT) {
                return 1;
            }
            const parentPathLength = findPathLength(node._ID_PARENT);
            return parentPathLength + 1;
        }
        nodes.forEach((node) => (pathLengths[node._ID] = findPathLength(node._ID)));
        let highestValue = null;
        for (const key in pathLengths) {
            const value = pathLengths[key];
            if (highestValue === null || value > highestValue) {
                highestValue = value;
            }
        }
        return highestValue;
    }
}
