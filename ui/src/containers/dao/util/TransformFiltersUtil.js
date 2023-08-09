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
}
