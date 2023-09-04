export default class TansformFiltersUtil {
    // TODO: wymaga bardziej doglebnej analizy chyba...
    static filterValidTransform(loadOptions) {
        if (loadOptions.filter) {
            for (let index = 0; index < loadOptions.filter.length; index++) {
                const element = loadOptions.filter[index];
                if (Array.isArray(element)) {
                    for (let index = 0; index < element.length; index++) {
                        const childrenElement = element[index];
                        if (!isNaN(childrenElement)) {
                            element[index] = parseInt(element[index]);
                            element[index - 1] = '=';
                        }
                    }
                } else if (!isNaN(element)) {
                    loadOptions.filter[index] = parseInt(loadOptions.filter[index]);
                    loadOptions.filter[index - 1] = '=';
                }
            }
        }
    }

    static putValueIntoParam(sort, filter, group, loadOptions, paramName) {
        const paramValue = loadOptions[paramName];
        switch (paramValue) {
            case 'filter':
                filter = paramValue;
                break;
            case 'group':
                group = paramValue;
                break;
            case 'sort':
                sort = paramValue;
                break;
            default:
        }
    }
    static notExcludedForFilter(paramName) {
        return (
            paramName !== 'filter' &&
            paramName !== 'requireTotalCount' &&
            paramName !== 'searchOperation' &&
            paramName !== 'group' &&
            paramName !== 'sort'
        );
    }
}
