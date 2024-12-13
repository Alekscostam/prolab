import {Dialog} from 'primereact/dialog';
import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import LocUtils from '../../utils/LocUtils';
import {TabPanel} from 'devextreme-react';
import {tabsPositions, stylingModes, iconPositions, features} from './dataSource/VersionDataSource';
import {StringUtils} from '../../utils/StringUtils';
import ActionButton from '../ActionButton';
import useStore from '../../store';
import {CookiesName} from '../../enum/CookieName';

export const VersionPreviewDialog = (props) => {
    const version = [
        {
            type: 'VER',
            color: 'blue',
            description: process.env.REACT_APP_BUILD_NUMBER,
            date: '',
            text: 'Build number',
        },
        {
            identifier: 'APP_NAME',
            type: 'VER',
            color: 'blue',
            description: sessionStorage.getItem(CookiesName.APP_NAME),
            date: '',
            text: 'App name',
        },
        {
            identifier: 'APP_VERSION',
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
        },
        {
            identifier: 'DEVICE_NAME',
            type: 'VER',
            color: 'blue',
            description: sessionStorage.getItem(CookiesName.DEVICE_NAME),
            date: '',
            text: 'Device name',
        },
    ];

    const dataSource = [
        {
            type: 'FIX',
            title: LocUtils.locFromStore('FIX'),
            tasks: features.filter((item) => item.type === 'FIX'),
        },
        {
            type: 'NEW',
            title: LocUtils.locFromStore('NEW'),
            tasks: features.filter((item) => item.type === 'NEW'),
        },
        {
            type: 'VER',
            title: LocUtils.locFromStore('VER'),
            tasks: version,
        },
    ];
    const {onHide} = props;
    const [visible, setVisible] = useState(props.visible);
    const [value] = useState(props.value);
    const [tabsPosition, setTabsPosition] = useState(tabsPositions[0]);
    const [stylingMode, setStylingMode] = useState(stylingModes[0]);
    const [iconPosition, setIconPosition] = useState(iconPositions[0]);

    useEffect(() => {
        return () => {};
    }, [value]);

    const hideDialog = () => {
        onHide();
        setVisible(false);
    };

    const dialogHeader = () => {
        return <div> {LocUtils.locFromStore('About_current_version')} </div>;
    };

    const contentChangeLog = () => {
        const textContent = [];
        textContent.push('wersja ' + useStore.getState().appVersion);
        textContent.push('--------------------');
        const allTasks = dataSource.filter((item) => item.type !== 'VER').flatMap((item) => item.tasks);
        let currentType = undefined;
        let counter = 1;
        allTasks.forEach((task, index) => {
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
            counter++;
        });
        return textContent.join('\n');
    };

    const changeLogName = () => {
        return `changelog-${useStore.getState().appVersion}.txt`;
    };

    const downloadFile = () => {
        const blob = new Blob([contentChangeLog()], {type: 'text/plain'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = changeLogName();
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const tabPanelItem = ({data}) => {
        const taskItems = data.tasks.map((task, index) => (
            <div
                key={'item-' + index}
                className={`ver-item ver-item-color-${task.color}`}
                style={{background: task.importanceColor}}
            >
                <span className='ver-item-text'>{task.text}</span>
                <span className='ver-item-info'>{`${task.description}`}</span>
                {!StringUtils.isBlank(task?.link) && (
                    <span className='ver-item-text'>
                        <a href={`${task.link}`}>{LocUtils.locFromStore('Link_to_task')} </a>{' '}
                    </span>
                )}
            </div>
        ));
        return <div className='tabpanel-item'>{taskItems}</div>;
    };

    return (
        <div>
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
                    <ActionButton label={LocUtils.locFromStore('Change_log')} handleClick={downloadFile} />
                </div>
            </Dialog>
        </div>
    );
};

VersionPreviewDialog.defaultProps = {
    onSave: undefined,
    onHide: undefined,
    labels: undefined,
    visible: true,
    editable: true,
    value: '',
    header: '',
};

VersionPreviewDialog.propTypes = {
    onSave: PropTypes.func,
    onHide: PropTypes.func,
    visible: PropTypes.bool,
    editable: PropTypes.bool,
    value: PropTypes.string,
    header: PropTypes.string,
    labels: PropTypes.object,
};
