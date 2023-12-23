import hash from 'object-hash';
import ConsoleHelper from './ConsoleHelper';

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
        const calculateCRC = EditListUtils.calculateCRC(objToHash);
        ConsoleHelper('objToHash = ', JSON.stringify(objToHash) + ' hash = ' + calculateCRC);
        return calculateCRC;
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
}

export default EditListUtils;
