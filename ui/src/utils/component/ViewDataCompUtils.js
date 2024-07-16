import Constants from '../Constants';
import moment from 'moment';
import ConsoleHelper from '../ConsoleHelper';
import LocUtils from '../LocUtils';
import {ColumnType} from '../../model/ColumnType';

export class ViewDataCompUtils {
    static getOpButton(operations, type) {
        for (let button in operations) {
            if (
                operations[button] &&
                operations[button].type &&
                operations[button].type.toUpperCase() === type.toUpperCase()
            ) {
                return operations[button];
            }
        }
        return null;
    }
    static getOrCreateOpButton(operations, labels, type, alternativeText) {
        operations = operations || [];
        const result = this.getOpButton(operations, type);
        if (result) {
            return result;
        }
        operations.push({type: type, label: LocUtils.loc(labels, type, alternativeText)});
        return this.getOpButton(operations, type);
    }
    static getOpButtonWithTranslation(operations, labels, type, alternativeText) {
        operations = operations || [];
        const result = this.getOpButton(operations, type);
        if (result) {
            result.label = LocUtils.loc(labels, type, alternativeText);
            return result;
        }
        return null;
    }

    static getURLParameters(paramName) {
        let sURL = window.document.URL.toString();
        if (sURL.indexOf('?') > 0) {
            let arrParams = sURL.split('?');
            let arrURLParams = arrParams[1].split('&');
            let arrParamNames = new Array(arrURLParams.length);
            let arrParamValues = new Array(arrURLParams.length);
            let i;
            for (i = 0; i < arrURLParams.length; i++) {
                let sParam = arrURLParams[i].split('=');
                arrParamNames[i] = sParam[0];
                if (sParam[1] !== '') arrParamValues[i] = unescape(sParam[1]);
                else arrParamValues[i] = null;
            }
            for (i = 0; i < arrURLParams.length; i++) {
                if (arrParamNames[i] === paramName) {
                    // alert("Parameter:" + arrParamValues[i]);
                    return arrParamValues[i];
                }
            }
            return null;
        }
    }

    static getViewIdFromURL() {
        let url = window.document.URL.toString();
        var regexp = new RegExp('^.+\\/grid-view\\/([0-9]+)([\\?|\\/]+.*)?$', 'g');
        let match = regexp.exec(url);
        if (match) {
            return match[1];
        }
    }

    static specifyColumnType(type) {
        if (type) {
            switch (type) {
                case ColumnType.C:
                    return 'string';
                case ColumnType.N:
                    return 'number';
                case ColumnType.B:
                    return 'boolean';
                case ColumnType.L:
                    return 'boolean';
                case ColumnType.D:
                    return 'date';
                case ColumnType.E:
                    return 'datetime';
                case ColumnType.T:
                    return 'string'; // to niestety musi byc string dla pola time - bo devextreme nie radzi sobie z tym @link https://supportcenter.devexpress.com/ticket/details/t633188/datagrid-how-to-filter-data-by-time
                case ColumnType.O:
                case ColumnType.H:
                    return 'string';
                default:
                    return undefined;
            }
        }
        return undefined;
    }

    static specifyColumnFormat(format) {
        if (format) {
            switch (format) {
                case ColumnType.D:
                    return Constants.DATE_FORMAT.DATE_FORMAT;
                case ColumnType.E:
                    return Constants.DATE_FORMAT.DATE_TIME_FORMAT;
                case ColumnType.T:
                    return Constants.DATE_FORMAT.TIME_FORMAT;
                default:
                    return undefined;
            }
        }
        return undefined;
    }

    static specifyEditorOptions(format) {
        if (format) {
            switch (format) {
                case ColumnType.T:
                    return {type: 'time'};
                default:
                    return undefined;
            }
        }
        return undefined;
    }

    static conditionForTrueValueForLogicType(text) {
        return text === 'T' || text === 't';
    }

    static conditionForTrueValueForBoolType(text) {
        return text === '1' || text === 1;
    }

    static equalString(s1, s2) {
        if (
            (s1 === null || s1 === undefined || s1 === 'undefined') &&
            (s2 === null || s2 === undefined || s2 === 'undefined')
        ) {
            return true;
        }
        return s1 === s2;
    }

