import React, {useEffect, useRef, useState} from 'react';
import Popup from 'devextreme-react/popup';
import Button from 'devextreme-react/button';
import useStore from '../../store';
import LocUtils from '../../utils/LocUtils';
import Logger from '../../utils/Logger';
import {getStore} from '../../utils/helper/StoreHelper';

const LOG_PREFIX = '[UpdateApp]';

const log = (...args) => {
    Logger.info(LOG_PREFIX, ...args);
};

const logError = (...args) => {
    Logger.error(LOG_PREFIX, ...args);
};

const getLatestVersion = (changeLog) => {
    if (changeLog && changeLog.length > 0 && changeLog[0] && changeLog[0].version) {
        return changeLog[0].version;
    }

    return '';
};

const getBuildNumberVersion = () => {
    const buildNumber = process.env.REACT_APP_BUILD_NUMBER;

    if (!buildNumber || buildNumber === '#BUILD_NUMBER#') {
        return '.284';
    }

    return '.' + buildNumber;
};

const getCurrentVersion = () => {
    const applicationVersion = process.env.REACT_APP_VERSION;

    if (!applicationVersion) {
        return '';
    }

    return applicationVersion + getBuildNumberVersion();
};

const getHashParts = (hash) => {
    const safeHash = hash || '#/';
    const questionMarkIndex = safeHash.indexOf('?');

    if (questionMarkIndex === -1) {
        return {
            hashPath: safeHash,
            queryString: '',
        };
    }

    return {
        hashPath: safeHash.substring(0, questionMarkIndex),
        queryString: safeHash.substring(questionMarkIndex + 1),
    };
};

const reloadApplication = () => {
    const {origin, pathname, search, hash} = window.location;
    const {hashPath, queryString} = getHashParts(hash);

    const searchParams = new URLSearchParams(queryString);
    const reloadTime = new Date().getTime().toString();

    searchParams.set('_reloadTime', reloadTime);

    const newHash = hashPath + '?' + searchParams.toString();
    const newUrl = origin + pathname + search + newHash;

    window.history.replaceState(null, '', newUrl);

    window.location.reload();
};

const removeReloadTimeFromHash = () => {
    const {origin, pathname, search, hash} = window.location;

    if (!hash || hash.indexOf('?') === -1) {
        return;
    }

    const {hashPath, queryString} = getHashParts(hash);
    const searchParams = new URLSearchParams(queryString);

    if (!searchParams.has('_reloadTime')) {
        return;
    }

    searchParams.delete('_reloadTime');

    const newQueryString = searchParams.toString();
    const newHash = newQueryString ? hashPath + '?' + newQueryString : hashPath;

    const cleanUrl = origin + pathname + search + newHash;

    window.history.replaceState(null, '', cleanUrl);
};

