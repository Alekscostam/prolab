import {readValueCookieGlobal} from "../utils/Cookie";

export default class MockService {

    static isMock() {
        const mockSystem = readValueCookieGlobal('mock_system');
        return mockSystem === '04151';
    }

    static getFieldEnableDisableOrMock(value, fieldName) {
        if (MockService.isMock()) {
            const valueFromCookie = readValueCookieGlobal(fieldName);
            const ret = !valueFromCookie ? value : valueFromCookie === 'true';
            return ret;
        }
        return value;
    }

    static getFieldValueOrMock(value, fieldName) {
        if (MockService.isMock()) {
            const valueFromCookie = readValueCookieGlobal(fieldName);
            const ret = !valueFromCookie ? value : valueFromCookie;
            return ret;
        }
        return value;
    }

    static printField(field) {
        if (MockService.isMock()) {
            let text = '';
            text += 'autoFill=' + field.autoFill + '\n';
            text += 'autoFillOnlyEmpty=' + field.autoFillOnlyEmpty + '\n';
            text += 'edit=' + field.edit + '\n';
            text += 'fieldName=' + field.fieldName + '\n';
            text += 'hidden=' + field.hidden + '\n';
            text += 'id=' + field.id + '\n';
            text += 'label=' + field.label + '\n';
            text += 'labelColor=' + field.labelColor + '\n';
            text += 'refreshFieldVisibility=' + field.refreshFieldVisibility + '\n';
            text += 'requiredValue=' + field.requiredValue + '\n';
            text += 'selectionList=' + field.selectionList + '\n';
            text += 'type=' + field.type + '\n';
            text += 'value=' + field.value + '\n';
            text += 'visible=' + field.visible + '\n';
            return text;
        } else {
            return undefined;
        }
    }

}