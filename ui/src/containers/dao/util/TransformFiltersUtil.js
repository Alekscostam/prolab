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

    static replaceNotValidDateFromLoadOptions(paramName, loadOptions) {
        if (paramName === 'filter') {
            if (loadOptions.filter) {
                for (let x = 0; x < loadOptions.filter.length; x++) {
                    const element = loadOptions.filter[x];
                    if (Array.isArray(element)) {
                        for (let y = 0; y < element.length; y++) {
                            const childrenElement = element[y];
                            if (this.isDataColumn(childrenElement)) {
                                if (childrenElement[2] === 'Invalid date') {
                                    loadOptions.filter[x][y][2] = '';
                                }
                            } else if (childrenElement === 'Invalid date') {
                                loadOptions.filter[x][y] = '';
                            }
                        }
                    }
                }
            }
        }
        return loadOptions;
    }
    static isNotValidRequiredParam(param) {
        return !(
            param === true ||
            param === false ||
            param === '' ||
            param === 'true' ||
            param === 'false' ||
            param === undefined ||
            param === null
        );
    }
    static isDataColumn(element) {
        return Array.isArray(element) && element.length === 3 && element[0].includes('DATA');
    }

    static notExcludedForFilter(paramName) {
        return (
            paramName !== 'filter' && paramName !== 'searchOperation' && paramName !== 'group' && paramName !== 'sort'
        );
    }
}
