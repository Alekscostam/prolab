import hash from 'object-hash';
import ConsoleHelper from './ConsoleHelper';
import { v4 as uuidv4 } from 'uuid';

export class EditListUtils {
    //data structure from API
    static transformBySetFields(rowData, setFields) {
        let fieldKeys = setFields.map((item) => {
            return item.fieldList;
        });
        let defaultSelectedRowKeysTmp = [];
        for (let keyField in fieldKeys) {
            let newObject = {};
            for (let keyRow in rowData) {
                if (fieldKeys[keyField] === keyRow) {
                    //cast all to string
                    newObject[keyRow] = '' + rowData[keyRow];
                    break;
                }
            }
            
            defaultSelectedRowKeysTmp.push(newObject);
        }
        return defaultSelectedRowKeysTmp;
    }

    static calculateCRC(objToHash) {
        const calculateCRC = hash(objToHash);
        return calculateCRC;
    }
    //data structure from API
    static calculateCRCBySetFields(rowData, setFields) {
        const objToHash = EditListUtils.transformBySetFields(rowData, setFields);
        objToHash.forEach(obj=>{
            obj.INDEX = rowData.INDEX
        })
        const calculateCRC = EditListUtils.calculateCRC(objToHash);
        ConsoleHelper('objToHash = ', JSON.stringify(objToHash) + ' hash = ' + calculateCRC);
        return calculateCRC;
    }
    static addUuidToFields(editData){
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
                transformedSingleRowData.forEach(obj=>{
                    obj.INDEX = foundedElementToAdd.INDEX
                })
                const CALC_CRC = this.calculateCRC(transformedSingleRowData);
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
            for (let selectedRows in currentSelectedRowsData) {
                let selectedRow = currentSelectedRowsData[selectedRows];
                let transformedSingleRowData = this.transformBySetFields(selectedRow, setFields);
                let CALC_CRC = this.calculateCRC(transformedSingleRowData);
                transformedRowsData.push(transformedSingleRowData);
                transformedRowsCRC.push(CALC_CRC);
            }
        }
        return {
            rowsData:transformedRowsData,
            rowsCrc:transformedRowsCRC,
        };
    }
}

export default EditListUtils;
