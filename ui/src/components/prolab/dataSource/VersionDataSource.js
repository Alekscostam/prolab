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
        description: 'Parametr SHOW_FILTER_CLEAR',
        date: '',
        text: 'Switch do filtrów, który świadczy o zaznaczonych filtrach w obecnym widoku. Dostępne na głównym gridzie i gantt',
    },
    {
        type: 'NEW',
        color: 'green',
        description: 'Szczegóły w linku',
        importanceColor: importanceColor,
        date: '',
        link: 'https://trello.com/c/scjxoTII/558-utrzymanie-odfiltrowanych-danych-po-edycji-rekordu',
        text: 'Mechanizm zapisywania filtrow na głównym gridzie , w momencie przechodzenia i powrotu z dziecka',
    },
    {
        type: 'NEW',
        color: 'green',
        description: 'Szczegóły w linku',
        importanceColor: importanceColor,
        date: '',
        text: 'Mechanizm zapisywania filtrow na gancie',
    },
    {
        type: 'NEW',
        color: 'green',
        description: 'Szczegóły w linku',
        date: '',
        link: 'https://trello.com/c/scjxoTII/558-utrzymanie-odfiltrowanych-danych-po-edycji-rekordu',
        text: 'Usuwanie złego kolorowania background na niektorych rowach w gantt szarego background w niektorych ',
    },
    {
        type: 'NEW',
        color: 'green',
        description: 'Szczegóły w linku',
        date: '',
        link: 'https://trello.com/c/Vf4mFklC/758-podw%C3%B3jne-nag%C5%82%C3%B3wki-w-subview',
        text: 'MultiHeader dla podwidoków',
    },
    {
        type: 'NEW',
        color: 'green',
        description: 'Szczegóły w linku',
        date: '',
        link: 'https://trello.com/c/LVJiZ5XU/579-obs%C5%82uga-parametru-dashboardhideheader',
        text: 'Obsługa dashboardHideHeader',
    },
    {
        type: 'NEW',
        color: 'green',
        description: '',
        date: '',
        link: '',
        text: 'Zaznaczanie rekordu na żółto w przypadku wyjscia z edycji nagłówka - Gantt',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku. Dlaczego nie przychodzi widok z BE to musiałby zerknać @Roman',
        date: '',
        link: 'https://trello.com/c/GkHuMFwW/762-b%C5%82%C4%85d-przy-wej%C5%9Bciu-do-podwidoku-w-widoku-gantt',
        text: 'Odblokwoanie widoku po nie znalezieniu podwidoku',
    },
    {
        type: 'NEW',
        color: 'green',
        description: '',
        date: '',
        link: '',
        text: 'Rekordu na niebiesko po zaznaczeniu - Gantt',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        link: 'https://trello.com/c/6wsxZMnU/756-b%C5%82%C4%85d-podczas-dodawania-za%C5%82%C4%85cznika',
        text: 'Możliwość dodawnia załączników w fullscreen',
    },
];
