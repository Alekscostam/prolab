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
    description: '',
    text: 'Prawidłowe wysyłanie informacji o typie boolean w dokumentach',
  },
  {
    type: 'BUG',
    color: 'red',
    description: '',
    date: '',
    text: 'Nowa walidacja na okno textbox dla typo WART w edycji specyfikacji',
  },
  {
    type: 'BUG',
    color: 'red',
    description: '',
    date: '',
    text: 'Fix na nie wyswietlające sie operationsy (po prawej stornie po wejsciu w szablony a potem metody w dodawnaiu parametrów)',
  },
  {
    type: 'BUG',
    color: 'red',
    description: '',
    date: '',
    text: 'Fix w edycji nagłówka po próbie wpisania cos na srodku wyrazu w  komponencie Typu C. Nalezy sprawdzic czy komponent dobrze zapisuej dane',
  },
  {
    type: 'BUG',
    color: 'red',
    description: '',
    date: '',
    text: 'Fix na blokade widoku w endycji naglowka',
  },
  // FIX: dokonczenie fixa na nie wyswietlające sie operationsy w dodawnaiu parametrow, FIx na zle dzialajacy komponent C w edycji naglowka
  {
    type: 'INFO',
    color: 'orange',
    description: 'Nalezy przetestować wywoływanie dokumentów z różnych miejsc, gdyż doszla tam zmiana odnosnie wybeirania odpowiedniego rowa',
    text: 'Zmiany w dokuemtnach',
  },
  {
    type: 'NEW',
    color: 'green',
    description: '',
    date: '2023/09/16',
    text: 'Dodanie viewera do PDF, EXCEL, DOCX',
  },
  {
    type: 'NEW',
    color: 'green',
    description: 'czasami wylogowuje przez np. nieprawidłowy token',
    text: 'Dodanie komunikatu błedu po nieznanym wylogowaniu',
  },{
    type: 'NEW',
    color: 'green',
    description: 'W przypadku pojawienia sie nowej wersji apliakcji wyskakuje ino o wersji ',
    text: 'Version preview dialog',
  },
 
];
export const dataSource = [
    {
        title: 'Nowe',
        tasks: features.filter((item) => item.type === 'NEW'),
    },
  {
    title: 'Fix',
    tasks: features.filter((item) => item.type === 'BUG'),
  },
  {
    title: 'Wersja',
    tasks: features.filter((item) => item.type === 'VER'),
  },

];