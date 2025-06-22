import {OperationDescriptions} from 'devextreme-react/cjs/data-grid';

export const tabsPositionsSelectBoxLabel = {'aria-label': 'Tab position'};
export const tabsPositions = ['top', 'left', 'right', 'bottom'];
export const stylingModesSelectBoxLabel = {'aria-label': 'Styling mode'};
export const stylingModes = ['secondary', 'primary'];
export const iconPositionsSelectBoxLabel = {'aria-label': 'Icon positions'};
export const iconPositions = ['top', 'start', 'end', 'bottom'];
export const importanceColor = '#FFF4F4';

//  gdy klikalo sie z głónego grida na modyfikuj specyfikacje to nie mozna było powrocic od razu po klinieciu strzalki wstecz.  .
export const features = [
    // NEW
    {
        type: 'FIX',
        color: 'red',
        date: '',
        text: 'Usuniecie zbędnych chmurek na gridach, których nie pwoinno być',
    },

    {
        type: 'FIX',
        color: 'red',
        description: '@Roman miał problem ze nie działy strzalki',
        date: '',
        text: 'Wymiana komponentu Liczby kopii w dodawaniu parametru',
    },

    {
        type: 'FIX',
        color: 'red',
        description: '',
        date: '',
        text: 'Naprawa PPM w dodawaniu parametrów (dublowaly sie z tymi z głównego widoku w treelist)',
    },

    {
        type: 'FIX',
        color: 'red',
        description:
            'Istnieją trzy wersje na wypadek gdyby któras nie działa - Parametr BAR_CODE_SHOW_METHOD na FISRT/SECOND/THIRD',
        date: '',
        text: 'Kreski - zmiana wywoływania poprzez czytnik',
        more: ' <b>FIRST:</b> po naciśnięciu Ctrl + K w JavaScripcie pojawia się okno (wcześniej było to robione w React), w którym aktywowany jest input, a następnie do niego trafia kod.</br> <b>SECOND:</b> istnieje ukryty input, niewidoczny dla użytkownika. Po wywołaniu Ctrl + K ten input staje się aktywny, a następnie otwierane jest okno, do którego przekazywana jest jego wartość.</br> <b> THIRD: </b> po naciśnięciu Ctrl + K aktywowany zostaje ukryty input, ale bez otwierania okna — od razu wywoływana jest metoda find().',
    },
    {
        type: 'FIX',
        color: 'red',
        description: '',
        date: '',
        text: 'Blokada wywolania kreski jak jest odpalony jakis dialog',
    },
    {
        type: 'NEW',
        color: 'green',
        description: '',
        date: '',
        text: 'Show more w dialogu wersji',
    },
    {
        type: 'NEW',
        color: 'green',
        description: 'Aby włączyć tę opcje należy ustawić parametr DRAGGABLE_GRID_ENABLED na true',
        date: '',
        text: 'Możliwość przeciągania datagrida w momencie klikniecia i przytrzymania lewego klawisza myszy',
    },
];
