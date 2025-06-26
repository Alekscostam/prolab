import {Dialog} from 'primereact/dialog';
import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import LocUtils from '../../utils/LocUtils';
import {TabPanel} from 'devextreme-react';
import {StringUtils} from '../../utils/StringUtils';
import ActionButton from '../ActionButton';
import useStore from '../../store';
import {CookiesName} from '../../enum/CookieName';
import {iconPositions, stylingModes, tabsPositions} from './dataSource/FeaturesDataSource';
import {version as devExtremeVersion} from 'devextreme/core/version';
import {getStore} from '../../utils/helper/StoreHelper';

export const VersionPreviewDialog = (props) => {
    const [aboutVersion, setAboutVersion] = useState([]);

    useEffect(() => {
        setAboutVersion(getStore().aboutVersion);
        return () => {};
    }, [props, aboutVersion]);

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
            description: sessionStorage.getItem(CookiesName.APP_VERSION),
            date: '',
            text: 'App version',
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
            description: sessionStorage.getItem(CookiesName.DEVICE_NAME),
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
                ?.flatMap((v) => v.data)
                ?.filter((item) => item.type === 'FIX')
                ?.filter((item) => item.isNew),
        },
        {
            type: 'NEW',
            title: LocUtils.locFromStore('NEW'),
            tasks: aboutVersion
                ?.flatMap((v) => v.data)
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
            tasks: aboutVersion?.flatMap((v) => v.data)?.filter((item) => !item.isNew),
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
                let counter = 1;
                av.data.forEach((task, index) => {
                    if (index === 0) {
                        currentType = task.type;
                        textContent.push(currentType);
                    }
                    if (currentType !== task.type) {
                        counter = 1;
                        currentType = task.type;
                        textContent.push(currentType);
                    }
                    const text = counter + '. ' + task.text;
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
                    counter++;
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
        const isNew = data.tasks.find((task) => task.isNew);
        if (isNew) {
            const taskItems = data.tasks.map((task, index) => (
                <div
                    key={'item-' + index}
                    className={`ver-item ver-item-color-${task.color}`}
                    style={{background: task.importanceColor}}
                >
                    <span className='ver-item-text'>{task.text}</span>
                    <span className='ver-item-info'>{`${task.description || ''}`}</span>
                    {!StringUtils.isBlank(task?.link) && (
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
        } else if (data.tasks?.length === 0) {
            return <div></div>;
        }
        return (
            <div className='row ml-1 mt-4'>
                {aboutVersion.map((av, index) => {
                    return (
                        <div className='col-12 mb-2'>
                            <a style={{cursor: 'pointer'}} onClick={() => downloadFile(av.title)}>
                                {index + 1 + `. `}
                                {index === 0 ? changeLogName() : av.title}
                            </a>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            <Dialog
                closable={true}
                header={dialogHeader}
                blockScroll
                visible={visible}
                style={{width: '868px', overflow: 'hidden !important'}}
                onHide={hideDialog}
                footer={<div></div>}
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
                    ></TabPanel>
                </div>
                <div className='float-right mt-3'>
                    <ActionButton label={LocUtils.locFromStore('Change_log')} handleClick={() => downloadFile()} />
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
        </>
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
