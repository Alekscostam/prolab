import { CookiesName } from "../../../enum/CookieName";

export const tabsPositionsSelectBoxLabel = { 'aria-label': 'Tab position' };
export const tabsPositions = ['top', 'left', 'right', 'bottom'];
export const stylingModesSelectBoxLabel = { 'aria-label': 'Styling mode' };
export const stylingModes = ['secondary', 'primary'];
export const iconPositionsSelectBoxLabel = { 'aria-label': 'Icon positions' };
export const iconPositions = ['top', 'start', 'end', 'bottom'];
export const features = [
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

    type: 'FIX',
    color: 'red',
    description: 'Należy przetestowac "czy na pewno chcesz zakonczyc edycji w batch oraz edispec"',
    date: '',
    text: 'Naprawa dialogu dotyczącego wyjscia z edycji specyfikacji i batch.',
    link: "https://trello.com/c/uYBlor7O/529-fix-komunikat-czy-na-pewno-chcesz-zamkn%C4%85%C4%87-edycj%C4%99"
  },
  {
    type: 'FIX',
    color: 'red',
    description: '',
    date: '',
    text: 'Zmiana wyświetlania okruszków',
  },  
  {
    type: 'FIX',
    color: 'red',
    description: 'Do przetestowania funkcje i dokumenty na liscie kafelek w "trzy kropkach"',
    date: '',
    text: 'Naprawa funkcji i dokumentów z trzech kropek na widoku kafelek',
    link: "https://trello.com/c/dlZGDZTx/545-obs%C5%82uga-menu-rekordu-w-widoku-kafelek"
  },  
  {
    type: 'FIX',
    color: 'red',
    description: '',
    date: '',
    text: 'Tłumaczenia dla dialogu "Aktualna wersja aplikacji"',
  },
  {
    type: 'NEW',
    color: 'green',
    description: 'nalezy kliknąc w przycisk changelog w dialogu wersji',
    date: '',
    text: 'ChangeLog do pobrania w dialogu wersji',
  }, 
  {
    type: 'NEW',
    color: 'green',
    description: 'Tego nie ma jak testowac, zmiana funkcjonalna w aplikacji',
    date: '',
    text: 'Przekazywanie tłumaczeń do nowego globalnego storage "zustand" w aplikacji',
  }, 
  {
    type: 'NEW',
    color: 'green',
    description: 'Do przetestowania prawidłowośc działania wszystkich przycisków PPM w trybie widoku kafelej',
    date: '',
    text: 'Przyciski PPM na CardView',
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
