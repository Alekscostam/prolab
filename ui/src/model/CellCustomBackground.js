import { StringUtils } from "../utils/StringUtils";

export default class CellCustomBackground {
     constructor(cellInfo, columnDefinition) {
        this.cellInfo = cellInfo;
        this.data = cellInfo.data;
        this.dataField = cellInfo?.column?.dataField;
        this.columnDefinition =  columnDefinition;
    }
    canPaintRow() {       
        if(this.data?.FORMULA && this.isWart(this.dataField)){
           return true;
        } 
        if(!this.columnDefinition?.edit){
           return true;
        }
        return false;

    }
    paintRow () {
        if(this.data?.FORMULA && this.isWart(this.dataField)){
            this.paintRowByClassAndStyle("calculated-cell-bakcground","#93ffb8");
            return;
        } 
        if(!this.columnDefinition?.edit){
            this.paintRowByClassAndStyle("disabled-background",null);
            return;
        }
    }
    isWart(){
        if(this.dataField){
           return this.dataField.toUpperCase() === 'WART'; 
        }
        return false
    }
    paintRowByClassAndStyle(classNameBackground, styleBackground){
        if(StringUtils.isNumber(this.cellInfo?.row?.dataIndex)){
            const rows =  Array.from(document.querySelectorAll('tr[aria-rowindex="' + Number(this.cellInfo.row?.dataIndex +1)  + '"]'));
            const penultimateElement = rows[rows.length - 2]; 
            if(penultimateElement){
                if(!StringUtils.isBlank(this.cellInfo?.column?.headerId)){
                    const elements = Array.from(penultimateElement.children).filter(child => child.getAttribute('aria-describedby') === this.cellInfo.column.headerId);
                    if(elements.length!==0){
                       const element =  elements[0];
                        element.classList.add(classNameBackground);
                        if(!StringUtils.isBlank(styleBackground)){
                            element.style.setProperty('background', styleBackground, 'important');
                        }
                    }
                }
            }
        }
    }

}
