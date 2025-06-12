class NumberUtil {
    static toInt(val) {
        if (val && !isNaN(val)) {
            return parseInt(val);
        }
        return val;
    }
}

export default NumberUtil;
