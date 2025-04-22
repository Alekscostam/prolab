import hash from 'object-hash';
import {v4 as uuidv4} from 'uuid';

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

    static calculateCRC(objToHash) {
        if (objToHash) {
            if (Array.isArray(objToHash)) {
                if (objToHash.length > 1) {
                    const result = objToHash[0];
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
    static selectedRowData(e, setFields, prevSelectedRowData, multiSelect) {
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
                const transformedSingleRowData = this.transformBySetFields(foundedElementToAdd, setFields);
                const CALC_CRC = this.calculateCRC(transformedSingleRowData[0]);
                transformedSingleRowData[0].CALC_CRC = CALC_CRC;
                transformedRowsData.push(transformedSingleRowData);
            } else {
                const foundedElementToRemove = prevSelectedRowData.find(
                    (el) => el[0].CALC_CRC === e.currentDeselectedRowKeys[0]
                );
                transformedRowsData = transformedRowsData.filter(
                    (el) => el[0].CALC_CRC !== foundedElementToRemove[0].CALC_CRC
                );
            }
        } else {
            for (let selectedRowData in currentSelectedRowsData) {
                let selectedRow = currentSelectedRowsData[selectedRowData];
                let transformedSingleRowData = this.transformBySetFields(selectedRow, setFields);
                let CALC_CRC = this.calculateCRC(transformedSingleRowData);
                transformedRowsData.push(transformedSingleRowData);
                transformedRowsCRC.push(CALC_CRC);
            }
        }
        return {
            rowsData: transformedRowsData,
            rowsCrc: transformedRowsCRC,
        };
    }
    static prepareElementToStore(currentSelectedRowsData) {
        const toStoreElements = structuredClone(currentSelectedRowsData);
    }
}

export default EditListUtils;
