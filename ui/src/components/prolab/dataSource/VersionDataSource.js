import { CookiesName } from "../../../enum/CookieName";
import useStore from "../../../store";

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
      description: process.env.REACT_APP_BUILD_NUMBER ,
      date: '',
      text: 'Build number',
    },
    {
      identifier:"APP_NAME",
      type: 'VER',
      color: 'blue',
      description:  sessionStorage.getItem(CookiesName.APP_NAME),
      date: '',
      text: 'App name',
    },
    {
      identifier:"APP_VERSION",
      type: 'VER',
      color: 'blue',
      description: sessionStorage.getItem(CookiesName.APP_VERSION),
      date: '',
      text: 'App version',
    },
  
    {
      type: 'VER',
      color: 'blue',
      description: process.env.REACT_APP_BUILD_TIME,
      date: '',
      text: 'Build time',
    },{
      
      identifier:"DEVICE_NAME",
      type: 'VER',
      color: 'blue',
      description: sessionStorage.getItem(CookiesName.DEVICE_NAME),
      date: '',
      text: 'Device name',
    },
    {

    type: 'BUG',
    color: 'red',
    description: 'Nalezy przetetsowac na dashboard i w zwyklym widoku',
    date: '',
    text: 'Naprawa błędu związanego z TAK/NIE dla Question po wywolaniu wtyczki.',
    link: "https://trello.com/c/p4G5qAGv/480-komunikat-po-wykonaniu-wtyczki"
  },
  {
    type: 'BUG',
    color: 'red',
    description: 'Napraw min max wymaga przetestowania w sumie tylkow  edycji specyfikacji',
    date: '',
    text: 'Zadanie z min/max',
    link: "https://trello.com/c/CeGApx1L/503-walidacja-p%C3%B3l-wart-min-max-nominalna"
  },  
  {
    type: 'BUG',
    color: 'red',
    description: 'On wyswietlal sie w brzydki sposob + kalendarz byl niebieską plamą',
    date: '',
    text: 'Poprawa widoku publikacji dokuemntu',
  },
  {
    type: 'BUG',
    color: 'red',
    description: 'On czasami mrugal jak sie robilo gora dol w komponencie z liczbą',
    date: '',
    text: 'Poprawa widoku copy',
  },  
  {
    type: 'NEW',
    color: 'green',
    description: 'Wymieniłem ten komponent, bo było to rozwiązanie dosyć przestarszale, mogłem go zrobic w dwóch wersjach niebieski i biały ale ten wydawał mi sie lepszy',
    date: '',
    text: 'Nowy komponent okruszkow',
  },
  // {
  //   type: 'BUG',
  //   color: 'red',
  //   description: 'tutaj ciezko to bedzie przetestowac. Po prostu tzreba byc czujnym',
  //   date: '',
  //   text: 'Czasem wylogowuje w trakcie pracy. Np. wylogował mnie przy zatwierdzaniu, gdzie nie było żadnej bezczynności.',
  //   link: "https://trello.com/c/M6krrsLU/414-czasem-wylogowuje-w-trakcie-pracy-np-wylogowa%C5%82-mnie-przy-zatwierdzaniu-gdzie-nie-by%C5%82o-%C5%BCadnej-bezczynno%C5%9Bci"
  // },
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