const UpdateApp = ({maintenanceBannerAction}) => {
    const aboutVersion = useStore((state) => state.historyVersion);

    const currentVersion = getCurrentVersion();

    const [visible, setVisible] = useState(false);
    const [serverVersion, setServerVersion] = useState('');
    const [configChanged, setConfigChanged] = useState(false);

    const autoRefreshTimeoutRef = useRef(null);
    const maintenanceBannerActionRef = useRef(maintenanceBannerAction);

    const AUTO_REFRESH_DELAY = getStore()?.updateApp?.AUTO_REFRESH_DELAY || 1;

    useEffect(() => {
        maintenanceBannerActionRef.current = maintenanceBannerAction;
    }, [maintenanceBannerAction]);

    useEffect(() => {
        removeReloadTimeFromHash();
    }, []);

    useEffect(() => {
        const refreshAboutVersion = () => {
            try {
                const readAboutVersion = getStore().readHistoryVersion;

                if (typeof readAboutVersion !== 'function') {
                    return Promise.resolve(null);
                }

                const result = readAboutVersion();

                if (!result || typeof result.then !== 'function') {
                    return;
                }

                result
                    .then(() => {})
                    .catch((error) => {
                        logError('Błąd podczas pobierania wersji aplikacji', error);
                    });
            } catch (error) {
                logError('Błąd podczas pobierania wersji aplikacji', error);
            }
        };

        const refreshConfigChanged = () => {
            const checkConfigChanged = getStore().checkConfigChanged;

            if (typeof checkConfigChanged !== 'function') {
                return Promise.resolve(false);
            }

            try {
                const result = checkConfigChanged();

                if (!result || typeof result.then !== 'function') {
                    return Promise.resolve(false);
                }

                return result
                    .then((response) => {
                        const changed = typeof response === 'boolean' ? response : !!(response && response.changed);

                        const configuration = response && typeof response !== 'boolean' ? response.configuration : null;

                        const maintenanceBanner = configuration && configuration.MAINTENANCE_BANNER;

                        const maintenanceBannerEnabled =
                            maintenanceBanner &&
                            (maintenanceBanner.ENABLED === true || maintenanceBanner.ENABLED === 'true');

                        if (typeof maintenanceBannerActionRef.current === 'function') {
                            maintenanceBannerActionRef.current(!!maintenanceBannerEnabled);
                        }

                        if (!changed) {
                            return false;
                        }

                        setConfigChanged(true);

                        /*
                         * Jeżeli użytkownik nie wybrał jeszcze
                         * automatycznego odświeżenia, pokazujemy dialog.
                         */
                        if (!autoRefreshTimeoutRef.current) {
                            setVisible(true);
                        }

                        return true;
                    })
                    .catch((error) => {
                        logError('Błąd podczas sprawdzania konfiguracji', error);

                        return false;
                    });
            } catch (error) {
                logError('Błąd podczas sprawdzania konfiguracji', error);

                return Promise.resolve(false);
            }
        };

        const refreshUpdateStatus = () => {
            refreshAboutVersion();
            refreshConfigChanged();
        };

        refreshUpdateStatus();

        const VERSION_CHECK_INTERVAL = getStore()?.updateApp?.VERSION_CHECK_INTERVAL || 60000;

        const intervalId = setInterval(() => {
            refreshUpdateStatus();
        }, VERSION_CHECK_INTERVAL);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        const latestVersion = getLatestVersion(aboutVersion);

        if (!currentVersion) {
            return;
        }

        if (!latestVersion) {
            return;
        }

        if (latestVersion !== currentVersion) {
            setServerVersion(latestVersion);

            /*
             * Jeśli użytkownik wybrał już automatyczny refresh,
             * nie pokazujemy ponownie dialogu.
             */
            if (!autoRefreshTimeoutRef.current) {
                setVisible(true);
            }

            return;
        }

        setServerVersion('');

        if (!configChanged) {
            setVisible(false);
        }
    }, [aboutVersion, currentVersion, configChanged]);

    useEffect(() => {
        return () => {
            if (autoRefreshTimeoutRef.current) {
                clearTimeout(autoRefreshTimeoutRef.current);
            }
        };
    }, []);

    const autoRefresh = () => {
        setVisible(false);

        if (autoRefreshTimeoutRef.current) {
            clearTimeout(autoRefreshTimeoutRef.current);
        }

        autoRefreshTimeoutRef.current = setTimeout(() => {
            reloadApplication();
        }, AUTO_REFRESH_DELAY * 60 * 1000);
    };

    const handleRefreshNow = () => {
        reloadApplication();
    };

    return (
        <Popup
            visible={visible}
            title={LocUtils.locFromStoreWithDefault(
                'Application_Update_Available',
                'Dostępna jest aktualizacja aplikacji'
            )}
            width={'auto'}
            height='auto'
            showCloseButton={false}
            closeOnOutsideClick={false}
            dragEnabled={false}
        >
            <div style={{padding: '10px 5px'}}>
                <p>
                    {configChanged && serverVersion && serverVersion !== currentVersion
                        ? LocUtils.locFromStoreWithDefault(
                              'Application_And_Config_Updated_Refresh_Page',
                              'Wykryto nową wersję aplikacji oraz aktualizację parametrów. Odśwież stronę, aby zastosować zmiany.'
                          )
                        : configChanged
                        ? LocUtils.locFromStoreWithDefault(
                              'Application_Config_Updated_Refresh_Page',
                              'Parametry aplikacji zostały zaktualizowane. Odśwież stronę, aby zastosować nowe ustawienia.'
                          )
                        : LocUtils.locFromStoreWithDefault(
                              'Application_Updated_Refresh_Page',
                              'Aplikacja została zaktualizowana. Odśwież stronę, aby korzystać z najnowszej wersji.'
                          )}
                </p>

                {serverVersion && serverVersion !== currentVersion && (
                    <p>
                        {LocUtils.locFromStoreWithDefault('Current_Version', 'Aktualna wersja')}:{' '}
                        <strong>{currentVersion}</strong>
                        <br />
                        {LocUtils.locFromStoreWithDefault('New_Version', 'Nowa wersja')}:{' '}
                        <strong>{serverVersion}</strong>
                    </p>
                )}

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '8px',
                        marginTop: '20px',
                    }}
                >
                    <Button
                        text={LocUtils.locFromStoreWithDefault(
                            'Refresh_Later',
                            'Odśwież automatycznie za {} min'
                        ).replace('{}', AUTO_REFRESH_DELAY)}
                        type='normal'
                        onClick={autoRefresh}
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
