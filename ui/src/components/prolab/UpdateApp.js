import React, {useEffect, useRef, useState} from 'react';
import Popup from 'devextreme-react/popup';
import Button from 'devextreme-react/button';
import useStore from '../../store';
import LocUtils from '../../utils/LocUtils';
import Logger from '../../utils/Logger';

const REMIND_AGAIN_TIME = 1 * 60 * 1000;
const VERSION_CHECK_INTERVAL = 1 * 60 * 1000;

const LOG_PREFIX = '[UpdateApp]';

const log = (...args) => {
    Logger.info(LOG_PREFIX, ...args);
};

const logError = (...args) => {
    Logger.error(LOG_PREFIX, ...args);
};

const getLatestVersion = (changeLog) => {
    log('getLatestVersion - otrzymany aboutVersion:', changeLog);

    if (changeLog && changeLog.length > 0 && changeLog[0] && changeLog[0].version) {
        log('getLatestVersion - znaleziona wersja serwera:', changeLog[0].version);

        return changeLog[0].version;
    }

    log('getLatestVersion - nie znaleziono wersji serwera.');

    return '';
};

const getBuildNumberVersion = () => {
    const buildNumber = process.env.REACT_APP_BUILD_NUMBER;

    log('getBuildNumberVersion - REACT_APP_BUILD_NUMBER:', buildNumber);

    if (!buildNumber || buildNumber === '#BUILD_NUMBER#') {
        log('getBuildNumberVersion - brak build number, używam wartości domyślnej: .276');

        return '.276';
    }

    log('getBuildNumberVersion - używam build number:', buildNumber);

    return '.' + buildNumber;
};

const getCurrentVersion = () => {
    const applicationVersion = process.env.REACT_APP_VERSION;

    log('getCurrentVersion - REACT_APP_VERSION:', applicationVersion);

    if (!applicationVersion) {
        log('getCurrentVersion - brak REACT_APP_VERSION.');

        return '';
    }

    const currentVersion = applicationVersion + getBuildNumberVersion();

    log('getCurrentVersion - pełna aktualna wersja aplikacji:', currentVersion);

    return currentVersion;
};

const getHashParts = (hash) => {
    const safeHash = hash || '#/';
    const questionMarkIndex = safeHash.indexOf('?');

    log('getHashParts - hash wejściowy:', hash);
    log('getHashParts - bezpieczny hash:', safeHash);

    if (questionMarkIndex === -1) {
        const result = {
            hashPath: safeHash,
            queryString: '',
        };

        log('getHashParts - brak parametrów w hash:', result);

        return result;
    }

    const result = {
        hashPath: safeHash.substring(0, questionMarkIndex),
        queryString: safeHash.substring(questionMarkIndex + 1),
    };

    log('getHashParts - rozdzielony hash:', result);

    return result;
};

const reloadApplication = () => {
    log('reloadApplication - rozpoczęcie odświeżania aplikacji.');

    const {origin, pathname, search, hash} = window.location;
    const {hashPath, queryString} = getHashParts(hash);

    log('reloadApplication - aktualna lokalizacja:', {
        origin,
        pathname,
        search,
        hash,
        hashPath,
        queryString,
    });

    const searchParams = new URLSearchParams(queryString);
    const reloadTime = new Date().getTime().toString();

    searchParams.set('_reloadTime', reloadTime);

    const newHash = hashPath + '?' + searchParams.toString();

    const newUrl = origin + pathname + search + newHash;

    log('reloadApplication - ustawiam parametr _reloadTime:', reloadTime);

    log('reloadApplication - nowy URL:', newUrl);

    window.history.replaceState(null, '', newUrl);

    log('reloadApplication - wykonuję window.location.reload().');

    window.location.reload();
};

