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
            case 'C': //C – Znakowy
                return 'text_field_';
            case 'P': //C – hasło
                return 'password_';
            case 'N': //N – Numeryczny/Liczbowy
                return 'number_field_';
            case 'B': //B – Logiczny (0/1)
                return 'bool_field_';
            case 'L': //L – Logiczny (T/N)
                return 'yes_no_field_';
            case 'D': //D – Data
                return 'date_';
            case 'E': //E – Data + czas
                return 'date_time_';
            case 'T': //T – Czas
                return 'time_';
            case 'O': //O – Opisowe
                return 'editor_';
            case 'I': //I – Obrazek
            case 'IM': //IM – Obrazek multi
                return 'image_';
            case 'H': //H - Hyperlink
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
                        case 'D':
                            field.value = new Date(moment(field.value, 'YYYY-MM-DD'));
                            break;
                        case 'E':
                            field.value = new Date(moment(field.value, 'YYYY-MM-DD HH:mm'));
                            break;
                        case 'T':
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
