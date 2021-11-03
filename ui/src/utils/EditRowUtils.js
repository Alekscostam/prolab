class EditRowUtils {

    static searchField(editData, searchFieldName, callback) {
        editData.editFields?.forEach(groupFields => {
            groupFields?.fields?.forEach(field => {
                if (field.fieldName === searchFieldName) {
                    callback(field)
                    return;
                }
            })
        })
    }

    static searchAndAutoFill(editData, searchFieldName, newFieldValue, autoFillOnlyEmpty) {
        EditRowUtils.searchField(editData, searchFieldName, (field) => {
            if (autoFillOnlyEmpty) {
                if (field.value === null || field.value === "" || field.value.trim() === "") {
                    field.value = newFieldValue;
                }
            } else {
                field.value = newFieldValue;
            }
        })
    }

    static searchAndRefreshVisibility(editData, searchFieldName, hidden) {
        this.searchField(editData, searchFieldName, (field) => {
            field.hidden = hidden;
        })
    }

}

export default EditRowUtils;