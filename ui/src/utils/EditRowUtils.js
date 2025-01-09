import {ColumnType} from '../enum/ColumnType';
import moment from 'moment';
import Constants from './Constants';
import {ArrayUtils} from './ArrayUtils';

export class EditRowUtils {
    static searchField(editData, searchFieldName, callback) {
        editData.editFields?.forEach((editField) => {
            editField?.panels?.forEach((panel) => {
                panel?.groups?.forEach((group) => {
                    group?.fields?.forEach((field) => {
                        if (field.fieldName === searchFieldName) {
                            callback(field);
                            return;
                        }
                    });
                });
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

    static isVisibleField = (field) => {
        const hidden = !!field.hidden;
        const visible = !!field.visible;
        if (hidden && visible) {
            return false;
        }
        if (hidden === false && visible === false) {
            return false;
        }
        if (hidden === false && visible) {
            return true;
        } else return false;
    };

    static hasAnyVisibleField(group) {
        const visibleFields = group?.fields.filter((f) => this.isVisibleField(f));
        return !ArrayUtils.isEmpty(visibleFields);
    }

    static hasAnyToFillField(editData) {
        return editData?.editFields
            .flatMap((editField) => editField.panels)
            ?.some((panel) =>
                panel?.groups?.some((group) =>
                    group?.fields?.some((field) => field.autoFill && this.isVisibleField(field))
                )
            );
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
            for (let panel of editField.panels) {
                for (let group of panel.groups) {
                    for (let field of group.fields) {
                        switch (field.type) {
                            case ColumnType.D:
                                field.value = new Date(moment(field.value, Constants.DATE_FORMAT.YYYY_MM_DD));
                                break;
                            case ColumnType.E:
                                field.value = new Date(moment(field.value, Constants.DATE_FORMAT.YYYY_MM_DD_HHmm));
                                break;
                            case ColumnType.T:
                                field.value = new Date(moment(field.value, Constants.DATE_FORMAT.HHmm));
                                break;
                            default:
                        }
                    }
                }
            }
        }
        return editDataResponse;
    }
}

export default EditRowUtils;
