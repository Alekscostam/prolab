import React, {useEffect, useRef, useState} from 'react';
import Popup from 'devextreme-react/popup';
import Button from 'devextreme-react/button';
import useStore from '../../store';
import LocUtils from '../../utils/LocUtils';

const REMIND_AGAIN_TIME = 1 * 60 * 1000;

const getLatestVersion = (changeLog) => {
    if (changeLog && changeLog.length > 0 && changeLog[0] && changeLog[0].version) {
        return changeLog[0].version;
    }

    return '';
};

const getBuildNumberVersion = () => {
    const buildNumber = process.env.REACT_APP_BUILD_NUMBER;

    if (!buildNumber || buildNumber === '#BUILD_NUMBER#') {
        return '.273';
    }

    return '.' + buildNumber;
};

const getCurrentVersion = () => {
    if (!process.env.REACT_APP_VERSION) {
        return '';
    }

    return process.env.REACT_APP_VERSION + getBuildNumberVersion();
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

    searchParams.set('_reloadTime', new Date().getTime().toString());

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

const UpdateApp = () => {
    const aboutVersion = useStore((state) => state.aboutVersion);

    const currentVersion = getCurrentVersion();

    const [visible, setVisible] = useState(false);
    const [serverVersion, setServerVersion] = useState('');

    const remindAgainTimeoutRef = useRef(null);
    const remindBlockedUntilRef = useRef(0);

    useEffect(() => {
        removeReloadTimeFromHash();
    }, []);

    useEffect(() => {
        const latestVersion = getLatestVersion(aboutVersion);

        if (!currentVersion || !latestVersion) {
            return;
        }

        if (latestVersion !== currentVersion) {
            setServerVersion(latestVersion);

            if (new Date().getTime() >= remindBlockedUntilRef.current) {
                setVisible(true);
            }
        }
    }, [aboutVersion, currentVersion]);

    useEffect(() => {
        return () => {
            if (remindAgainTimeoutRef.current) {
                clearTimeout(remindAgainTimeoutRef.current);
            }
        };
    }, []);

    const remindLater = () => {
        setVisible(false);

        remindBlockedUntilRef.current = new Date().getTime() + REMIND_AGAIN_TIME;

        if (remindAgainTimeoutRef.current) {
            clearTimeout(remindAgainTimeoutRef.current);
        }

        remindAgainTimeoutRef.current = setTimeout(() => {
            if (serverVersion && serverVersion !== currentVersion) {
                setVisible(true);
            }
        }, REMIND_AGAIN_TIME);
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
                        onClick={reloadApplication}
                    />
                </div>
            </div>
        </Popup>
    );
};

export default UpdateApp;
