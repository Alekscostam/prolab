import {Dialog} from 'primereact/dialog';
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import LocUtils from '../../utils/LocUtils';
import {TabPanel} from 'devextreme-react';
import {StringUtils} from '../../utils/StringUtils';
import ActionButton from '../ActionButton';
import useStore from '../../store';
import {CookiesName} from '../../enum/CookieName';
import DashboardControl from 'devexpress-dashboard-react';
import {version as devExtremeVersion} from 'devextreme/core/version';
import {getStore} from '../../utils/helper/StoreHelper';

const tabsPositions = ['top', 'left', 'right', 'bottom'];
const stylingModes = ['secondary', 'primary'];
const iconPositions = ['top', 'start', 'end', 'bottom'];

export const VersionPreviewDialog = (props) => {
    const [aboutVersion, setAboutVersion] = useState([]);

    useEffect(() => {
        setAboutVersion(getStore().aboutVersion);
        return () => {};
    }, [props, aboutVersion]);

    const parameters = [
        {
            type: 'PARAMETERS',
            text: 'APP_FULL_NAME',
            description: 'Pełna nazwa aplikacji',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'APP_NAME',
            description: 'Nazwa aplikacji',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'BAR_CODE_SHOW_METHOD',
            description: 'Metoda wykrywania barcode dla czytnika',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'CAPTCHA -> SITE_KEY i ENABLED',
            description: 'Parametry do wyświetlenia captchy',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'DEVICE_NAME',
            description: 'Nazwa urządzenia',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'DRAGGABLE_GRID_ENABLED',
            description: 'Możliwość przeciągania grida lewym klawiszem myszy',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'FORTOGPASSWORD_VIEWID',
            description: 'Przycisk zapomniałem hasła',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'LANG',
            description: 'Domyślny język',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'LANG_LIST',
            description: 'Lista dostępnych języków',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'REACT_APP_BACKEND_URL',
            description: 'URL do BE',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'REACT_APP_URL_PREFIX',
            description: 'Prefix do URL',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'REMEMBER_ME',
            description: 'Zapamiętywanie na stronie logowania',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'SHOW_FILTER_CLEAR',
            description: 'Przycisk czyszczenia filtrów na widokach',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'SHOW_HINT_LIST_BUTTONS',
            description: 'Widoczność przycisków listy podpowiedzi w TreeList w trybie podglądu',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'SHOW_MARKUP_ON_HTML_EDITOR',
            description: 'Widoczność na przycisku markup w edytorach tekstowych',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'SHOW_VERSION_DIALOG',
            description: 'Widoczność dialogu wersji',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'WSS_URL',
            description: 'URL BE do websocketów',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'SIGNIN_VIEWID',
            description: 'Przycisk rejestracji na stronie logowania',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'BI_RELOAD_IN_MILISECONDS',
            description: 'Odświeżanie dashboardu',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'BI_BE_URL',
            description: 'Link do BE dla Dashboardu',
            isNew: true,
            color: 'orange',
        },
        {
            type: 'PARAMETERS',
            text: 'BI_WORKING_MODE',
            description: 'Working mode dla dashboardu',
            isNew: true,
            color: 'orange',
        },
    ];

    const version = [
        {
            type: 'VER',
            color: 'blue',
            description: process.env.REACT_APP_BUILD_NUMBER,
            date: '',
            text: 'Build number',
            isNew: true,
        },
        {
            identifier: 'APP_NAME',
            type: 'VER',
            color: 'blue',
            description: sessionStorage.getItem(CookiesName.APP_NAME),
            date: '',
            text: 'App name',
            isNew: true,
        },
        {
            identifier: 'APP_VERSION',
            type: 'VER',
            color: 'blue',
            description: JSON.parse(sessionStorage.getItem(CookiesName.APP_VERSION)),
            date: '',
            text: 'App version',
            isNew: true,
        },
        {
            identifier: 'API_VERSION',
            type: 'VER',
            color: 'blue',
            description: JSON.parse(localStorage.getItem(CookiesName.VERSION_API)),
            date: '',
            text: 'API version',
            isNew: true,
        },

        {
            type: 'VER',
            color: 'blue',
            description: process.env.REACT_APP_BUILD_TIME,
            date: '',
            text: 'Build time',
            isNew: true,
        },
        {
            identifier: 'DEVICE_NAME',
            type: 'VER',
            color: 'blue',
            description: JSON.parse(sessionStorage.getItem(CookiesName.DEVICE_NAME)),
            date: '',
            text: 'Device name',
            isNew: true,
        },
        {
            identifier: 'DEV_EXTREME_VER',
            type: 'VER',
            color: 'blue',
            description: devExtremeVersion,
            date: '',
            text: 'DevExtreme version',
            isNew: true,
        },
    ];
    const dataSource = [
        {
            type: 'FIX',
            title: LocUtils.locFromStore('FIX'),
            tasks: aboutVersion
                ?.flatMap((v) =>
                    v.data.map((item) => ({
                        ...item,
                        version: v.version,
                    }))
                )
                ?.filter((item) => item.type === 'FIX')
                ?.filter((item) => item.isNew),
        },
        {
            type: 'NEW',
            title: LocUtils.locFromStore('NEW'),
            tasks: aboutVersion
                ?.flatMap((v) =>
                    v.data.map((item) => ({
                        ...item,
                        version: v.version,
                    }))
                )
                ?.filter((item) => item.type === 'NEW')
                ?.filter((item) => item.isNew),
        },
        {
            type: 'VER',
            title: LocUtils.locFromStore('VER'),
            tasks: version,
        },
        {
            type: 'HISTORY',
            title: LocUtils.locFromStore('HISTORY'),
            tasks: aboutVersion?.flatMap((v) =>
                v.data.map((item) => ({
                    ...item,
                    version: v.version,
                }))
            ),
        },
        {
            type: 'PARAMETERS',
            title: LocUtils.locFromStore('PARAMETERS'),
            tasks: parameters,
        },
    ];
    const {onHide} = props;
    const [visible, setVisible] = useState(props.visible);
    const [value] = useState(props.value);
    const [tabsPosition, setTabsPosition] = useState(tabsPositions[0]);
    const [stylingMode, setStylingMode] = useState(stylingModes[0]);
    const [iconPosition, setIconPosition] = useState(iconPositions[0]);
    const [moreInformation, setMoreInformation] = useState({
        title: undefined,
        description: undefined,
        showDialog: undefined,
    });

    useEffect(() => {
        return () => {};
    }, [value]);

    const hideDialog = () => {
        onHide();
        setVisible(false);
    };

    const closeMore = () => {
        setMoreInformation({
            title: undefined,
            description: undefined,
            showDialog: undefined,
        });
    };

    const openMore = (taskName, more) => {
        setMoreInformation({
            title: taskName,
            description: more,
            showDialog: true,
        });
    };

    const dialogHeader = () => {
        return <div> {LocUtils.locFromStore('About_current_version')} </div>;
    };

    const contentChangeLog = (title = undefined) => {
        const textContent = [];
        aboutVersion
            .filter((av) => {
                if (title === undefined) {
                    return true;
                } else {
                    return av.title === title;
                }
            })
            .forEach((av, index) => {
                textContent.push('');
                textContent.push(changeLogName(av.title));
                textContent.push('--------------------');
                let currentType = undefined;
                av.data.forEach((task, index) => {
                    if (index === 0) {
                        currentType = task.type;
                        textContent.push(currentType);
                    }
                    if (currentType !== task.type) {
                        currentType = task.type;
                        textContent.push(currentType);
                    }
                    const text = index + 1 + '. ' + task.text;
                    textContent.push(text);
                    if (task.more) {
                        textContent.push('');
                        const cleanText = task.more
                            .replace(/<br\s*\/?>/gi, '\n')
                            .replace(/<[^>]+>/g, '')
                            .replace(/ +/g, ' ')
                            .trim();
                        textContent.push(cleanText);
                        textContent.push('');
                    }
                });
            });
        return textContent.join('\n');
    };

    const changeLogName = (title) => {
        if (StringUtils.isBlankOrEmpty(title)) {
            return `changelog-${useStore.getState().appVersion}.txt`;
        }
        return title;
    };

    const downloadFile = (title) => {
        const blob = new Blob([contentChangeLog(title)], {type: 'text/plain'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = changeLogName(title);
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const tabPanelItem = ({data}) => {
        if (data.tasks?.length === 0) {
            return <div></div>;
        }
        const taskItems = data?.tasks?.map((task, index) => (
            <div
                key={'item-' + index}
                className={`ver-item ver-item-color-${task.color}`}
                style={{background: task.importanceColor}}
            >
                <span className='ver-item-text'>
                    {task.text} {StringUtils.isBlankOrEmpty(task.version) ? '' : '(' + task.version + ')'}
                </span>
                <span className='ver-item-info'>{`${task.description || ''}`}</span>
                {!StringUtils.isBlankOrEmpty(task?.link) && (
                    <span className='ver-item-text'>
                        <a href={`${task.link}`} rel='noopener noreferrer' target='_blank'>
                            {LocUtils.locFromStore('Link_to_task')}{' '}
                        </a>{' '}
                    </span>
                )}
                {task.more && (
                    <span
                        className='mdi mdi-information'
                        onClick={() => {
                            openMore(task.text, task.more);
                        }}
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '8px',
                            cursor: 'pointer',
                            fontSize: '25px',
                            color: 'red',
                        }}
                    />
                )}
            </div>
        ));
        return <div className='tabpanel-item'>{taskItems}</div>;
    };

    return (
        <React.Fragment>
            <Dialog
                closable={true}
                header={dialogHeader}
                blockScroll
                visible={visible}
                style={{width: '868px', maxHeight: '700px', overflow: 'hidden !important'}}
                onHide={hideDialog}
                footer={
                    <div className='float-right mt-3'>
                        <ActionButton label={LocUtils.locFromStore('Change_log')} handleClick={() => downloadFile()} />
                    </div>
                }
            >
                <div className='ver-update'>
                    <TabPanel
                        width='auto'
                        animationEnabled={false}
                        swipeEnabled={false}
                        dataSource={dataSource}
                        tabsPosition={tabsPosition}
                        stylingMode={stylingMode}
                        iconPosition={iconPosition}
                        itemComponent={(data) => tabPanelItem(data)}
                    />
                </div>
            </Dialog>
            <Dialog
                visible={moreInformation.showDialog}
                onHide={() => {
                    closeMore();
                }}
                style={{maxWidth: '750px'}}
                closable={true}
                header={<b>{moreInformation.title}</b>}
                id='more-feature-dialog'
            >
                <p dangerouslySetInnerHTML={{__html: moreInformation.description}} />
            </Dialog>
        </React.Fragment>
    );
};

VersionPreviewDialog.propTypes = {
    onSave: PropTypes.func,
    onHide: PropTypes.func,
    visible: PropTypes.bool,
    editable: PropTypes.bool,
    value: PropTypes.string,
    header: PropTypes.string,
};
