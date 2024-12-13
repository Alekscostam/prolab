export const tabsPositionsSelectBoxLabel = {'aria-label': 'Tab position'};
export const tabsPositions = ['top', 'left', 'right', 'bottom'];
export const stylingModesSelectBoxLabel = {'aria-label': 'Styling mode'};
export const stylingModes = ['secondary', 'primary'];
export const iconPositionsSelectBoxLabel = {'aria-label': 'Icon positions'};
export const iconPositions = ['top', 'start', 'end', 'bottom'];
export const features = [
    {
        type: 'FIX',
        color: 'red',
        description:
            'Zmiana komunikatu na success przy generowaniu dokumentów i chyba to jest rownoznaczne z poprawą przy zapiscie do biblioteki',
        date: '',
        text: 'Zmiana komunikatu w przypadku generowania dokumentów',
        link: 'https://trello.com/c/QTKQGqcr/552-fix-generator-dokument%C3%B3w-zapis-do-biblioteki-dokument%C3%B3w-message-jako-error',
    },
    {
        type: 'FIX',
        color: 'red',
        description:
            'Bardzo duża zmiana która umozliwa utrzymunie cursora na filtrze. Nalezy zobacyzć czy gridy dobrze sie ładują ',
        date: '',
        importanceColor: '#FFF4F4',
        text: 'Zmiana trybu ładowania datagrid',
        link: 'https://trello.com/c/KsUEx2N6/560-wpisywanie-do-wiersza-filtra',
    },
    {
        type: 'FIX',
        color: 'red',
        description:
            'Jak wchodziło się na widok kart to po kliknięciu F5 znikał totalCount(ten ciapek, ktory zawierał format np. 0/250). Do przetestowania na widokach jak i w załącznikach. Powiazane z zadaniem w linku',
        date: '',
        text: 'Poprawa wyświetlania totalCount w cardview',
        link: 'https://trello.com/c/nxD8Iadw/580-demo-taskflow-ilo%C5%9B%C4%87-rekord%C3%B3w-w-widoku-kafelek',
    },
    {
        type: 'FIX',
        color: 'red',
        description:
            'Tam gdzie grupy mają wszystkie pola visible = false to nie wyswietlamy tych grup. Do przetestowanie w nagłówku. UWAGA jesli nagłówek ma wszystkie pola hidden na true, to wtedy grupa jest wyswietlana. Funkcjonalnośc działa tylko jesli parametry visible sa na false ',
        date: '',
        text: 'Ukrycie grup w nagłówku ktore mają same pola visible = false',
        link: 'https://trello.com/c/4ONGaQP6/550-w-edycji-nag%C5%82%C3%B3wka-nie-powinno-wy%C5%9Bwietla%C4%87-grup-p%C3%B3l-wy%C5%82%C4%85czonych-z-edycji',
    },
    {
        type: 'FIX',
        color: 'red',
        description:
            'Ta druga część zadania raczej poprawiona, a ta pierwsza to nie jestem pewien, bo u mnie za kazdym razem jest dobrze jak testuje',
        date: '',
        text: 'Zmiana wczytywania tabów w dodawaniu specyfikacji',
        link: 'https://trello.com/c/TM5wuZB3/546-wczytywanie-okna-dodawania-parametr%C3%B3w',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Do przetestowania przy tasku ponizej w linku.',
        date: '',
        text: 'Tłumaczenie domyślne po nierozpoznanym błędzie z BE',
        link: 'https://trello.com/c/TtIYSSME/543-t%C5%82umaczenie-operacja-w-toku-i-komunikatu',
    },
    {
        type: 'FIX',
        color: 'red',
        description:
            'Był błąd, bo nie znajdywało odpowdnich metod. Do sprawdzenia jesli w widoku edycji specyfikacji pojawi sie plugin do wywoałania(lub dokument)',
        date: '',
        text: 'Odblokowanie documents i plugin dla treelisty',
    },
    {
        type: 'FIX',
        color: 'red',
        description:
            'Bardzo rzadki case. Czasami jak klikało sie po jakiejs akcji wybór wiersza, to zaznaczało wystzsko. Nawet nie wiem jak odwzorowac bo dosyc randomowe to było',
        date: '',
        text: 'Naprawa błedu związanego z zaznaczaniem wszystkiego jak klikamy tylko jeden element',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        text: 'Usunięcie html tagów po najechaniu na opis w dashboard',
        link: 'https://trello.com/c/UelNvCes/576-opis-w-chmurce',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'jesli tasków nie było to nie wysweitlało komponentu gantt. Poprawka raczej bezpieczna',
        date: '',
        text: 'Wyświetlenie gantta, nawet jak nie ma tasków',
        link: 'https://trello.com/c/0fuSBjug/588-demo-taskflow-b%C5%82%C4%85d-w-widoku-gantt',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        text: 'Wyświetlanie czerownej lini w gantt',
        link: 'https://trello.com/c/PfQly9bu/587-demo-taskflow-dodawanie-do-widoku-gantt',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Na gancie po któryms rerenderze komponentu znikała czerwona linia. Poprawka raczej bezpieczna',
        date: '',
        text: 'Czerwony pasek na gancie już nie znika',
        link: 'https://trello.com/c/PfQly9bu/587-demo-taskflow-dodawanie-do-widoku-gantt',
    },
    {
        type: 'FIX',
        color: 'red',
        description:
            'Tutaj dość dużo wjechało unowocześnień, więc dobrze by było przetestować kompleksowo ten komponent.',
        date: '',
        text: 'Zdjęcie w profilu wyświetla sie w tej samej wysokosci co szerokość',
        link: 'https://trello.com/c/KcgMQLjT/592-obrazek-w-kafelku-rozje%C5%BCd%C5%BCa-si%C4%99',
    },
    {
        type: 'NEW',
        color: 'green',
        description: 'Jeśli poleci 400 to poleci log do BE',
        date: '',
        text: 'Dodawanie logowania błędu 400 do BE',
    },
    // {
    //     type: 'FIX',
    //     color: 'red',
    //     description: 'Do przetestwoania w badaniach, ale czy tylko? ',
    //     date: '',
    //     text: 'Usunięcie niepotrzebnego dwukrotnego wywołania punktu pobierania danych',
    //     importanceColor: '#FFF4F4',
    //     link: 'https://trello.com/c/Omh1SjK6/511-fix-podw%C3%B3jne-wywo%C5%82anie-punktu-dost%C4%99powego-viewdata',
    // },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        text: 'Edycja pola z formułą - poprawa responsywności',
        link: 'https://trello.com/c/KlUS7WPa/561-edycja-pola-z-formu%C5%82%C4%85',
    },
    {
        type: 'FIX',
        color: 'red',
        description:
            'W trybie dodawania w fullscreen jak wpisywalismy cos do panelów i potem robilismy np. anuluj, a nastepnie znowu wchodzilismy to parametry z poprzedniego dodawania cachowaly sie. Do rpzetestowania cały widok dodawania w FULLSCREEN',
        date: '',
        text: 'Usunięcie cachowania parametrów na fieldsach w FULLSCREEN',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Label walidacyjny pojawiał się w FULLSCREEN na górze na środku',
        date: '',
        text: 'Label walidacyjny w FULLSCREEN na środku',
        link: 'https://trello.com/c/kGLMjQ2r/594-demo-taskflow-formularz-dodawania-w-trybie-pe%C5%82noekranowym',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Znalezione przez @Marek. Szczegóły w linku ',
        date: '',
        text: 'Usunięcie podwidoku z widoku w którym nie powinno go być',
        link: 'https://trello.com/c/9SotSetP/582-demo-taskflow-b%C5%82%C4%85d-w-przechodzeniu-mi%C4%99dzy-okruszkami-podwidokami',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku ',
        date: '',
        text: 'Margines pomiędzy obrazkiem, a opisem',
        link: 'https://trello.com/c/qDoUrsbq/593-widok-p%C3%B3l-w-kafelku',
    },
    {
        type: 'FIX',
        color: 'red',
        description: 'Szczegóły w linku',
        date: '',
        text: 'FULLSCREEN na dashboard',
        link: 'https://trello.com/c/rDmH6x9g/603-fix-dashboard-edit-nie-dzia%C5%82a-fullscreen',
    },
    {
        type: 'NEW',
        color: 'green',
        description:
            'do sprawdzenia w edycji specyfikacji, dodawaniu parametrów i w innych widokach np. gantt. Trzbea by sprawdzic przy okazji czy buttony dobrze sie wywołują np. z trzech kropek. Testowałem to wstepnie i było ok ale trzbea tutaj dokladniej to zrobic. ',
        date: '',
        importanceColor: '#FFF4F4',
        text: 'Dodanie zaznaczenia rekordu po kliknięciu PPM na komponenty datagrid, treelist, gantt, cardview',
    },
    {
        type: 'NEW',
        color: 'green',
        description:
            'trzeba przetestowac caly fullscreen, bo z widoku przenioslem na dialog. Lepiej nie ustawiać tego trybu u klienta poki co, az nie ebdzie porzadnie sprawdzone',
        date: '',
        importanceColor: '#FFF4F4',
        text: 'Fullscreen na dialogu',
    },
    {
        type: 'NEW',
        color: 'green',
        description:
            'do sprawdzenia w gantt, grid, treelist, card. parametr nazywa sie onlyOneRecord. @Roman bedzie wiecał o co chodzi',
        date: '',
        text: 'PPM obsługa nowego paramatru dla gantt, grid, treelist i card',
    },
    {
        type: 'NEW',
        color: 'green',
        description: 'obsługa ctrl+k',
        date: '',
        text: 'Obsługa ctrl+k bez filtrów',
    },
    {
        type: 'NEW',
        color: 'green',
        description: 'Do sprawdzenia w edycji specyfikacji, dodawaniu parametrów i w głównych widokach',
        date: '',
        text: 'Odznaczanie reszty wierszy w PPM w przypadku kiedy z BE przychodzi odpowiedni parametr',
    },
    {
        type: 'NEW',
        color: 'green',
        description:
            'Do sprawdzenia w edycji nagłówka, tekst wklejony powinien zawierac zwykłą forme. Indeksy powinny być ustawiane wewnątrz komponentu (bo inczaje komponent zle działa). Powiązane z zadaniem dotyczącym ideksaow górnych/dolnych. jesli będzie ok to zastosouje do innych edytorow opisowych również. Stare dane trzeba bedzie wyprostowac',
        date: '',
        text: 'Biblioteka unorm do normalizacji tekstu  w komponencie opisowym',
    },
    {
        type: 'NEW',
        color: 'green',
        description: 'Wskazuje na ważna zmiane',
        date: '',
        text: 'Kolorowanie ważnych zmian',
    },
];
