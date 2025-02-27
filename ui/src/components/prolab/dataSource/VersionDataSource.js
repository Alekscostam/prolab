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
        type: 'NEW',
        color: 'green',
        description: 'Szczegóły w linku. Warto dokładnie sprawdzić czy walidacja dizała do tego ok...',
        date: '',
        importanceColor: importanceColor,
        text: 'Up i Down - jak w excelu an treelist',
        link: 'https://trello.com/c/zxd02TLS/512-przechodzenie-pomi%C4%99dzy-kom%C3%B3rkami-w-trybie-edycji-specyfikacji',
    },
    // // FIXX: naprawa działania wyliczania klucza w
    // liscie podpwoiediz z poziomu Treelist. Dosunięcie ikon w trybie podglądu do prawej strony w treelist
    {
        type: 'NEW',
        color: 'green',
        description: 'Omawiane na MT',
        date: '',
        text: 'Poszerzenie komórki w treelist o szerokość buttonu listy podpowiedzi(i nie tylko tego przycisku)',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Sam zauwazyłem, że sie nie dosuwa w trybie VIEW jesli rozszerzamy kolumne w treelist',
        date: '',
        text: 'Dosunięcie ikon w trybie podglądu do prawej strony w treelist',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        link: 'https://trello.com/c/pVODw5qZ/469-nie-przelicza-formu%C5%82-od-razu-po-dodaniu-specyfikacji',
        text: 'Przeliczanie parametrów według formuł dla nowo dodanych parametrów',
    },

    {
        type: 'FIX',
        color: 'red',
        description:
            'Naprawa wyliczania klucza w treelist dla listy podpowiedzi. Uwaga!!! Dość duże zmiany refaktoryzacyjne kodu, więc należy przetestować z poziomu edycji naglowka i listy podpiowiedzi w treelist',
        date: '',
        importanceColor: importanceColor,
        text: 'Naprawa działania wyliczania klucza w liście podpowiedzi z poziomu Treelist',
    },
    // { TODO: to zrob w batch rowniez
    //     type: 'NEW',
    //     color: 'green',
    //     description: 'Omawiane na MT',
    //     date: '',
    //     text: 'Poszerzenie komórki w treelist o szerokość buttonu listy podpowiedzi(i nie tylko tego przycisku)',
    // },
    {
        type: 'NEW',
        color: 'green',
        description: 'Omawiane na MT',
        text: 'Odblokaownie dodawania w dashboard na OP_ADD_BUTTON.',
        link: 'https://trello.com/c/aBycHcE9/681-ganttview-brak-kolorowania-i-p%C3%B3l-html',
    },
    {
        type: 'NEW',
        color: 'green',
        description: 'Parametr SHOW_DASHBOARD_HEADERS',
        text: 'Dodanie headerwa w dashboard',
        link: 'https://trello.com/c/aBycHcE9/681-ganttview-brak-kolorowania-i-p%C3%B3l-html',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Miał on dodatkową ramkę.',
        date: '',
        text: 'Zmiana border w komponencie password w Edycji nagłówka',
    },
    {
        type: 'NEW',
        color: 'green',
        description: 'Szczegóły w linku.',
        date: '',
        link: 'https://trello.com/c/apFvkHcG/725-chmurka-z-pe%C5%82n%C4%85-informacj%C4%85-z-pola',
        text: 'Chmurka z pełną infromacja w treelist',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        link: 'https://trello.com/c/VI4oqlxH/721-wy%C5%9Bwietlanie-nazwy-kolumny-w-widoku',
        text: 'Wyświetlanie odpowiedniego labela na kolumnie w przypadku duplikowania fieldName',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Tak jak w tytule',
        date: '',
        text: 'Nie odznaczenie rekordu po zapisie naglowka wtedy kiedu odpowiedz jest NOK',
    },
    {
        type: 'FIX',
        color: 'red',
        description:
            'Naprawa klikniecia strzalki wróć po wywołaniu Edycji specyfikacji z widoku głównego. Trzeba było dwa razy kliknąc, żeby wrocilo do widoku głównego',
        date: '',
        text: 'Naprawa klikniecia strzalki wróć po wywołaniu Edycji specyfikacji',
    },
    {
        type: 'FIX',
        color: 'red',
        description:
            'Szczegóły w linku. bardzo duża zmiana nalezy szczegółowo przetestowac. Czyli np. pochodzić po tabach',
        date: '',
        link: 'https://trello.com/c/Tgd6L3jL/455-skr%C3%B3ty-w-menu-kontekstowym',
        importanceColor: importanceColor,
        text: 'Zmiana komponentu na prawy klik',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Bardzo duża zmiana nalezy szczegółowo przetestowac',
        date: '',
        importanceColor: importanceColor,
        text: 'Zmiana renderowania w dodawaniu parametrów',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku.',
        date: '',
        link: 'https://trello.com/c/Gxj40OiD/728-okno-dodawania-specyfikacji-mo%C5%BCliwo%C5%9B%C4%87-ruszania-dialogiem',
        text: 'Możliwość poruszania dialogiem w dodawaniu parametrów',
    },
];
