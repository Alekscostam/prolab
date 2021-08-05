/***********************************************************************
 Documentations = https://github.com/azouaoui-med/pro-sidebar-template
 ************************************************************************/
import $ from 'jquery';
import { Button } from 'primereact/button';
import * as PropTypes from 'prop-types';
import React from 'react';
import { FaAngleDoubleRight, FaAngleRight, FaBars, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { Menu, MenuItem, ProSidebar, SidebarContent, SidebarFooter, SidebarHeader, SubMenu } from 'react-pro-sidebar';
import { Link, withRouter } from 'react-router-dom';
import packageJson from '../../../package.json';
import BlockUi from '../../components/waitPanel/BlockUi';
import MenuService from '../../services/MenuService';
import ViewService from '../../services/ViewService';
import Image from '../../components/Image';
import { MenuValidatorUtils } from '../../utils/parser/MenuValidatorUtils';
import { InputText } from 'primereact/inputtext';

class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            menu: [],
            filteredMenu: [],
            filterValue: '',
            collapsed: false,
            toggled: false,
        };
        this.menuService = new MenuService();
        this.viewService = new ViewService();
        this.handleLogoutUser = this.handleLogoutUser.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handleCollapseChange = this.handleCollapseChange.bind(this);
    }

    componentDidMount() {
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
                        console.log('Initialized menu success');
                    }
                );
            })
            .catch((err) => {
                console.error('Error initialized menu. Error = ', err);
                this.setState({
                    loading: false,
                });
            });
    }

    //very important !!!
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        const history = this.props.history;
        return (
            history.action !== 'PUSH' ||
            (history.action !== 'PUSH' && nextProps.location.pathname == '/start') ||
            this.state.collapsed !== nextState.collapsed ||
            this.state.toggled !== nextState.toggled
        );
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
            (prevState) => ({ collapsed: !prevState.collapsed }),
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
                this.setState({ filteredMenu: menu, filterValue });
            } else {
                let filteredMenu = [];
                menu.forEach((item) => {
                    this.processItem(item, filteredMenu, filterValue);
                });
                this.setState({ filteredMenu, filterValue });
            }
        } else {
            this.setState({ filteredMenu: [], filterValue });
        }
    }

    processItem(item, filteredMenu, filterValue) {
        if (item.name !== undefined && item.name !== null && item.name.includes(filterValue) && item.type === 'View') {
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
        this.setState((prevState) => ({ toggled: !prevState.toggled }));
    }

    render() {
        $(document).on('click', '.pro-inner-item', function (e) {
            $('.pro-inner-item').each(function (index) {
                $(this).removeClass('active');
            });
            $(this).addClass('active').siblings().removeClass('active');
        });
        /*------------------------  PROPS  ---------------------------*/
        let { authService } = this.props;
        /*------------------------  PROPS  ---------------------------*/
        //TODO pobrać się do danych o userze
        const userName = authService.getProfile().sub;
        const dynamicMenuJSON = !authService.loggedIn() ? [] : this.state.filteredMenu;
        //TODO pogadać o rolach
        //const role = authService.getProfile().role;
        const nav = (e, item) => {
            this.props.history.push(`/grid-view/${item.id}`);
        };
        const renderDynamicMenu = (items) => {
            return (
                <Menu key='menu' iconShape='circle' popperArrow='false'>
                    {items?.map((item) => {
                        return item.type === 'View' ? (
                            <li>
                                <MenuItem
                                    id={`menu_item_id_${item.id}`}
                                    key={`menu_item_key_${item.id}`}
                                    icon={
                                        item.icon === undefined || item.icon === '' ? (
                                            <FaAngleRight />
                                        ) : (
                                            <Image alt={item.name} base64={item.icon} />
                                        )
                                    }
                                    onClick={(e) => nav(e, item)}
                                >
                                    <div className='menu_arrow_active' />
                                    <div className='title'>{item?.name}</div>
                                </MenuItem>
                                {item?.sub && renderDynamicMenu(item?.sub)}
                            </li>
                        ) : (
                            <SubMenu
                                key={`menu_sub_${item.id}`}
                                icon={
                                    item.icon === undefined || item.icon === '' ? (
                                        <FaAngleDoubleRight />
                                    ) : (
                                        <Image alt={item.name} base64={item.icon} />
                                    )
                                }
                                title={item?.name}
                            >
                                {item?.sub && renderDynamicMenu(item?.sub)}
                            </SubMenu>
                        );
                    })}
                </Menu>
            );
        };

        const DynamicMenu = (data) => {
            return (
                <SidebarContent id={'menu-content'} key='menu-content-key'>
                    {renderDynamicMenu(data?.data)}
                </SidebarContent>
            );
        };
        return !authService.loggedIn() ? null : (
            <React.Fragment>
                <BlockUi tag='div' blocking={this.state.blocking || this.state.loading} loader={this.loader}>
                    <div className='btn-toggle' onClick={() => this.handleToggleSidebar()}>
                        <FaBars />
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
                                                    height={'34px'}
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
                                <div className='row'>
                                    <div className='col-md-12'>
                                        <span id='menu-search-span' className='p-input-icon-left p-input-icon-right'>
                                            <i className='pi pi-search' />
                                            <InputText
                                                ariaLabel={'Wyszukaj menu'}
                                                className='p-inputtext-sm'
                                                key={'menu-search'}
                                                id={'menu-search'}
                                                name='filteredValue'
                                                style={{ width: '100%' }}
                                                type='text'
                                                placeholder={'Wyszukaj menu'}
                                                value={this.state.filterValue}
                                                onChange={(e) => this.handleFilter(e.target.value)}
                                            />
                                            <i
                                                className='pi mdi mdi-close'
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (this.state.filterValue !== '') {
                                                        this.handleFilter('');
                                                    }
                                                }}
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </SidebarHeader>

                        <DynamicMenu id='dynamic-menu' key='dynamic-menu-key' data={dynamicMenuJSON} />

                        <SidebarFooter id={'menu-footer'} style={{ textAlign: 'center' }}>
                            <Menu iconShape='circle'>
                                <MenuItem icon={<FaUser />}>
                                    {userName}
                                    <Link to='/manage-account' />
                                </MenuItem>
                            </Menu>
                            <div
                                className='sidebar-btn-wrapper'
                                style={{
                                    padding: '20px 24px',
                                }}
                            >
                                <div
                                    onClick={this.handleLogoutUser}
                                    className='sidebar-btn'
                                    rel='noopener noreferrer'
                                    style={{ marginRight: '15px' }}
                                >
                                    <FaSignOutAlt />
                                    <span>Wyloguj</span>
                                </div>
                                <div>ver:{packageJson.version}</div>
                            </div>
                        </SidebarFooter>
                    </ProSidebar>
                </BlockUi>
            </React.Fragment>
        );
    }
}

Sidebar.propTypes = {
    loggedUser: PropTypes.any,
    handleLogoutUser: PropTypes.any,
    authService: PropTypes.any,
    historyBrowser: PropTypes.any,
};

export default withRouter(Sidebar);
