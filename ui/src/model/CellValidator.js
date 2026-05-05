import {StringUtils} from '../utils/StringUtils';
export const ResultType = {
    REGEX: 'REGEX',
    NOK: 'NOK',
    OK: 'OK',
    NONE: 'NONE',
};
export default class CellValidator {
    constructor(cellInfo, field) {
        this.dataField = cellInfo?.column?.dataField || '';
        this.data = cellInfo?.data || {};
        this.resultCode = '';
        this.pierwType = cellInfo?.data?.PIERW_TYP || '';
        this.field = field || {};
        this.required = field.requiredValue && field.visible && !field.hidden;
        this.text = cellInfo?.text;
        this.key = cellInfo?.key;
        this.cellInfo = cellInfo;
    }
    shouldRunListOfHintsIfPossible() {
        if (this.autoEditListOk()) {
            return true;
        }
        if (this.autoEditListNok()) {
            return true;
        }
        return false;
    }
    autoEditListOk() {
        return !!this.field?.validationReason?.autoEditListOk;
    }
    autoEditListNok() {
        return !!this.field?.validationReason?.autoEditListNok;
    }
    isValidField(inputValue) {
        let valueToCompare = this.text;
        if (!StringUtils.isBlank(inputValue)) {
            valueToCompare = inputValue;
        }
        try {
            if (this.required && valueToCompare === '') {
                return false;
            } else if (this.expressionSatisfiesCondition() && !this.test(valueToCompare)) {
                return false;
            } else {
                return true;
            }
        } catch (err) {
            return true;
        }
        return true;
    }
    getValidOperator(operator) {
        switch (operator) {
            case '=':
                return '===';
            case 'contains':
                return '===';
            case '>=':
                return '>=';
            case '<>':
                return '!==';
            case '<=':
                return '<=';
            case '<':
                return '<';
            case '>':
                return '>';
            case 'AND':
                return ' && ';
            case 'OR':
                return ' || ';
            default:
                return ' && ';
        }
    }
    getValidVerbalOperator(operator) {
        switch (operator) {
            case 'AND':
                return ' && ';
            case 'OR':
                return ' || ';
            default:
                return ' && ';
        }
    }

    getValidatorTextHtml(text) {
        const isValid = this.test(text);
        if (!isValid)
            return `<div id='text-box-validator-custom-message-red' style='width:100%; height=16px'>${this.getMessage()}</div>`;
        else return `<div id='text-box-validator-custom-message-empty' style='width:100%; height:16px'></div>`;
    }

    getValidatorDivHtml(text) {
        const isValid = this.test(text);
        if (!isValid)
            return (
                <div id='text-box-validator-custom-message-red' style={{width: '100%', height: '16px'}}>
                    {this.getMessage()}
                </div>
            );
        else return <div id='text-box-validator-custom-message-empty' style={{width: '100%', height: '16px'}}></div>;
    }

    buildCondition = (array) => {
        try {
            if (this.isEmptyOrNotArray(array)) {
                return null;
            }
            if (this.hasThreeElementsWithTwoStrings(array)) {
                const [column, operator, value] = array;
                return `data["${column}"] ${this.getValidOperator(operator)} "${value}"`;
            }
            let condition = '';
            array.forEach((item) => {
                if (Array.isArray(item)) {
                    const [column, operator, value] = item;
                    if (Array.isArray(column)) condition += `(${this.buildCondition(item)})`;
                    else condition += `data["${column}"] ${this.getValidOperator(operator)} "${value}"`;
                } else if (typeof item === 'string') condition += this.getValidOperator(item.toUpperCase());
            });
            return condition;
        } catch (ex) {
            console.error(ex);
        }
    };

    columnsFromConditions = (array) => {
        const arrayResult = [];
        try {
            if (this.isEmptyOrNotArray(array)) {
                return [];
            }
            if (this.hasThreeElementsWithTwoStrings(array)) {
                const column = array[0];
                arrayResult.push(column);
                return arrayResult;
            }
            array.forEach((item) => {
                if (Array.isArray(item)) {
                    const column = item[0];
                    if (Array.isArray(column)) arrayResult.concat(this.columnsFromConditions(item));
                    else arrayResult.push(column);
                }
            });
            return arrayResult;
        } catch (ex) {
            console.error(ex);
        }
    };
    isEmptyOrNotArray(array) {
        return !Array.isArray(array) || array.length === 0;
    }
    hasThreeElementsWithTwoStrings(array) {
        return array.length === 3 && typeof array[0] === 'string' && typeof array[1] === 'string';
    }

