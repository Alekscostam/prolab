/***********************************************************************
 Documentations = https://github.com/azouaoui-med/pro-sidebar-template
 ************************************************************************/
import $ from 'jquery';
import {Button} from 'primereact/button';
import * as PropTypes from 'prop-types';
import React from 'react';
import {FaAngleDoubleRight, FaAngleRight, FaBars, FaSignOutAlt} from 'react-icons/fa';
import {Menu, MenuItem, ProSidebar, SidebarContent, SidebarFooter, SidebarHeader, SubMenu} from 'react-pro-sidebar';
import {withRouter} from 'react-router-dom';
import packageJson from '../../../package.json';
import BlockUi from '../../components/waitPanel/BlockUi';
import MenuService from '../../services/MenuService';
import ViewService from '../../services/ViewService';
import Image from '../../components/Image';
import {MenuValidatorUtils} from '../../utils/parser/MenuValidatorUtils';
import {InputText} from 'primereact/inputtext';
import ActionButton from '../../components/ActionButton';
import VersionService from '../../services/VersionService';
import AppPrefixUtils from '../../utils/AppPrefixUtils';
import UrlUtils from '../../utils/UrlUtils';
import Avatar from '../../components/prolab/Avatar';
import ConsoleHelper from "../../utils/ConsoleHelper";

