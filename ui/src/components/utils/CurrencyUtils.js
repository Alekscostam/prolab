class CurrencyUtils {

    static currency(amount) {
        try {
            if (amount !== undefined && amount !== null) {
                return amount.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });
            } else {
                return "Nie wprowadzono"
            }
        } catch (ex) {
            console.err("CurrencyUtils error ->", ex)
            return "Błąd formatowania kwoty"
        }
    }

}

export default CurrencyUtils;