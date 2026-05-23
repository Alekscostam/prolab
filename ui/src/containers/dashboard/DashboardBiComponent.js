import React, {useEffect, useRef, useState} from 'react';

import {DashboardControl} from 'devexpress-dashboard-react';

import 'devexpress-dashboard/dist/css/dx-dashboard.light.css';

import {getStore} from '../../utils/helper/StoreHelper';

const DashboardBiComponent = () => {
    const dashboardRef = useRef(null);

    const [config, setConfig] = useState(null);

    useEffect(() => {
        const store = getStore();

        if (store) {
            setConfig({
                biReloadInMiliseconds: store.biReloadInMiliseconds,
                biWorkingMode: store.biWorkingMode,
                biBeUrl: store.biBeUrl,
            });
        }
    }, []);

    useEffect(() => {
        if (!config || !config.biReloadInMiliseconds) {
            return;
        }

        const interval = setInterval(() => {
            if (dashboardRef.current) {
                dashboardRef.current.instance().reloadData();
            }
        }, config.biReloadInMiliseconds);

        return () => clearInterval(interval);
    }, [config]);

    if (!config || !config.biBeUrl) {
        return null;
    }

    return (
        <div id='customBiDashboard'>
            <DashboardControl
                ref={dashboardRef}
                endpoint={config.biBeUrl}
                workingMode={config.biWorkingMode ? config.biWorkingMode : 'ViewerOnly'}
                style={{
                    width: '100%',
                    height: '100vh',
                }}
            />
        </div>
    );
};

export default DashboardBiComponent;