class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            viewId: undefined,
            loading: true,
            menu: [],
            filteredMenu: [],
            filterValue: '',
            collapsed: false,
            toggled: false,
            versionAPI: null,
            menuState: [],
            uiVersion: {
                appVersion: process.env.REACT_APP_VERSION,
                appName: process.env.REACT_APP_NAME,
                buildNumber: process.env.REACT_APP_BUILD_NUMBER,
                buildTime: process.env.REACT_APP_BUILD_TIME,
            },
        };
        this.doNotUpdate = false;
        this.menuService = new MenuService();
        this.viewService = new ViewService();
        this.versionService = new VersionService();
        this.handleLogoutUser = this.handleLogoutUser.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleCollapseChange = this.handleCollapseChange.bind(this);
    }

    componentDidMount() {
        ConsoleHelper('sidebar => componentDidMount');
        this.menuService
            .getMenu()
            .then((data) => {
                MenuValidatorUtils.validation(data.menu);
                this.setState(
                    {
                        loading: false,
                        menu: data.menu,
                    },
                    () => {
                        this.handleFilter('');
                        //rozwinięcie submenu przy wejściu z linka
                        // const viewId = UrlUtils.getViewIdFromURL();
                        // if (!!viewId) {
                        //     setTimeout(() => {
                        //         const menuItem = $('#menu_item_id_' + viewId);
                        //     }, 10);
                        // }
                    }
                );
            })
            .catch((err) => {
                console.error('Error initialized menu. Error = ', err);
                this.setState({
                    loading: false,
                });
            });

        this.versionService
            .getVersion()
            .then((data) => {
                this.setState(
                    {
                        versionAPI: data.VersionAPI,
                    },
                    () => {
                    }
                );
            })
            .catch((err) => {
            });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const viewId = UrlUtils.getViewIdFromURL();
        ConsoleHelper('sidebar => componentDidUpdate', viewId, prevState.viewId);
        if (prevState.viewId !== viewId) {
            this.setState({viewId});
        }
        if (!!viewId) {
            setTimeout(() => {
                const menuItem = $('#menu_item_id_' + viewId);
                ConsoleHelper('sidebar => menuItem.hasClass(active)', menuItem.hasClass('active'), menuItem)
                if (!menuItem.hasClass('active')) {
                    menuItem.addClass('active');
                }
                if (!menuItem.find('.pro-inner-item').hasClass('active')) {
                    menuItem.find('.pro-inner-item').addClass('active');
                }
                ConsoleHelper('sidebar => menuItem', menuItem)
                const subMenuItem = menuItem.closest('div').parent();
                subMenuItem.removeClass('closed');
                // subMenuItem.height('fit-content');
            }, 10);
        }
    }

    //very important !!!
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if ($('nav.pro-menu.shaped.circle').length === 1) {
            return true;
        }
        // if (!!window.performance && !!performance.navigation && performance.navigation.type === 1) {
        //     return true;
        // }
        const currentUrl = window.location.href
        if (this.doNotUpdate === true
            || (this.state.filterValue === nextState.filterValue
                && this.state.collapsed === nextState.collapsed
                && this.state.toggled === nextState.toggled
                && this.state.viewId === nextState.viewId
                && (!!this.state.viewId && nextState.viewId === this.state.viewId))
            || currentUrl.includes('force=')) {
            this.doNotUpdate = false;
            ConsoleHelper('sidebar => shouldComponentUpdate=%s prev_view_id=%s next_view_id=%s url=%s', false, this.state.viewId, nextState.viewId, window.location.href);
            return false;
        } else {
            const history = this.props.history;
            const result = history.action !== 'PUSH' || (history.action !== 'PUSH' && nextProps.location.pathname === '/start');
            ConsoleHelper('sidebar => shouldComponentUpdate=%s prev_view_id=%s next_view_id=%s url=%s', result, this.state.viewId, nextState.viewId, window.location.href);
            return result;
        }
    }

    handleLogoutUser() {
        this.setState(
            {
                loading: true,
            },
            () => {
                this.props.handleLogoutUser();
            }
        );
    }

    handleCollapseChange() {
        this.setState(
            (prevState) => ({collapsed: !prevState.collapsed}),
            () => {
                if (this.state.collapsed) {
                    $('.pro-sidebar-inner').css('position', 'relative');
                } else {
                    $('.pro-sidebar-inner').css('position', 'fixed');
                }
            }
        );
    }

    handleFilter(filterValue) {
        const menu = this.state.menu;
        if (menu !== undefined && filterValue !== null) {
            if (filterValue === undefined || filterValue === null || filterValue === '') {
                this.setState({filteredMenu: menu, filterValue});
            } else {
                let filteredMenu = [];
                menu.forEach((item) => {
                    this.processItem(item, filteredMenu, filterValue);
                });
                this.setState({filteredMenu, filterValue});
            }
        } else {
            this.setState({filteredMenu: [], filterValue});
        }
    }

    processItem(item, filteredMenu, filterValue) {
        if (
            item.name !== undefined &&
            item.name !== null &&
            item.name.toLowerCase().includes(filterValue.toLowerCase()) &&
            item.type === 'View'
        ) {
            filteredMenu.push({
                icon: item.icon,
                id: item.id,
                name: item.name,
                type: item.type,
            });
        }
        if (item.sub !== undefined && item.sub !== null && item.sub.length > 0) {
            item.sub.forEach((subItem) => {
                this.processItem(subItem, filteredMenu, filterValue);
            });
        }
    }

    handleToggleSidebar() {
        this.setState((prevState) => ({toggled: !prevState.toggled}));
    }

    render() {
        ConsoleHelper('sidebar => render', this.state.viewId);
        let {authService} = this.props;
        const {collapsed, filterValue} = this.state;
        const loggedIn = authService.loggedIn();
        $(document).on('click', '.pro-inner-item', function (e) {
            $('.pro-inner-item').each(function (index) {
                $(this).removeClass('active');
            });
            $('.pro-menu-item').each(function (index) {
                $(this).removeClass('active');
            });
            $(this).addClass('active').siblings().removeClass('active');
            $(this).parents('.pro-inner-item').addClass('active');
            $(this).parents('.pro-menu-item').addClass('active');
        });
        /*------------------------  PROPS  ---------------------------*/
        const profile = !loggedIn ? null : authService.getProfile();
        const userName = !loggedIn ? null : JSON.parse(profile).name;
        const avatar = !loggedIn ? null : JSON.parse(profile).avatar;
        const dynamicMenuJSON = !loggedIn ? [] : this.state.filteredMenu;
        const renderDynamicMenu = (items) => {
            const timestamp = Date.now();
            return (
                loggedIn ? (
                    <Menu key='menu' iconShape='circle' popperArrow='false'>
                        {items?.map((item) => {
                            const activeItem = containsViewId(item, this.state.viewId, item.id);
                            return item.type === 'View' ? (
                                <li>
                                    <MenuItem
                                        id={`menu_item_id_${item.id}`}
                                        key={`menu_item_key_${item.id}`}
                                        className={activeItem ? 'active' : ''}
                                        icon={
                                            item.icon === undefined || item.icon === '' ? (
                                                <FaAngleRight/>
                                            ) : (
                                                <Image alt={item.name} base64={item.icon}/>
                                            )
                                        }
                                        onClick={() => {
                                            this.doNotUpdate = true;
                                        }}
                                    >
                                        <div className='menu_arrow_active'/>
                                        <a
                                            href={AppPrefixUtils.locationHrefUrl(
                                                `/#/grid-view/${item.id}?force=${timestamp}`
                                            )}
                                            className='title'
                                            style={{fontSize: '14px', fontWeight: 'normal'}}
                                            onClick={(e) => {
                                                let href = e.target.href;
                                                e.target.href = UrlUtils.addParameterToURL(href, 'force', Date.now());
                                            }}
                                        >
                                            <div className='title'>{item?.name}</div>
                                        </a>
                                    </MenuItem>
                                    {item?.sub && renderDynamicMenu(item?.sub)}
                                </li>
                            ) : (
                                <SubMenu
                                    key={`menu_sub_${item.id}`}
                                    icon={
                                        item.icon === undefined || item.icon === '' ? (
                                            <FaAngleDoubleRight/>
                                        ) : (
                                            <Image alt={item.name} base64={item.icon}/>
                                        )
                                    }
                                    className={activeItem ? 'active' : ''}
                                    defaultOpen={activeItem}
                                    title={item?.name}
                                >
                                    {item?.sub && renderDynamicMenu(item?.sub)}
                                </SubMenu>
                            );
                        })}
                    </Menu>
                ) : null);
        };

        const containsViewId = (item, viewId, currId, type) => {
            var result = false;
            if (item?.sub && item?.sub?.length > 0) {
                for (let i in item?.sub) {
                    let subItem = item?.sub[i];
                    result = result || parseInt(subItem.id) === parseInt(viewId);
                    result = result || containsViewId(subItem, viewId, currId, type);
                    if (result) {
                        return true;
                    }
                }
            } else {
                result = result || parseInt(item.id) === parseInt(viewId);
                if (result) {
                    return true;
                }
            }
            return result;
        };

        const DynamicMenu = (data) => {
            return (
                <SidebarContent id={'menu-content'} key='menu-content-key'>
                    {renderDynamicMenu(data?.data)}
                </SidebarContent>
            );
        };
        if (!authService.loggedIn()) {
            return null;
        }
        const {labels} = this.props;

        return (
            <React.Fragment>
                <BlockUi tag='div' blocking={this.state.blocking || this.state.loading} loader={this.loader}>
                    <div className='btn-toggle' onClick={() => this.handleToggleSidebar()}>
                        <FaBars/>
                    </div>
                    <ProSidebar
                        collapsed={this.state.collapsed}
                        toggled={this.state.toggled}
                        breakPoint='md'
                        onToggle={() => this.handleToggleSidebar()}
                        className={this.state.collapsed ? 'pro-sidebar-layout-light' : 'pro-sidebar-layout-dark'}
                    >
                        <SidebarHeader>
                            <div id={'menu-title'} className={'col-12'}>
                                <div className='row'>
                                    <div className={'col-9'}>
                                        {this.state.collapsed ? null : (
                                            <div
                                                style={{
                                                    padding: '15px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    color: 'white',
                                                    textAlign: 'left',
                                                }}
                                            >
                                                <img
                                                    height={'25px'}
                                                    src={`./images/login_logo.svg`}
                                                    alt='Prolab'
                                                    className='prolab-logo'
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className={'col-1'}>
                                        <Button
                                            id='buttonCollapsed'
                                            className='p-button-text p-button-icon-only'
                                            icon='pi pi-bars'
                                            iconPos='right'
                                            onClick={this.handleCollapseChange}
                                        />
                                    </div>
                                </div>
                                <div className='row mb-2' style={collapsed ? {display: 'none'} : {}}>
                                    <div className='col-md-12'>
                                        <span id='menu-search-span' className='p-input-icon-left p-input-icon-right'>
                                            <i className='pi pi-search'/>
                                            <InputText
                                                ariaLabel={labels['Menu_Search']}
                                                className='p-inputtext-sm'
                                                key='filterValue'
                                                id='filterValue'
                                                name='filterValue'
                                                style={{width: '100%'}}
                                                type='text'
                                                placeholder={labels['Menu_Search']}
                                                value={filterValue}
                                                onChange={(e) => {
                                                    e.preventDefault();
                                                    this.handleFilter(e.target.value);
                                                }}
                                            />
                                            <i
                                                style={filterValue === '' ? {display: 'none'} : {}}
                                                className='pi mdi mdi-close'
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (filterValue !== '') {
                                                        this.handleFilter('');
                                                    }
                                                }}
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {collapsed ? (
                                <div id='mini-search-panel'>
                                    <ActionButton
                                        id='mini-search-button'
                                        iconName='mdi-magnify'
                                        title={labels['Menu_Search']}
                                        handleClick={() => {
                                            this.handleCollapseChange();
                                            $(document).ready(function () {
                                                $('#filterValue').focus();
                                            });
                                        }}
                                    />
                                </div>
                            ) : null}
                        </SidebarHeader>

                        <DynamicMenu id='dynamic-menu' key='dynamic-menu-key' data={dynamicMenuJSON}/>

                        <SidebarFooter id={'menu-footer'} style={{textAlign: 'center'}}>
                            <div id={'user-credentials'} className={'col-12'}>
                                <div className='row mt-3 mb-2'>
                                    <Avatar base64={avatar} userName={userName} collapsed={collapsed}/>
                                </div>
                            </div>
                            <div id={'logout_button'} className='sidebar-btn-wrapper' style={{padding: '5px 24px'}}>
                                <div
                                    onClick={this.handleLogoutUser}
                                    className='sidebar-btn'
                                    rel='noopener noreferrer'
                                    style={{textAlign: 'center'}}
                                >
                                    <FaSignOutAlt/>
                                    <span>{labels['Menu_Logout']}</span>
                                </div>
                            </div>
                            <div
                                id={'version'}
                                className={'to-right'}
                                style={{marginRight: '5px'}}
                            >{`ver: ${packageJson.version}_${this.state.uiVersion?.buildNumber} api: ${this.state.versionAPI}`}</div>
                        </SidebarFooter>
                    </ProSidebar>
                </BlockUi>
            </React.Fragment>
        );
    }
}

Sidebar.propTypes = {
    labels: PropTypes.array.isRequired,
    loggedUser: PropTypes.any,
    handleLogoutUser: PropTypes.any,
    authService: PropTypes.any,
    historyBrowser: PropTypes.any,
};

export default withRouter(Sidebar);
