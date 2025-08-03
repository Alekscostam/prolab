export class DateUtils {
    static containsDate(input) {
        if (input === null || input === undefined) return false;

        let str;
        try {
            str = String(input);
        } catch (e) {
            return false;
        }

        const dateRegex =
            /\b(\d{4}[-/.]\d{2}[-/.]\d{2}|\d{2}[-/.]\d{2}[-/.]\d{4}|\d{4}[-/.]\d{2}[-/.]\d{2}T\d{2}:\d{2}:\d{2}(Z|[+\-]\d{2}:\d{2})?)\b/;
        return dateRegex.test(str);
    }
}
