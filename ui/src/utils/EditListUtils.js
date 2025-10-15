import hash from 'object-hash';
import {v4 as uuidv4} from 'uuid';
import EditRowUtils from './EditRowUtils';
import {StringUtils} from './StringUtils';

export class EditListUtils {
    static transformBySetFields(rowData, setFields) {
        let fieldKeys = setFields.map((item) => {
            return item.fieldList;
        });
        let defaultSelectedRowKeysTmp = [];
        for (let keyField in fieldKeys) {
            let newObject = {};
            for (let keyRow in rowData) {
                if (fieldKeys[keyField] === keyRow) {
                    newObject[keyRow] = '' + rowData[keyRow];
                    break;
                }
            }

            defaultSelectedRowKeysTmp.push(newObject);
        }
        return defaultSelectedRowKeysTmp;
    }
    static findIdIndexFromSelectedRowData(arr = []) {
        const index = arr.findIndex((el) => 'ID' in el);
        const result = index !== -1 ? index : 0;
        return result;
    }
    static determineKey(data) {
        if (!data || data.length === 0) return null;
        const firstElement = data[0];
        if (firstElement.hasOwnProperty('ID')) {
            console.log('Key is ID');
        } else {
            const firstKey = Object.keys(firstElement)[0];
            console.log('Key is first element from data: ', firstKey);
        }
    }
    static findIndexFromFields(fields = []) {
        const index = fields.findIndex((el) => el.fieldList === 'ID');
        const result = index !== -1 ? index : 0;
        return result;
    }
    static calculateCRC(objToHash) {
        if (objToHash) {
            if (Array.isArray(objToHash)) {
                if (objToHash.length > 1) {
                    const result = objToHash[this.findIdIndexFromSelectedRowData(objToHash)];
                    const calculatedCRC = hash([result]);
                    return calculatedCRC;
                }
                const calculatedCRC = hash(objToHash);
                return calculatedCRC;
            } else {
                const calculatedCRC = hash([objToHash]);
                return calculatedCRC;
            }
        }
        const calculatedCRC = hash(objToHash);
        return calculatedCRC;
    }

    static calculateCRCBySetFields(rowData, setFields) {
        const objToHash = EditListUtils.transformBySetFields(rowData, setFields);
        const calculateCRC = EditListUtils.calculateCRC(objToHash);
        return calculateCRC;
    }
    static calculateCrcById(rowData) {
        let result = undefined;
        if (!rowData || typeof rowData !== 'object') {
            return result;
        }
        if ('ID' in rowData) {
            result = [{ID: rowData.ID}];
        } else {
            const firstKey = Object.keys(rowData)[0];
            result = [{[firstKey]: rowData[firstKey]}];
        }
        const calculateCRC = EditListUtils.calculateCRC(result);
        return calculateCRC;
    }
    static addUuidToFields(editData) {
        editData.editFields?.forEach((editField) => {
            editField?.panels?.forEach((panel) => {
                panel?.groups?.forEach((group) => {
                    group.uuid = uuidv4();
                });
            });
        });
    }
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

    static searchField(editData, searchFieldName, callback) {
        callback({value: editData[searchFieldName]});
        return;
    }
    static selectedRowData(e, prevSelectedRowData, multiSelect) {
        const addMode = !!(e.currentSelectedRowKeys.length !== 0);
        const currentSelectedRowsData = e.selectedRowsData;
        const selectedRowsKeys = e.selectedRowKeys;
        let transformedRowsData = [];
        let transformedRowsCRC = [];
        if (multiSelect) {
            transformedRowsData = prevSelectedRowData;
            transformedRowsCRC = selectedRowsKeys;
            if (addMode) {
                const foundedElementToAdd = currentSelectedRowsData.find(
                    (el) => el.CALC_CRC === e.currentSelectedRowKeys[0]
                );
                transformedRowsData.push(foundedElementToAdd);
            } else {
                const foundedElementToRemove = prevSelectedRowData.find(
                    (el) => el.CALC_CRC === e.currentDeselectedRowKeys[0]
                );
                transformedRowsData = transformedRowsData.filter(
                    (el) => el.CALC_CRC !== foundedElementToRemove.CALC_CRC
                );
            }
        } else {
            for (let selectedRowData in currentSelectedRowsData) {
                let selectedRow = currentSelectedRowsData[selectedRowData];
                transformedRowsData.push(selectedRow);
                transformedRowsCRC.push(selectedRow.CALC_CRC);
            }
        }
        return {
            rowsData: transformedRowsData,
            rowsCrc: transformedRowsCRC,
        };
    }
    static convertArrayToObject(arr) {
        const result = {};
        arr.forEach((obj) => {
            const [key, value] = Object.entries(obj)[0];
            result[key] = value;
        });
        return result;
    }
    static getFieldValues(foundField, responseView) {
        const {gridOptions, options} = responseView || {};
        let separator = '';
        if (gridOptions?.multiSelect) {
            separator = options?.separatorJoin || ',';
        } else {
            separator = null;
        }
        const value = String(foundField.value ?? '');

        if (!separator || StringUtils.isBlank(separator)) {
            return [value];
        }

        return value.split(separator);
    }
    static canPushRowData(value) {
        if (StringUtils.isBlank(value)) {
            return false;
        }
        if (typeof value !== 'number' && !(value instanceof Date)) {
            if (StringUtils.isEmpty(value)) {
                return false;
            }
        }
        return true;
    }
    static getCountSeparatorGeneric(responseView, data, searchFn) {
        const setFields = structuredClone(responseView.setFields);
        let countSeparator = 0;

        setFields.forEach((field) => {
            searchFn(data, field.fieldEdit, (foundField) => {
                if (EditListUtils.canPushRowData(foundField.value)) {
                    const fieldValues = EditListUtils.getFieldValues(foundField, responseView);
                    if (fieldValues.length > countSeparator) {
                        countSeparator = fieldValues.length;
                    }
                }
            });
        });

        return countSeparator;
    }

    static getCountSeparatorByEditData(responseView, editData) {
        return this.getCountSeparatorGeneric(responseView, editData, EditRowUtils.searchField);
    }

    static getCountSeparatorByRowData(responseView, rowData) {
        return this.getCountSeparatorGeneric(responseView, rowData, EditListUtils.searchField);
    }

    static getIdFieldOrFirst(setFields) {
        if (!Array.isArray(setFields) || setFields.length === 0) {
            return [];
        }

        const idField = setFields.find((f) => f.fieldList === 'ID');
        return idField ? [idField] : [setFields[0]];
    }
}

export default EditListUtils;
