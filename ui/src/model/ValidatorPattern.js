import { StringUtils } from "../utils/StringUtils";

export default class ValidatorPattern {

     constructor(cellInfo, field) {
        // cellInfo.data.PIERW_TYP = "C";
        this.dataField = cellInfo?.column?.dataField || '';
        this.data =  cellInfo?.data || {};
        this.pierwType =  cellInfo?.data?.PIERW_TYP || '';
        this.field =  field || {};
     }

     getValidOperator(operator){
        switch (operator) {
            case "=": 
                return '===';
            case ">=": 
                return '>=';
            case "<=": 
                return '<=';
            case "<": 
                return '<';
            case ">": 
                return '>';
            default:
                return '===';    
        }
     }
     getValidVerbalOperator(operator){
        switch (operator) {
            case "AND": 
                return " && ";
            case "OR": 
                return " || ";
            default:
                return " && ";    
        }
     }

     getValidatorTextHtml(text) {
        const isValid = this.test(text);
        if (!isValid) return `<div id='text-box-validator-custom-message-red' style='width:100%; height=16px'>${this.getMessage()}</div>`;
        else return `<div id='text-box-validator-custom-message-empty' style='width:100%; height:16px'></div>`;
     }

     getValidatorDivHtml(text) {
        const isValid = this.test(text);
        if (!isValid) return <div id='text-box-validator-custom-message-red' style={{width:"100%",height:"16px"}}>{this.getMessage()}</div>;
        else return <div id='text-box-validator-custom-message-empty' style={{width:"100%", height:"16px"}}></div>;
     }

     buildCondition = (array) => {
        if(StringUtils.isBlank(array) || array.length === 0){
            return null;
        }
        let condition = "";
        array.forEach(item => {
            if (Array.isArray(item)) {
                const [column, operator, value] = item;
                condition += `data["${column}"] ${this.getValidOperator(operator)} "${value}"`;
            } else if (typeof item === "string") {
                condition += this.getValidVerbalOperator(item.toUpperCase());
            }
        });
        return condition;
     };

     evaluateCondition = (condition, data) => {
        try{
            return new Function("data", `return ${condition};`)(data);
        }
        catch(ex){
            console.error("Bad condition")
            return false;
        }
     };
     expressionSatisfiesCondition(){
        if(this.shouldBeRegexUse()){
            const condition = this.buildCondition(this.field?.validationEdit?.conditionsRegex?.conditions);
            return this.evaluateCondition(condition, this.data);
        }
        return false;
     }
     shouldBeRegexUse(){
        return !StringUtils.isBlank(this.field?.validationEdit);
     }

     hasCondition(){
        const conditions = this.field?.validationEdit?.conditionsRegex?.conditions;
        if(!StringUtils.isBlank(this.field?.validationEdit?.conditionsRegex?.conditions)){
            if(conditions.length !== 0){
                return true
            }
        }
       return false;
     }

     test(text){
        const regex = this.getRegex();
        if(StringUtils.isBlank(text) || text === "") return true;
        if(StringUtils.isBlank(regex)  || regex==='') return true;
        return new RegExp(regex).test(text)
     }

     getMessage(){
       return this.field?.validationEdit?.messageNoValid || "";
     }

     getRegex() {
        if(StringUtils.isBlank(this.field?.validationEdit)) return "" ;
        if(!this.hasCondition()) return this.field?.validationEdit.regex;
        const condition = this.buildCondition(this.field?.validationEdit?.conditionsRegex?.conditions);
        const result = this.evaluateCondition(condition, this.data);
        const pattern = result ? this.field.validationEdit?.conditionsRegex?.thenRegex : this.field.validationEdit?.conditionsRegex?.elseRegex;
        return pattern;
    }

}