const removeReloadTimeFromHash = () => {
    const {origin, pathname, search, hash} = window.location;

    log('removeReloadTimeFromHash - sprawdzam hash:', hash);

    if (!hash || hash.indexOf('?') === -1) {
        log('removeReloadTimeFromHash - brak parametrów w hash, nic nie usuwam.');

        return;
    }

    const {hashPath, queryString} = getHashParts(hash);
    const searchParams = new URLSearchParams(queryString);

    if (!searchParams.has('_reloadTime')) {
        log('removeReloadTimeFromHash - brak parametru _reloadTime.');

        return;
    }

    const oldReloadTime = searchParams.get('_reloadTime');

    log('removeReloadTimeFromHash - usuwam parametr _reloadTime:', oldReloadTime);

    searchParams.delete('_reloadTime');

    const newQueryString = searchParams.toString();

    const newHash = newQueryString ? hashPath + '?' + newQueryString : hashPath;

    const cleanUrl = origin + pathname + search + newHash;

    log('removeReloadTimeFromHash - czysty URL:', cleanUrl);

    window.history.replaceState(null, '', cleanUrl);
};

const UpdateApp = () => {
    const aboutVersion = useStore((state) => state.aboutVersion);

    const readAboutVersion = useStore((state) => state.readAboutVersion);

    const currentVersion = getCurrentVersion();

    const [visible, setVisible] = useState(false);
    const [serverVersion, setServerVersion] = useState('');

    const remindAgainTimeoutRef = useRef(null);
    const remindBlockedUntilRef = useRef(0);

    useEffect(() => {
        log('Aktualna wersja aplikacji:', currentVersion);

        log('Początkowa wartość aboutVersion:', aboutVersion);

        removeReloadTimeFromHash();
    }, []);

    useEffect(() => {
        log('Uruchamiam mechanizm cyklicznego sprawdzania wersji.');

        log('Interwał sprawdzania wersji:', VERSION_CHECK_INTERVAL, 'ms');

        if (typeof readAboutVersion !== 'function') {
            logError('Funkcja readAboutVersion nie została jeszcze ustawiona w store.');

            return;
        }

        const refreshAboutVersion = () => {
            const requestStartTime = new Date().getTime();

            log('Rozpoczynam pobieranie wersji z serwera.');

            log('Czas rozpoczęcia requestu:', new Date(requestStartTime).toISOString());

            try {
                const result = readAboutVersion();

                log('readAboutVersion zostało wywołane.');

                log('Wynik zwrócony przez readAboutVersion:', result);

                if (!result || typeof result.then !== 'function') {
                    logError('readAboutVersion nie zwróciło Promise.');

                    return;
                }

                result
                    .then((changeLog) => {
                        const requestEndTime = new Date().getTime();

                        log('Pobieranie wersji zakończone sukcesem.');

                        log('Pobrany changeLog:', changeLog);

                        log(
                            'Najnowsza wersja:',
                            changeLog && changeLog.length > 0 && changeLog[0] ? changeLog[0].version : 'brak wersji'
                        );

                        log('Czas requestu:', requestEndTime - requestStartTime, 'ms');
                    })
                    .catch((error) => {
                        const requestEndTime = new Date().getTime();

                        logError('Nie udało się pobrać wersji aplikacji:', error);

                        logError('Czas nieudanego requestu:', requestEndTime - requestStartTime, 'ms');
                    });
            } catch (error) {
                logError('Błąd podczas wywołania readAboutVersion:', error);
            }
        };

        log('Pierwsze sprawdzenie wersji wykonywane natychmiast.');

        refreshAboutVersion();

        const intervalId = setInterval(() => {
            log('Minął interwał. Ponownie sprawdzam wersję aplikacji.');

            refreshAboutVersion();
        }, VERSION_CHECK_INTERVAL);

        log('Utworzono interval:', intervalId);

        return () => {
            log('Czyszczę interval sprawdzania wersji:', intervalId);

            clearInterval(intervalId);
        };
    }, [readAboutVersion]);

    useEffect(() => {
        log('Wykryto zmianę aboutVersion lub currentVersion.');

        log('aboutVersion ze store:', aboutVersion);

        log('currentVersion z uruchomionej aplikacji:', currentVersion);

        const latestVersion = getLatestVersion(aboutVersion);

        log('Wersja odczytana z serwera:', latestVersion);

        log('Wersja aktualnie uruchomionej aplikacji:', currentVersion);

        if (!currentVersion) {
            logError('Nie można porównać wersji. Brak currentVersion.');

            return;
        }

        if (!latestVersion) {
            logError('Nie można porównać wersji. Brak latestVersion z serwera.');

            return;
        }

        if (latestVersion !== currentVersion) {
            log('Wykryto różnicę wersji.');

            log('Stara wersja:', currentVersion);

            log('Nowa wersja:', latestVersion);

            setServerVersion(latestVersion);

            const currentTime = new Date().getTime();

            const remindBlockedUntil = remindBlockedUntilRef.current;

            log('Aktualny czas:', currentTime);

            log('Popup zablokowany do:', remindBlockedUntil);

            if (currentTime >= remindBlockedUntil) {
                log('Pokazuję popup aktualizacji.');

                setVisible(true);
            } else {
                log('Popup pozostaje ukryty, ponieważ użytkownik wcześniej wybrał opcję „Później”.');
            }

            return;
        }

        log('Wersje są zgodne. Aktualizacja nie jest wymagana.');

        setServerVersion('');
        setVisible(false);
    }, [aboutVersion, currentVersion]);

    useEffect(() => {
        log('Zmiana widoczności popupu:', visible);
    }, [visible]);

    useEffect(() => {
        log('Zmiana serverVersion:', serverVersion);
    }, [serverVersion]);

    useEffect(() => {
        return () => {
            if (remindAgainTimeoutRef.current) {
                log('Czyszczę timeout przypomnienia:', remindAgainTimeoutRef.current);

                clearTimeout(remindAgainTimeoutRef.current);
            } else {
                log('Brak aktywnego timeoutu przypomnienia do wyczyszczenia.');
            }
        };
    }, []);

    const remindLater = () => {
        log('Użytkownik wybrał opcję „Później”.');

        setVisible(false);

        const currentTime = new Date().getTime();

        const blockedUntil = currentTime + REMIND_AGAIN_TIME;

        remindBlockedUntilRef.current = blockedUntil;

        log('Popup został ukryty.');

        log('Aktualny czas:', currentTime);

        log('Popup będzie ponownie dostępny od:', blockedUntil);

        log('Ponowne przypomnienie za:', REMIND_AGAIN_TIME, 'ms');

        if (remindAgainTimeoutRef.current) {
            log('Istnieje poprzedni timeout. Czyszczę go:', remindAgainTimeoutRef.current);

            clearTimeout(remindAgainTimeoutRef.current);
        }

        remindAgainTimeoutRef.current = setTimeout(() => {
            log('Uruchomiono timeout ponownego przypomnienia.');

            log('serverVersion:', serverVersion);

            log('currentVersion:', currentVersion);

            if (serverVersion && serverVersion !== currentVersion) {
                log('Wersje nadal się różnią. Ponownie pokazuję popup.');

                setVisible(true);
            } else {
                log('Wersje są zgodne lub brak serverVersion. Popup nie zostanie pokazany.');
            }
        }, REMIND_AGAIN_TIME);

        log('Utworzono nowy timeout przypomnienia:', remindAgainTimeoutRef.current);
    };

    const handleRefreshNow = () => {
        log('Użytkownik wybrał opcję „Odśwież teraz”.');

        log('Aktualna wersja:', currentVersion);

        log('Wersja serwera:', serverVersion);

        reloadApplication();
    };

    return (
        <Popup
            visible={visible}
            title='Dostępna jest nowa wersja aplikacji'
            width={430}
            height='auto'
            showCloseButton={false}
            closeOnOutsideClick={false}
            dragEnabled={false}
        >
            <div style={{padding: '10px 5px'}}>
                <p>
                    {LocUtils.locFromStoreWithDefault(
                        'Application_Updated_Refresh_Page',
                        'Aplikacja została zaktualizowana. Odśwież stronę, aby korzystać z najnowszej wersji.'
                    )}
                </p>

                <p>
                    {LocUtils.locFromStoreWithDefault('Current_Version', 'Aktualna wersja')}:{' '}
                    <strong>{currentVersion}</strong>
                    <br />
                    {LocUtils.locFromStoreWithDefault('New_Version', 'Nowa wersja')}: <strong>{serverVersion}</strong>
                </p>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '8px',
                        marginTop: '20px',
                    }}
                >
                    <Button
                        text={LocUtils.locFromStoreWithDefault('Later', 'Później')}
                        type='normal'
                        onClick={remindLater}
                    />

                    <Button
                        text={LocUtils.locFromStoreWithDefault('Refresh_Now', 'Odśwież teraz')}
                        type='default'
                        onClick={handleRefreshNow}
                    />
                </div>
            </div>
        </Popup>
    );
};

export default UpdateApp;
