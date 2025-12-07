export class MockEntryResponse {
    static message = {
        message: {
            title: 'Komunikat',
            text: 'Wyswietl komunikat i nie uruchamiaj',
        },
        question: null,
        next: false,
    };

    static next = {
        message: null,
        question: null,
        next: true,
    };

    static question = {
        message: null,
        question: {
            title: 'Pytanie ',
            text: 'Uruchomic wtyczke?',
        },
        next: true,
    };
}
