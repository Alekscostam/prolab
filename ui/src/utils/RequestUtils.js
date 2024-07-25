import moment from "moment/moment";
import { ColumnType } from "../model/ColumnType";

export class RequestUtils {
    static createObjectDataToRequest(state) {
        const editData = state.editData;
        const arrayTmp = [];
        for (let editField of editData?.editFields) {
            for (let panel of editField.panels) {
                for (let group of panel.groups) {
                    for (let field of group.fields) {
                        field = this.convertFieldsPerType(field);
                        const elementTmp = {
                            fieldName: field.fieldName,
                            value: field.value,
                        };
                        arrayTmp.push(elementTmp);
                    }
                }
            }
        }
        return {data: arrayTmp};
    }
    static  createObjectToCalculate(datas) {
        const data = [];
        let arrTemp = [];
        datas?.forEach((fields) => {
            arrTemp = [];
            Object.entries(fields).forEach((field) => {
                const elementTmp = {
                    fieldName: field[0],
                    value: field[1],
                };
                arrTemp.push(elementTmp);
            });
            data.push(arrTemp);
        });
        return {data: data};
    }
    static convertFieldsPerType(field) {
        try {
            if (field?.type) {
                switch (field.type) {
                    case ColumnType.B:
                        field.value = field.value === 0 || field.value === '0' || !field.value ? 0 : 1;
                        break;
                    case ColumnType.L:
                        field.value = field.value === 'N' || !field.value ? 'N' : 'T';
                        break;
                    case ColumnType.D:
                        field.value = this.dateFormatAndKeepCorrectness(field.value, 'YYYY-MM-DD');
                        break;
                    case ColumnType.E:
                        field.value = this.dateFormatAndKeepCorrectness(field.value, 'YYYY-MM-DD HH:mm');
                        break;
                    case ColumnType.T:
                        field.value = this.dateFormatAndKeepCorrectness(field.value, 'HH:mm');
                        break;
                    default:
                }
            }
        } catch (err) {}
        return field;
    }
    static dateFormatAndKeepCorrectness(fieldValue, format) {
        if (fieldValue === null || fieldValue === '' || !(fieldValue instanceof Date && !isNaN(fieldValue))) {
            return '';
        }
        return moment(new Date(fieldValue)).format(format);
    }
}