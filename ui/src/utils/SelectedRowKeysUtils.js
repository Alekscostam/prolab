export class SelectedRowKeysUtils {
    static mergeKeysWithRecordId(recordId, selectedRowKeys, stringRow = true, key = 'ID') {
        recordId = stringRow ? String(recordId) : parseInt(recordId);
        selectedRowKeys.push({[key]: recordId});
        const uniqueRows = new Set(selectedRowKeys.map((el) => el[key]));
        selectedRowKeys = Array.from(uniqueRows).map((id) => ({[key]: id}));
        return selectedRowKeys;
    }
}
