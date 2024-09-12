import {Dialog} from 'primereact/dialog';
import {useEffect, useState} from 'react';

import PropTypes from 'prop-types';
import LocUtils from '../../utils/LocUtils';
import { TabPanel } from 'devextreme-react';
import { tabsPositions,stylingModes, iconPositions, dataSource } from './dataSource/VersionDataSource';
import { StringUtils } from '../../utils/StringUtils';


export const VersionPreviewDialog = (props) => {
    const {onHide, labels} = props;
    const [visible, setVisible] = useState(props.visible);
    const [value] = useState(props.value);
    const [tabsPosition, setTabsPosition] = useState(tabsPositions[0]);
    const [stylingMode, setStylingMode] = useState(stylingModes[0]);
    const [iconPosition, setIconPosition] = useState(iconPositions[0]);
    useEffect(() => {
        return () => {};
    }, [ value]);

    const hideDialog = () => {
        onHide();
        setVisible(false);
    };
    const dialogHeader = () => {
        
        return <div> {LocUtils.loc(labels, 'about_version', 'Aktualna wersja aplikacji')} </div>;
    };
    const dialogFooter = (
        <div>
           
        </div>
    );
    const tabPanelItem = ({ data }) => { 
        const taskItems = data.tasks.map((task, index) => (
            <div className={`ver-item ver-item-color-${task.color}`}>
            <span className="ver-item-text">{task.text}</span>
            <span className="ver-item-info">{`${task.description}`}</span>
            {!StringUtils.isBlank(task?.link) && <span className="ver-item-text" ><a href={`${task.link}`} >link do zadania</a> </span>} 
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
                footer={dialogFooter}
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
