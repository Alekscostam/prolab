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
        description: 'Ale uwaga! jesli poslzismy w te strone to ten HTML musi byc prawidłowy, zeby sie nie rozjechało',
        date: '',
        text: 'HTML w dialogu po wywoałniu np. plugina',
        link: 'https://trello.com/c/Az5BvEfx/652-komunikat-message-z-html',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku. Nalezy dokladnie przetestowac ten komponent',
        date: '',
        text: 'Naprawienie cofania cursora w komponencie opisowym w nagłówku',
        link: 'https://trello.com/c/xNzZNa1a/647-edycja-p%C3%B3l-opisowych',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        text: 'Tłuamczenie dla: Wypełnij wszystkie wymagane pola oraz usuniecie napisu w tle',
        link: 'https://trello.com/c/VJyn4u4U/632-message-wype%C5%82nij-wszytskie-pola',
    },

    {
        type: 'FIX',
        color: 'red',
        description:
            'Szczegóły w linku, Uwaga trzeba by sprazawidz czy attachmenty sie nie rozjechaly (te, które nie pochodzą z dashboard rowniez)',
        date: '',
        importanceColor: importanceColor,
        text: 'Poprawa parentId i recordId po wejsciu z dash do podwidoku z przycisku głónego',
        link: 'https://trello.com/c/u2QBbq6l/651-recordidparentid-w-podwidokach-dashboard-oraz-prze%C5%82%C4%85czaniu-okruszk%C3%B3w',
    },

    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        text: 'Po wyborze comboboxa nie znika header',
        link: 'https://trello.com/c/e2O39q4W/609-fix-podw%C3%B3jne-od%C5%9Bwie%C5%BCanie-view-po-u%C5%BCyciu-wtyczki-plugin',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        text: 'Naprawa usuwania parenta z url po kliknieciu w okruszek',
        link: 'https://trello.com/c/0NFjs0sK/623-gubi%C4%85cy-si%C4%99-header-subview-po-klikni%C4%99ciu-w-okruszek',
    },

    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        text: 'Dostarczenie parentId w widoku wywodzącego się z dashbaord',
        link: 'https://trello.com/c/3WR63ZhJ/619-plugin-brak-parentid-w-subview',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        text: 'Wyświetlenie headera przy wejsciu w podwidok z poziomu cardview',
        link: 'https://trello.com/c/28a97kzY/667-kafelki-podwidok-brak-headera',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        text: 'Naprawa wyswietlania questiona w nagłówku',
        link: 'https://trello.com/c/28a97kzY/667-kafelki-podwidok-brak-headera',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        text: 'Naprawa pobierania zalczaników',
        link: 'https://trello.com/c/mrbhjphr/666-pobieranie-plik%C3%B3w-error',
    },
    {
        type: 'NEW',
        color: 'red',
        description: 'Pwoiązane z zadaniem w linku, ale poki co tylko na gornej belce',
        date: '',
        text: 'Dodanie potwierdzenia usuwania na górnej belce',
        link: 'https://trello.com/c/3WhsdQaU/516-dodanie-pytania-przy-usuwaniu-danych',
    },
    // TODO:
    // FIXX: na anuluj w sidepanel w dashbaord, odblokowanie ehader w listach podpowiedzi w fullscreen, elementy nachodzą na siebie, dodaj na gancie wyswietla sie tylko wtedy idzie odpowiedni response z BE, fix na złą ilocsc wysweitlanych countsow w momencie mieszania klikniec PPM z kliknieciami na checkbox, view po wywolaniu wtyczki refreshuje sie tylko raz
];
