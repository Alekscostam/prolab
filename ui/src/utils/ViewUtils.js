export class ViewUtils {
    static canViewHeaderPanel (view) {
       const viewOperations = view?.operations || [];
        if(viewOperations.length > 0){
            return true;
        }  
        const viewShortcutButtons = view?.shortcutButtons || [];
        if(viewShortcutButtons.length > 0){
            return true;
        }
        return false;
    }
}
