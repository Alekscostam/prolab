export const tabsPositionsSelectBoxLabel = {'aria-label': 'Tab position'};
export const tabsPositions = ['top', 'left', 'right', 'bottom'];
export const stylingModesSelectBoxLabel = {'aria-label': 'Styling mode'};
export const stylingModes = ['secondary', 'primary'];
export const iconPositionsSelectBoxLabel = {'aria-label': 'Icon positions'};
export const iconPositions = ['top', 'start', 'end', 'bottom'];
export const importanceColor = '#FFF4F4';

//  gdy klikalo sie z głónego grida na modyfikuj specyfikacje to nie mozna było powrocic od razu po klinieciu strzalki wstecz.  .
export const features = [
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        link: 'https://trello.com/c/sCIkkfVI/729-generowanie-dokumentu-brak-komunikatu-%C5%BCe-nie-zaznaczono-pozycji',
        text: 'Generowanie dokumentu - obsługa next false',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        link: 'https://trello.com/c/C9gdkazj/714-wype%C5%82nianie-daty-w-specyfikacji-pr%C3%B3bki',
        text: 'Naprawa pola daty w edycji specyfikacji przy zmianie miesiąca',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        link: 'https://trello.com/c/vJ8FwkBE/747-zaznaczanie-rekordu-przy-u%C5%BCyciu-ppm',
        text: 'PPM błąd podwójnego zaznaczania',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Czyściło czas jak klikało sie w komponent czasu w batchu',
        date: '',
        text: 'Naprawa wyświetlania i wyboru czasu w treelist',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        link: 'https://trello.com/c/D78YzaKn/744-wersja-en-t%C5%82umaczenia',

        text: 'Brakujące tłumaczenia',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        link: 'https://trello.com/c/daffGgPT/741-2-razy-wywo%C5%82a%C5%82-execute-i-save-przy-jednym-klikni%C4%99ciu',
        text: 'Zabezpieczenie podwójnego wywolania execute na parametrach',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Zatrzymanie podwójnego fetcha danych po wyjsciu z edycji angłówkach na widoku akrt',
        date: '',
        text: 'Zatrzymanie podwójnego fetcha danych po wyjsciu z edycji angłówkach na widoku akrt',
    },
    {
        type: 'NEW',
        color: 'green',
        description: 'Szczegóły w linku',
        date: '',
        link: 'https://trello.com/c/VihlcVVC/620-plugin-ikona',
        text: 'Kolor ikony w pluginach',
    },
    {
        type: 'NEW',
        color: 'green',
        description: 'Szczegóły w linku',
        date: '',
        link: 'https://trello.com/c/RUXyCiFV/746-findkreski-komunikat-%C5%BCe-nic-nie-znalezionoa',
        text: 'Komunikat, że nic nie znaleziono po wywolaniu kodu kreskowego',
    },
    // {
    //     type: 'NEW',
    //     color: 'green',
    //     description: 'Jak wychodzimy z edycji nagłówka na kartach to robi sie efekt fadein i fadeout na karcie',
    //     date: '',
    //     text: ' Dokończenie fadein i fadeout na kartach po wyjsciu z edycji nagłówka',
    // },
    {
        type: 'FIX',
        color: 'red',
        description: 'Podwójnie fetchowało te same dane po kliknieciu zapisz w edycji nagłówka w cardview',
        date: '',
        text: 'Pozbycie się zbędnego fetcha w przypadku zapisu danych za pomocą nagłówka w cardView',
    },
    {
        type: 'FIX',
        color: 'red',
        date: '',
        text: 'Rozpoznawanie polskich znaków z pobierania załączników',
    },
    {
        type: 'FIX',
        color: 'red',
        date: '',
        text: 'Zamykanie widoku attachmentu z edycji nagłówka nie powoduje zbędnego refresha głównego widoku',
    },
    {
        type: 'FIX',
        color: 'red',
        date: '',
        text: 'Usunięcie podwójnego wywołania download przy pobieraniu załącznika',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        link: 'https://trello.com/c/7xCLUe4V/751-blokowanie-edycji-specyfikacji-gdy-status-nok',
        date: '',
        text: 'Poprawa obsługi OK i NOK w edycji specyfikacji',
    },
    {
        type: 'NEW',
        color: 'green',
        description: 'Szczegóły w linku',
        link: 'https://trello.com/c/aFDTSkLC/752-obs%C5%82uga-widoku-z-podw%C3%B3jnymi-nag%C5%82%C3%B3wkami-kolumn-bands',
        date: '',
        text: 'Multi header na gridzie',
    },
    {
        type: 'NEW',
        color: 'green',
        description:
            'Nalezy przetestować komponenty: Dialog kopiowania, Dialog historii, Dialog pluginu, Dialog publikowania, Dialog podsumowania publikowania',
        date: '',
        importanceColor: 'orange',
        text: 'Przechodzenie z komponentów klasowych na funkcyjne ',
    },
    {
        type: 'NEW',
        color: 'green',
        description: '',
        date: '',
        text: 'Jesli widok niezdefniowany to ustawiamy gridView',
    },
];
