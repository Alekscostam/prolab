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
        description: 'Szczegóły w linku.',
        date: '',
        link: 'https://trello.com/c/tlj6i6wi/769-wariuje-zaznaczanie-checkbox-w-specyfikacji',
        text: 'Poprawa zaznaczania',
    },
    {
        type: 'FIX',
        color: 'red',
        date: '',
        text: 'Centrowanie obrazków na grid',
    },
    {
        type: 'FIX',
        color: 'red',
        description: '',
        date: '',
        text: 'Odblokowanie PPM w batch',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szaczegóły w linku',
        date: '',
        link: 'https://trello.com/c/tlhfkEMo/771-przegl%C4%85danie-danych-przefiltrowanych',
        text: 'Poprawa działania filterOperation przy zapamiętywaniu filtrów',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Jak dalej będzie źle to musicie wysłać ten czytnik ',
        date: '',
        text: 'Focus automatyczny po inicjalizacji komponentu w ctrl + K',
    },
    {
        type: 'NEW',
        color: 'green',
        description: 'Który umozliwia połączenie za pomoca socketów z BE',
        date: '',
        text: 'Parametr WSS_URL',
    },
    {
        type: 'NEW',
        color: 'green',
        description: '',
        date: '',
        text: 'Implementacja mechanizmu zapisywania adresu URL odwiedzonego przed logowaniem w pliku cookie, w celu przekierowania użytkownika po pomyślnej autoryzacji.',
    },
    {
        type: 'NEW',
        color: 'green',
        description: '',
        date: '',
        text: 'DevExtreme 23.2.13',
    },
    {
        type: 'NEW',
        color: 'green',
        description: '',
        date: '',
        text: 'React 19',
    },
    {
        type: 'NEW',
        color: 'green',
        description: '',
        date: '',
        text: 'Dodanie informacji o wersji DevExtreme do PreviewDialog do zakładki "Wersja"',
    },
];