    static equalNumbers(n1, n2) {
        if (
            (n1 === null || n1 === undefined || n1 === 'undefined') &&
            (n2 === null || n2 === undefined || n2 === 'undefined')
        ) {
            // ConsoleHelper('equalNumbers: result=' + true + ' {' + n1 + ', ' + n2 + '}' );
            return true;
        }
        let num1, num2;
        if (typeof n1 === 'number') {
            num1 = n1;
        } else {
            num1 = parseInt(n1);
        }
        if (typeof n2 === 'number') {
            num2 = n2;
        } else {
            num2 = parseInt(n2);
        }
        return num1 === num2;
    }

    static notEqualNumbers(n1, n2) {
        return !ViewDataCompUtils.equalNumbers(n1, n2);
    }

    static getDefaultSortOrder(value) {
        if (value !== undefined && value !== null) {
            switch (value.toUpperCase()) {
                case true:
                    return 'asc';
                case false:
                    return 'desc';
                default:
                    return null;
            }
        }
        return null;
    }

    static getRealViewId(elementSubViewId, elementId) {
        return elementSubViewId ? elementSubViewId : elementId;
    }

    static calculateCustomFilterExpression(value, operations, target, columnDefinition) {
        ConsoleHelper(
            'calculateFilterExpression:: value: %s operations: %s target: %s columnDefinition: %s',
            value,
            operations,
            target,
            JSON.stringify(columnDefinition)
        );
        try {
            if (columnDefinition.type === ColumnType.B) {
                value = value ? '1' : '0';
                return [[columnDefinition.fieldName, '=', value]];
            }
            if (columnDefinition.type === ColumnType.L) {
                value = value ? 'T' : 'N';
                return [[columnDefinition.fieldName, '=', value]];
            }
            if (!!columnDefinition) {
                if (operations === 'between') {
                    let dateFormatted1 = this.formatDateFilterExpression(columnDefinition.type, value[0]);
                    let dateFormatted2 = this.formatDateFilterExpression(columnDefinition.type, value[1]);
                    return this.customFilterExpression(operations, columnDefinition.fieldName, [
                        dateFormatted1,
                        dateFormatted2,
                    ]);
                } else {
                    const dateFormatted = this.formatDateFilterExpression(columnDefinition.type, value);
                    return this.customFilterExpression(
                        operations,
                        columnDefinition.fieldName,
                        dateFormatted,
                        columnDefinition
                    );
                }
            }
        } catch (err) {
            return undefined;
        }
    }
    static operationsColumnLength(operationsRecord,operationsRecordList){
        const result = 10 + (33 * operationsRecord.length + (operationsRecordList?.length > 0 ? 33 : 0)) ;
        if(result < 50)
              return 110  
        return result ;
    }
    
    static formatDateFilterExpression(type, value) {
        const dateMoment = moment(value);
        if (type === ColumnType.D) {
            return dateMoment.format(Constants.DATE_FORMAT.DATE_FORMAT_MOMENT);
        } else if (type === ColumnType.E) {
            return dateMoment.format(Constants.DATE_FORMAT.DATE_TIME_FORMAT_MOMENT);
        } else {
            throw new Error('BAD_TYPE');
        }
    }

    static customFilterExpression(operations, fieldName, dateFormatted) {
        switch (operations) {
            case '=':
                return [[fieldName, '=', dateFormatted]];
            case '<>':
                return [[fieldName, '<>', dateFormatted]];
            case '<':
                return [[fieldName, '<', dateFormatted]];
            case '>':
                return [[fieldName, '>', dateFormatted]];
            case '<=':
                return [[fieldName, '<=', dateFormatted]];
            case '>=':
                return [[fieldName, '>=', dateFormatted]];
            case 'between':
                return [[fieldName, '>=', dateFormatted[0]], 'and', [fieldName, '<=', dateFormatted[1]]];
            default:
                return undefined;
        }
    }

    static menuWidth(showButton, widthTmp) {
        if (showButton) {
            widthTmp += 35;
        } else {
            widthTmp += 5;
        }
        return widthTmp;
    }
}
