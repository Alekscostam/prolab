import React, {Component} from 'react';
import '../../assets/css/maintenance_banner.scss';
import {getStore} from '../../utils/helper/StoreHelper';

class MaintenanceBanner extends Component {
    getType(type) {
        switch ((type || 'NORMAL').toUpperCase()) {
            case 'WARN':
                return {
                    className: 'maintenance-banner--warn',
                    icon: 'pi pi-exclamation-triangle',
                };

            case 'INFO':
                return {
                    className: 'maintenance-banner--info',
                    icon: 'pi pi-info-circle',
                };

            case 'DANGER':
                return {
                    className: 'maintenance-banner--danger',
                    icon: 'pi pi-times-circle',
                };

            case 'NORMAL':
            default:
                return {
                    className: 'maintenance-banner--normal',
                    icon: 'pi pi-info-circle',
                };
        }
    }

    render() {
        const maintenanceBanner = getStore().maintenanceBanner;

        if (!maintenanceBanner) {
            return null;
        }

        const enabled = maintenanceBanner.ENABLED === true || maintenanceBanner.ENABLED === 'true';

        const scrolling = maintenanceBanner.SCROLLING === true || maintenanceBanner.SCROLLING === 'true';

        if (!enabled || !this.props.visible) {
            return null;
        }

        const {MESSAGE, TYPE} = maintenanceBanner;

        if (!MESSAGE) {
            return null;
        }

        const bannerType = this.getType(TYPE);

        return (
            <div className={`maintenance-banner ${bannerType.className}`}>
                <div
                    className={`maintenance-banner-content ${scrolling ? 'maintenance-banner-content--scrolling' : ''}`}
                >
                    <span className={scrolling ? 'maintenance-banner-text--scrolling' : 'maintenance-banner-text'}>
                        <i className={`${bannerType.icon} maintenance-banner-icon`} />
                        {MESSAGE}
                    </span>
                </div>
            </div>
        );
    }
}

export default MaintenanceBanner;
