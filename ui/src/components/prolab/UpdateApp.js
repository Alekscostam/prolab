import React, {useEffect, useRef, useState} from 'react';
import Popup from 'devextreme-react/popup';
import Button from 'devextreme-react/button';
import useStore from '../../store';
import LocUtils from '../../utils/LocUtils';
import Logger from '../../utils/Logger';
import {getStore} from '../../utils/helper/StoreHelper';

// const REMIND_AGAIN_TIME = 1 * 60 * 1000;
// const VERSION_CHECK_INTERVAL = 1 * 60 * 1000;

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
        return '.281';
    }
    return '.' + buildNumber;
};

const getCurrentVersion = () => {
    const applicationVersion = process.env.REACT_APP_VERSION;

    if (!applicationVersion) {
        return '';
    }
    const currentVersion = applicationVersion + getBuildNumberVersion();
    return currentVersion;
};

const getHashParts = (hash) => {
    const safeHash = hash || '#/';
    const questionMarkIndex = safeHash.indexOf('?');

    if (questionMarkIndex === -1) {
        const result = {
            hashPath: safeHash,
            queryString: '',
        };

        return result;
    }

    const result = {
        hashPath: safeHash.substring(0, questionMarkIndex),
        queryString: safeHash.substring(questionMarkIndex + 1),
    };

    return result;
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

    const oldReloadTime = searchParams.get('_reloadTime');

    searchParams.delete('_reloadTime');

    const newQueryString = searchParams.toString();
    const newHash = newQueryString ? hashPath + '?' + newQueryString : hashPath;
    const cleanUrl = origin + pathname + search + newHash;

    window.history.replaceState(null, '', cleanUrl);
};

const UpdateApp = ({disableLoginPageAction}) => {
    const aboutVersion = useStore((state) => state.historyVersion);

    const currentVersion = getCurrentVersion();

    const [visible, setVisible] = useState(false);
    const [serverVersion, setServerVersion] = useState('');
    const [configChanged, setConfigChanged] = useState(false);

    const remindAgainTimeoutRef = useRef(null);
    const remindBlockedUntilRef = useRef(0);
    const disableLoginPageActionRef = useRef(disableLoginPageAction);

    useEffect(() => {
        disableLoginPageActionRef.current = disableLoginPageAction;
    }, [disableLoginPageAction]);

    useEffect(() => {
        removeReloadTimeFromHash();
    }, []);

    useEffect(() => {
        const refreshAboutVersion = () => {
            const requestStartTime = new Date().getTime();

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
                    .then((changeLog) => {
                        const requestEndTime = new Date().getTime();
                    })
                    .catch((error) => {
                        const requestEndTime = new Date().getTime();
                    });
            } catch (error) {}
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
                        const disableLoginPageValue = configuration && configuration.DISABLE_LOGIN_PAGE;
                        const disableLoginPage = disableLoginPageValue === true || disableLoginPageValue === 'true';

                        if (disableLoginPage && typeof disableLoginPageActionRef.current === 'function') {
                            disableLoginPageActionRef.current();
                        }

                        if (!changed) {
                            return false;
                        }

                        setConfigChanged(true);

                        const currentTime = new Date().getTime();

                        if (currentTime >= remindBlockedUntilRef.current) {
                            setVisible(true);
                        }

                        return true;
                    })
                    .catch((error) => {
                        return false;
                    });
            } catch (error) {
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
            const currentTime = new Date().getTime();
            const remindBlockedUntil = remindBlockedUntilRef.current;

            if (currentTime >= remindBlockedUntil) {
                setVisible(true);
            } else {
            }

            return;
        }

        setServerVersion('');

        if (!configChanged) {
            setVisible(false);
        }
    }, [aboutVersion, currentVersion, configChanged]);

    useEffect(() => {}, [visible]);

    useEffect(() => {}, [serverVersion]);

    useEffect(() => {
        return () => {
            if (remindAgainTimeoutRef.current) {
                clearTimeout(remindAgainTimeoutRef.current);
            } else {
            }
        };
    }, []);

    const remindLater = () => {
        setVisible(false);

        const currentTime = new Date().getTime();

        const REMIND_AGAIN_TIME = getStore()?.updateApp?.REMIND_AGAIN_TIME || 60000;
        const blockedUntil = currentTime + REMIND_AGAIN_TIME;

        remindBlockedUntilRef.current = blockedUntil;

        if (remindAgainTimeoutRef.current) {
            clearTimeout(remindAgainTimeoutRef.current);
        }

        remindAgainTimeoutRef.current = setTimeout(() => {
            if ((serverVersion && serverVersion !== currentVersion) || configChanged) {
                setVisible(true);
            } else {
            }
        }, REMIND_AGAIN_TIME);
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
            width={430}
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
