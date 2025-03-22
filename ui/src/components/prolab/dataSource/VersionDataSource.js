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
        link: 'https://trello.com/c/abSaCr07/740-problem-kolejno%C5%9Bci-przy-dodawaniu',
        text: 'usunięcie incrementacji przy order',
    },

    // {
    //     type: 'FIX',
    //     color: 'red',
    //     description: 'Czyścilo czas jak klikalo sie w komponent w batchu',
    //     date: '',
    //     text: 'Naprawa wyświetlania i wyboru czasu w treelit',
    // },
    // {
    //     type: 'FIX',
    //     color: 'red',
    //     date: '',
    //     text: 'Zaznaczanie na żółto w gantt i fixed columns w zwykłym grid',
    // },

    {
        type: 'FIX',
        color: 'red',
        date: '',
        text: 'Zabezpieczenie przed białą strona jesli w PPM idą niezdefiniowane documentList, pluginList',
    },
];
