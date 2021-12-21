import {readValueCookieGlobal} from "../utils/Cookie";

export default class MockService {

    static isMock() {
        const mockSystem = readValueCookieGlobal('mock_system');
        return mockSystem === '04151';
    }

}