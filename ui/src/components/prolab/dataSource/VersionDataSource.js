export const tabsPositionsSelectBoxLabel = {'aria-label': 'Tab position'};
export const tabsPositions = ['top', 'left', 'right', 'bottom'];
export const stylingModesSelectBoxLabel = {'aria-label': 'Styling mode'};
export const stylingModes = ['secondary', 'primary'];
export const iconPositionsSelectBoxLabel = {'aria-label': 'Icon positions'};
export const iconPositions = ['top', 'start', 'end', 'bottom'];
export const importanceColor = '#FFF4F4';
export const features = [
    {
        type: 'NEW',
        color: 'green',
        description: 'Szczegóły w linku',
        date: '',
        text: 'Opcjonalny wypełnij w edycji nagłówka',
        link: 'https://trello.com/c/3iqAMx3b/591-klawisz-wype%C5%82nij',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Usunięcie rowIndex, który wymazywał zaznaczanie w liście podpwiedzi',
        date: '',
        text: 'Prawidłowe zaznaczanie rekordów w liście podpowiedzi',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        text: 'Usunięcie zapętlania po scrolowaniu w liście podpowiedzi',
        link: 'https://trello.com/c/qDlBKtmH/584-demo-taskflow-listy-podpowiedzi',
    },
    {
        type: 'NEW',
        color: 'green',
        description:
            'Szczegóły w linku. Implementacja poki co tylko w klasycznym grid i edycji nagłówka. Trzeba sprawdzić czy sie nie rozjechało nigdzie. Np po kliknieciu w treelist',
        date: '',
        importanceColor: importanceColor,
        text: 'Nowe komponenty CH i OH',
        link: 'https://trello.com/c/mG2u2X0O/643-nowe-typy-p%C3%B3l',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        text: 'Mozliwość wpisywania z kalwiatury czasu',
        link: 'https://trello.com/c/SJlhTYMF/627-kontrolka-czas',
    },
    // TODO:
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku. Trzeba by dokladnie przetestowac dla kilku scenariuszy czy sie nie rozjechało',
        date: '',
        text: 'Prawidłowe dodawanie okruszków z dashboarda',
        link: 'https://trello.com/c/4FdOAUWg/657-breadcrumb-dashboard-vs-zak%C5%82adki',
    },

    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        text: 'Poprawa na skakanie komponentu w gantt',
        link: 'https://trello.com/c/rRRn77WN/590-demo-taskflow-obs%C5%82uga-gantt',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        text: 'Komunikat z htmlem',
        link: 'https://trello.com/c/Az5BvEfx/652-komunikat-message-z-html',
    },

    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        text: 'Naprawienie skalowania Gantt',
        link: 'https://trello.com/c/DYZ3rgIL/622-rozjechany-view-gantt',
    },
];
