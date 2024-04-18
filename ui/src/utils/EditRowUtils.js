import {ColumnType} from '../model/ColumnType';
import MockService from '../services/MockService';
import moment from 'moment';

export class EditRowUtils {
    static searchField(editData, searchFieldName, callback) {
        editData.editFields?.forEach((groupFields) => {
            groupFields?.fields?.forEach((field) => {
                if (field.fieldName === searchFieldName) {
                    callback(field);
                    return;
                }
            });
        });
    }

    static searchAndAutoFill(editData, searchFieldName, newFieldValue, autoFillOnlyEmpty) {
        EditRowUtils.searchField(editData, searchFieldName, (field) => {
            if (autoFillOnlyEmpty) {
                if (field.value === null || field.value === '' || field.value.trim() === '') {
                    field.value = newFieldValue;
                }
            } else {
                field.value = newFieldValue;
            }
        });
    }

    static searchAndRefreshVisibility(editData, searchFieldName, hidden) {
        this.searchField(editData, searchFieldName, (field) => {
            field.hidden = hidden;
        });
    }

    static getType(type) {
        switch (type) {
            case ColumnType.C: //C – Znakowy
                return 'text_field_';
            case ColumnType.P: //C – hasło
                return 'password_';
            case ColumnType.N: //N – Numeryczny/Liczbowy
                return 'number_field_';
            case ColumnType.B: //B – Logiczny (0/1)
                return 'bool_field_';
            case ColumnType.L: //L – Logiczny (T/N)
                return 'yes_no_field_';
            case ColumnType.D: //D – Data
                return 'date_';
            case ColumnType.E: //E – Data + czas
                return 'date_time_';
            case ColumnType.T: //T – Czas
                return 'time_';
            case ColumnType.O: //O – Opisowe
                return 'editor_';
            case ColumnType.I: //I – Obrazek
            case ColumnType.IM: //IM – Obrazek multi
                return 'image_';
            case ColumnType.H: //H - Hyperlink
                return 'link_';
            default:
                return 'text_field_';
        }
    }

    static convertEditResponse(editDataResponse) {
        for (let editField of editDataResponse?.editFields) {
            for (let field of editField.fields) {
                if (field?.type) {
                    field.value = MockService.getFieldValueOrMock(field.value, 'value');
                    switch (field.type) {
                        case ColumnType.D:
                            field.value = new Date(moment(field.value, 'YYYY-MM-DD'));
                            break;
                        case ColumnType.E:
                            field.value = new Date(moment(field.value, 'YYYY-MM-DD HH:mm'));
                            break;
                        case ColumnType.T:
                            field.value = new Date(moment(field.value, 'HH:mm'));
                            break;
                        default:
                    }
                }
            }
        }
        return editDataResponse;
    }
}

export default EditRowUtils;
