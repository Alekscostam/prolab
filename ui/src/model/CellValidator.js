import { StringUtils } from "../utils/StringUtils";

export default class CellValidator {

     constructor(cellInfo, field) {
        // cellInfo.data.PIERW_TYP = "C";
        this.dataField = cellInfo?.column?.dataField || '';
        this.data =  cellInfo?.data || {};
        this.pierwType =  cellInfo?.data?.PIERW_TYP || '';
        this.field =  field || {};
        this.required =  field.requiredValue && field.visible && !field.hidden;
        this.text =  cellInfo?.text;
        this.key =  cellInfo?.key;

     }
     isValidField (inputValue) {
        let valueToCompare = this.text
        if(!StringUtils.isBlank(inputValue)){
            valueToCompare = inputValue;
        }
        try{
            if (this.required && valueToCompare === '') {
                return false;
            } else if (this.expressionSatisfiesCondition() && !this.test(valueToCompare)) {
                return false;
            } else {
                return true;
            }
        }catch(err){
                return true;
        }
    }
     getValidOperator(operator){
        switch (operator) {
            case "=": 
                return '===';
            case "contains": 
                return '===';
            case ">=": 
                return '>=';
            case "<=": 
                return '<=';
            case "<": 
                return '<';
            case ">": 
                return '>';
            case "AND": 
                return " && ";
            case "OR": 
                return " || ";
            default:
                return " && "
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
        try{
             if (!Array.isArray(array) || array.length === 0) {
                 return null;
             }
             if (array.length === 3 && typeof array[0] === "string" && typeof array[1] === "string") {
                 const [column, operator, value] = array;
                 return `data["${column}"] ${this.getValidOperator(operator)} "${value}"`;
             }
             let condition = "";
             array.forEach((item) => {
                if (Array.isArray(item)) {
                    const [column, operator, value] = item;
                    if(Array.isArray(column) ){
                        condition += `(${this.buildCondition(item)})`;
                    }else{
                        condition += `data["${column}"] ${this.getValidOperator(operator)} "${value}"`;
                    }
                } 
                else if (typeof item === "string") {
                    condition += this.getValidOperator(item.toUpperCase());
                }
             });
             return condition;
        }catch(ex){
            console.error(ex)
        }   
       
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
        // const one = [["UWAGI","contains","pró"],"and",[["OPIS","=","Opis dodatkowy 123"],"or",["OPIS","=","Opis dodatkowy"]]];
        // const two = [["UWAGI","contains","pró"],"and",["OPIS","=","Opis dodatkowy 123"]];
        // const three = ["UWAGI","contains","pró"];
        const condition = this.buildCondition(this.field?.validationEdit?.conditionsRegex?.conditions);
        const result = this.evaluateCondition(condition, this.data);
        const pattern = result ? this.field.validationEdit?.conditionsRegex?.thenRegex : this.field.validationEdit?.conditionsRegex?.elseRegex;
        return pattern;
    }

}
