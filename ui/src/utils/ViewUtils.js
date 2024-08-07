export class ViewUtils {
    static canViewHeaderPanel (view) {
        if(view){
            const filterList = view?.filtersList  || [];
            const batchesList = view?.batchesList  || [];
            const documentsList = view?.documentsList  || [];
            const viewOperations = view?.operations || [];
            const viewShortcutButtons = view?.shortcutButtons || [];
            if(viewOperations.length > 0){
                return true;
            }  
            if(viewShortcutButtons.length > 0){
                return true;
            }
            if(filterList.length !== 0 || batchesList.length !== 0 ||  documentsList.length !== 0) {
                return true;
            }
            return false;
        }
        return true;
       
    }
}
