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
    static parseGregorianRomanDate(value) {
        if (!value) return null;

        const romanMonths = {
            I: 1,
            II: 2,
            III: 3,
            IV: 4,
            V: 5,
            VI: 6,
            VII: 7,
            VIII: 8,
            IX: 9,
            X: 10,
            XI: 11,
            XII: 12,
        };
        const parts = value.trim().split(/\s+/);
        if (parts.length === 4 && romanMonths[parts[0]]) {
            const month = romanMonths[parts[0]];
            const day = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            const [hour, minute] = parts[3].split(':').map(Number);

            return new Date(year, month - 1, day, hour, minute);
        }

        return null;
    }
}