    evaluateCondition = (condition, data) => {
        try {
            return new Function('data', `return ${condition};`)(data);
        } catch (ex) {
            console.error('Bad condition', ex);
            return false;
        }
    };
    validateMessage = (columns) => {
        try {
            columns.forEach((column) => {
                const isNotExistsField = StringUtils.isBlank(this.data[column]);
                if (isNotExistsField) {
                    console.error('Column: ', column, ' for data: ', this.data, ' not exist');
                }
            });
        } catch (ex) {
            console.error('validation column data error', ex);
        }
    };
    expressionSatisfiesCondition() {
        if (this.shouldBeRegexUse()) {
            const columns = this.columnsFromConditions(
                structuredClone(this.field?.validationEdit?.conditionsRegex?.conditions)
            );
            this.validateMessage(columns);
            const condition = this.buildCondition(this.field?.validationEdit?.conditionsRegex?.conditions);
            const evaluationResult = this.evaluateCondition(condition, this.data);
            return evaluationResult;
        }
        return false;
    }
    shouldBeRegexUse() {
        return !StringUtils.isBlank(this.field?.validationEdit);
    }

    hasCondition() {
        const conditions = this.field?.validationEdit?.conditionsRegex?.conditions;
        if (!StringUtils.isBlank(this.field?.validationEdit?.conditionsRegex?.conditions)) {
            if (conditions.length !== 0) {
                return true;
            }
        }
        return false;
    }

    replaceData(data) {
        this.data = data;
    }

    test(text) {
        const regex = this.getRegex();
        if (StringUtils.isBlank(text) || text === '') return true;
        if (StringUtils.isBlank(regex) || regex === '') return true;
        const regexResult = new RegExp(regex).test(text);
        return regexResult;
    }

    testNok(text) {
        if (this.isCondidtionsNokExists()) {
            return this.testReason(text, this.getCondidtionsNok());
        }
        return false;
    }
    testOk(text) {
        if (this.isCondidtionsOkExists()) {
            return this.testReason(text, this.getCondidtionsOk());
        }
        return false;
    }
    validateChain(text) {
        try {
            this.resultCode = ResultType.NONE;

            if (this.shouldBeRegexUse()) {
                const regexValid = this.test(text);
                if (!regexValid) {
                    console.log('IS REGEX');
                    this.resultCode = ResultType.REGEX;
                    return false;
                }
            }

            if (this.isCondidtionsNokExists()) {
                const nokValid = this.testNok(text);
                if (nokValid) {
                    console.log('IS NOK');
                    this.resultCode = ResultType.NOK;
                    return false;
                }
            }

            if (this.isCondidtionsOkExists()) {
                const okValid = this.testOk(text);
                if (okValid) {
                    console.log('IS OK');
                    this.resultCode = ResultType.OK;
                    return true;
                } else {
                    return false;
                }
            }

            return true;
        } catch (ex) {
            console.error('validation column data error', ex);
        }
    }
    getCondidtionsNok() {
        return this.field?.validationReason?.conditionsReason?.conditionsNOK;
    }
    getCondidtionsOk() {
        return this.field?.validationReason?.conditionsReason?.conditionsOK;
    }
    isCondidtionsNokExists() {
        return this.field?.validationReason?.conditionsReason?.conditionsNOK;
    }
    isCondidtionsOkExists() {
        return this.field?.validationReason?.conditionsReason?.conditionsOK;
    }
    testReason(text, conditions) {
        const data = {
            ...this.data,
            [this.field.fieldName]: text,
        };
        if (!conditions) return;
        const conditionString = this.buildConditionForReason(conditions);
        console.log('condition in string', conditionString);
        const result = this.evaluateCondition(conditionString, data);
        return result;
    }
    buildConditionForReason = (array) => {
        if (!Array.isArray(array) || array.length === 0) return '';
        if (array.length === 3 && typeof array[0] === 'string') {
            const [column, operator, value] = array;

            const op = this.getValidOperator(operator);

            let rightSide;

            if (value === "''") {
                rightSide = '""';
            } else if (value === 'WART') {
                rightSide = 'data["WART"]';
            } else {
                rightSide = `"${value}"`;
            }
            return `data["${column}"] ${op} ${rightSide}`;
        }

        return array
            .map((item) => {
                if (Array.isArray(item)) {
                    return `(${this.buildConditionForReason(item)})`;
                }

                if (typeof item === 'string') {
                    const op = item.toUpperCase();
                    return this.getValidVerbalOperator(op);
                }

                return '';
            })
            .join('');
    };
    getMessage() {
        if (this.resultCode === ResultType.REGEX) {
            return this.field?.validationEdit?.messageNoValid || '';
        } else if (this.resultCode === ResultType.NOK) {
            return this.field?.validationReason?.messageNoValid || '';
        }
        return undefined;
    }

    canShowReasonsChanges(text) {
        if ((this.isCondidtionsOkExists() || this.isCondidtionsNokExists()) && this.test(text)) {
            return true;
        }
        return false;
    }

    getRegex() {
        if (StringUtils.isBlank(this.field?.validationEdit)) return '';
        if (!this.hasCondition()) return this.field?.validationEdit.regex;
        const condition = this.buildCondition(this.field?.validationEdit?.conditionsRegex?.conditions);
        const result = this.evaluateCondition(condition, this.data);
        const pattern = result
            ? this.field.validationEdit?.conditionsRegex?.thenRegex
            : this.field.validationEdit?.conditionsRegex?.elseRegex;
        return pattern;
    }
}
