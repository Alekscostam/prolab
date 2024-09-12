export const tabsPositionsSelectBoxLabel = { 'aria-label': 'Tab position' };
export const tabsPositions = ['top', 'left', 'right', 'bottom'];
export const stylingModesSelectBoxLabel = { 'aria-label': 'Styling mode' };
export const stylingModes = ['secondary', 'primary'];
export const iconPositionsSelectBoxLabel = { 'aria-label': 'Icon positions' };
export const iconPositions = ['top', 'start', 'end', 'bottom'];
const features = [
    {
      type: 'VER',
      color: 'blue',
      description: process.env.REACT_APP_BUILD_NUMBER,
      date: '',
      text: 'Build number',
    },
    {
      type: 'VER',
      color: 'blue',
      description: process.env.REACT_APP_NAME,
      date: '',
      text: 'App name',
    },
  
    {
      type: 'VER',
      color: 'blue',
      description: process.env.REACT_APP_BUILD_TIME,
      date: '',
      text: 'Build time',
    },{
      type: 'VER',
      color: 'blue',
      description: process.env.REACT_APP_NAME_DEVICE_ID,
      date: '',
      text: 'Device id',
    },
    {

    type: 'BUG',
    color: 'red',
    description: '@Roman dodałem _ORDER',
    date: '',
    text: 'Nie zapisuje zmiany kolejności parametrów. Gdy strzałkami zmienię kolejność specyfikacji to nie zapisuje się.',
    link: "https://trello.com/c/DpiJW6n0/415-nie-zapisuje-zmiany-kolejno%C5%9Bci-parametr%C3%B3w-gdy-strza%C5%82kami-zmieni%C4%99-kolejno%C5%9B%C4%87-specyfikacji-to-nie-zapisuje-si%C4%99"
  },
  {
    type: 'BUG',
    color: 'red',
    description: 'Tutaj niestety musicie przetestowac teraz rozne miejsca zwiazane z przeliczaniem... np. podwidoki widoki itd',
    date: '',
    text: 'Nie przelicza formuł dla sprawdzenia z poziomu przeglądu rejestru głównego.',
    link: "https://trello.com/c/JSK7ae6m/518-fix-nie-przelicza-formu%C5%82-dla-sprawdzenia-z-poziomu-przegl%C4%85du-rejestru-g%C5%82%C3%B3wnego"
  },  
  {
    type: 'BUG',
    color: 'red',
    description: 'Dodałem ale tutaj tez trzeba byc czujny i przetestowac na kilku casach',
    date: '',
    text: 'Tryb edycji pełnoekranowy nie działa podczas dodawania',
    link: "https://trello.com/c/z54F8UwW/513-fix-tryb-edycji-pe%C5%82noekranowy-nie-dzia%C5%82a-podczas-dodawania"
  },
  {
    type: 'BUG',
    color: 'red',
    description: '@Roman dodałem _ORDER',
    date: '',
    text: 'Kolejność parametrów po dodaniu',
    link: "https://trello.com/c/b95pR9fg/416-fix-kolejno%C5%9B%C4%87-parametr%C3%B3w-po-dodaniu"
  },
  {
    type: 'BUG',
    color: 'red',
    description: 'tutaj ciezko to bedzie przetestowac. Po prostu tzreba byc czujnym',
    date: '',
    text: 'Czasem wylogowuje w trakcie pracy. Np. wylogował mnie przy zatwierdzaniu, gdzie nie było żadnej bezczynności.',
    link: "https://trello.com/c/M6krrsLU/414-czasem-wylogowuje-w-trakcie-pracy-np-wylogowa%C5%82-mnie-przy-zatwierdzaniu-gdzie-nie-by%C5%82o-%C5%BCadnej-bezczynno%C5%9Bci"
  },
  // FIX: dokonczenie fixa na nie wyswietlające sie operationsy w dodawnaiu parametrow, FIx na zle dzialajacy komponent C w edycji naglowka
  // {
  //   type: 'INFO',
  //   color: 'orange',
  //   description: 'Nalezy przetestować wywoływanie dokumentów z różnych miejsc, gdyż doszla tam zmiana odnosnie wybeirania odpowiedniego rowa',
  //   text: 'Zmiany w dokuemtnach',
  // },
  // {
  //   type: 'NEW',
  //   color: 'green',
  //   description: '',
  //   date: '2023/09/16',
  //   text: 'Dodanie viewera do PDF, EXCEL, DOCX',
  // },
  // {
  //   type: 'NEW',
  //   color: 'green',
  //   description: 'czasami wylogowuje przez np. nieprawidłowy token',
  //   text: 'Dodanie komunikatu błedu po nieznanym wylogowaniu',
  // },{
  //   type: 'NEW',
  //   color: 'green',
  //   description: 'W przypadku pojawienia sie nowej wersji apliakcji wyskakuje ino o wersji ',
  //   text: 'Version preview dialog',
  // },
 
];
export const dataSource = [
  {
    title: 'Fix',
    tasks: features.filter((item) => item.type === 'BUG'),
  },
  {
     title: 'Nowe',
     tasks: features.filter((item) => item.type === 'NEW'),
  },
  {
    title: 'Wersja',
    tasks: features.filter((item) => item.type === 'VER'),
  },

];