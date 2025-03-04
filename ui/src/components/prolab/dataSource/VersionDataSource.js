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
        description: 'Należy sprawdzić czy edytory sie nie rozjechały',
        date: '',
        text: 'Mozliwość klikniecia w link w edytorze w trybie readonly',
    },
    {
        type: 'FIX',
        color: 'red',
        description:
            'Do przetestowania w treeList. Trzeba przetestowac czy cos sie nie rozjechalo bo troszke zostało tam zmienione',
        date: '',
        importanceColor: importanceColor,
        text: 'Naprawa przeliczania formuły z paska bocznego',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Naprawa dodawania poziomu w treelist na PPM',
        date: '',
        text: 'PPM naprawa dodawania poziomu',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Po kliknięciu w załaczniki',
        text: 'Jak klikamy w wejscie do załączników to nie odznacza rekordu',
    },
    {
        type: 'NEW',
        color: 'green',
        description: 'Szczegóły w linku',
        text: 'Odświezenie widoku po wyjsciu z zalączników',
        link: 'https://trello.com/c/xOzKbDP0/514-zamkni%C4%99cie-okna-z-za%C5%82%C4%85cznikami-od%C5%9Bwie%C5%BCenie-view-lub-rekordu',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku.',
        date: '',
        text: 'Wejście w dodawanie parametru nie przewija scrolla',
        link: 'https://trello.com/c/uRFFjibu/732-otwieranie-edycji-w-%C5%9Brodku-listy-zamiast-na-pocz%C4%85tku',
    },
    {
        type: 'NEW',
        color: 'green',
        description: 'Wejście w podwidok, a nastepnie w powrót pokazuje z którego ROW klikneliśmy',
        date: '',
        text: 'Wejście w podwidok, a nastepnie w powrót pokazuje z którego ROW klikneliśmy',
    },
    // jak klikamy w wejscie do załączników to nie odznacza rekordu. odświezenie widoku po wyjsciu z zalączników, poprawa wyglądu dodawania kopii w dodawaniu parametru, wyłączenie niepotrzebnego blankowania strony po przeliczniu parametru jezeli nei ma podwidoku
    // { TODO: to zrob w batch rowniez
    //     type: 'NEW',
    //     color: 'green',
    //     description: 'Omawiane na MT',
    //     date: '',
    //     text: 'Poszerzenie komórki w treelist o szerokość buttonu listy podpowiedzi(i nie tylko tego przycisku)',
    // },
];
