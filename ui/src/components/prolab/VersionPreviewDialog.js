import {Dialog} from 'primereact/dialog';
import {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import LocUtils from '../../utils/LocUtils';
import { TabPanel } from 'devextreme-react';
import { tabsPositions,stylingModes, iconPositions, features } from './dataSource/VersionDataSource';
import { StringUtils } from '../../utils/StringUtils';
import ActionButton from '../ActionButton';
import useStore from '../../store';


export const VersionPreviewDialog = (props) => {
    const dataSource = [
        {
          type:"FIX",
          title: LocUtils.locFromStore("FIX"),
          tasks: features.filter((item) => item.type === 'FIX'),
        },
        {
          type:"NEW",
          title: LocUtils.locFromStore("NEW"),
           tasks: features.filter((item) => item.type === 'NEW'),
        },
        {
          type:"VER",
          title: LocUtils.locFromStore("VER"),
          tasks: features.filter((item) => item.type === 'VER'),
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
        const allTasks = dataSource.filter(item=>item.type!=="VER").flatMap(item => item.tasks);
        allTasks.forEach((task, index) => {
            const text = index + 1 + ". " + task.text
            textContent.push(text);
        });
        return textContent.join('\n');
    }

    const changeLogName =()=>{
        return `changelog-${useStore.getState().appVersion}.txt`;
    }

    const downloadFile = () => {
        const blob = new Blob([contentChangeLog()], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = changeLogName(); 
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const tabPanelItem = ({ data }) => { 
        const taskItems = data.tasks.map((task, index) => (
            <div key={"item-" + index} className={`ver-item ver-item-color-${task.color}`}>
            <span className="ver-item-text">{task.text}</span>
            <span className="ver-item-info">{`${task.description}`}</span>
            {!StringUtils.isBlank(task?.link) && <span className="ver-item-text" ><a href={`${task.link}`}>{LocUtils.locFromStore("Link_to_task")} </a> </span>} 
          </div>
        ));
        return <div className="tabpanel-item">{taskItems}</div>;
    }

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
                    width="auto"
                    animationEnabled={false}
                    swipeEnabled={false}
                    dataSource={dataSource}
                    tabsPosition={tabsPosition}
                    stylingMode={stylingMode}
                    iconPosition={iconPosition}
                    itemComponent={(data)=>tabPanelItem(data)}>
                </TabPanel>
                </div>
             <div className='float-right mt-3'>
                <ActionButton
                    label = {LocUtils.locFromStore("Change_log")}
                    handleClick={downloadFile}
                />
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
