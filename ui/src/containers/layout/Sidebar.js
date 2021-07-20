/***********************************************************************
 Documentations = https://github.com/azouaoui-med/pro-sidebar-template
 ************************************************************************/
import $ from 'jquery';
import React from 'react';
import {FaAngleDoubleRight, FaAngleRight, FaBars, FaSignOutAlt, FaUser} from 'react-icons/fa';
import {Menu, MenuItem, ProSidebar, SidebarContent, SidebarFooter, SidebarHeader, SubMenu} from 'react-pro-sidebar';
import {Link, withRouter} from 'react-router-dom';
import {Button} from "primereact/button";
import * as PropTypes from "prop-types";
import MenuService from "../../services/MenuService";
import BlockUi from "../../components/waitPanel/BlockUi";
import {MenuValidatorUtils} from "../../utils/parser/MenuValidatorUtils";
import ViewService from "../../services/ViewService";
import {saveCookieGlobal} from "../../utils/cookie";
import {Cookie} from "../../utils/constants";

class Sidebar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: null,
            collapsed: false,
            toggled: false
        }
        this.menuService = new MenuService();
        this.viewService = new ViewService();
        this.handleLogoutUser = this.handleLogoutUser.bind(this);
        this.handleCollapseChange = this.handleCollapseChange.bind(this);
    }

    componentDidMount() {
        this.menuService.getMenu().then(data => {
            MenuValidatorUtils.validation(data.menu);
            this.setState({
                loading: false,
                data: data,
            }, () => {
                console.log("Initialized menu success")
            });
        }).catch(err => {
            console.error('Error initialized menu. Error = ', err)
            this.setState({
                loading: false
            });
        });
    }

    //very important !!!
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        const history = this.props.history;
        return (history.action !== "PUSH" || (history.action !== 'PUSH' && nextProps.location.pathname == '/start'))
            || (this.state.collapsed !== nextState.collapsed)
            || (this.state.toggled !== nextState.toggled);
    }

    handleLogoutUser() {
        this.setState({
            loading: true
        }, () => {
            this.props.handleLogoutUser()
        })
    }

    handleCollapseChange() {
        this.setState((prevState) => ({collapsed: !prevState.collapsed}), () => {
            if (this.state.collapsed) {
                $(".pro-sidebar-inner").css('position', 'relative');
            } else {
                $(".pro-sidebar-inner").css('position', 'fixed');
            }
        });
    }

    handleToggleSidebar() {
        this.setState((prevState) => ({toggled: !prevState.toggled}));
    }

    render() {
        $(document).on('click', '.pro-item-content', function (e) {
            $('.pro-item-content').each(function (index) {
                $(this).removeClass('active');
            });
            $(this).addClass('active').siblings().removeClass('active');
        });

        $(document).on('click', '.pro-item-content', function (e) {
            $('.wiatrak').each(function (index) {
                $(this).removeClass('active');
            });
            $('.wiatrak').addClass('active').siblings().removeClass('active');
        });
        /*------------------------  PROPS  ---------------------------*/
        let {authService} = this.props;
        /*------------------------  PROPS  ---------------------------*/
        //TODO pobrać się do danych o userze
        const userName = authService.getProfile().sub;
        const dynamicMenuJSON = !authService.loggedIn() ? [] : this.state.data?.menu;
        //TODO pogadać o rolach
        //const role = authService.getProfile().role;
        const nav = (e, item) => {
            saveCookieGlobal(Cookie.CURRENT_SELECTED_MENU_ITEM, item)
            this.props.history.push(`/grid-view/${item.id}`)
        }
        const renderDynamicMenu = items => {
            return <Menu iconShape='circle' popperArrow='false'>
                {items?.map(item => {
                    return item.type === "View" ? (<li>
                            <MenuItem key={`menu_key_${item.id}`} icon={<FaAngleRight/>}
                                      onClick={(e) => nav(e, item)}>
                                <div className='menu_arrow_active'/>
                                <div className='title'>{item?.name}</div>
                            </MenuItem>
                            {item?.sub && renderDynamicMenu(item?.sub)}
                        </li>)
                        :
                        (<SubMenu key={`menu_sub_${item.id}`} icon={<FaAngleDoubleRight/>} title={item?.name}>
                            {item?.sub && renderDynamicMenu(item?.sub)}
                        </SubMenu>)
                })}
            </Menu>
        }

        const DynamicMenu = (data) => {
            return <SidebarContent id={"menu-content"}>
                {renderDynamicMenu(data?.data)}
            </SidebarContent>
        }

        return !authService.loggedIn() ? null : (

            <React.Fragment>
                <BlockUi tag='div' blocking={this.state.blocking || this.state.loading} loader={this.loader}>
                    <div className='btn-toggle' onClick={() => this.handleToggleSidebar()}>
                        <FaBars/>
                    </div>
                    <ProSidebar collapsed={this.state.collapsed} toggled={this.state.toggled} breakPoint='md'
                                onToggle={() => this.handleToggleSidebar()}
                                className={this.state.collapsed ? 'pro-sidebar-layout-light' : 'pro-sidebar-layout-dark'}>
                        <SidebarHeader>
                            <div id={"menu-title"} className={"col-12 mb-4"}>
                                <div className="row">
                                    <div className={"col-9"}>
                                        {this.state.collapsed ? null : <div style={{
                                            padding: '15px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            color: 'white',
                                            textAlign: 'left'
                                        }}>
                                            <img height={'34px'} src={`/images/login_logo.svg`} alt='Prolab'
                                                 className='prolab-logo'/>
                                        </div>}
                                    </div>
                                    <div className={"col-1"}>
                                        <Button id="buttonCollapsed"
                                                className="p-button-text p-button-icon-only"
                                                icon="pi pi-bars"
                                                iconPos="right"
                                                onClick={this.handleCollapseChange}/>
                                    </div>
                                </div>
                            </div>
                        </SidebarHeader>

                        <DynamicMenu data={dynamicMenuJSON}/>

                        <SidebarFooter id={"menu-footer"} style={{textAlign: 'center'}}>
                            <Menu iconShape='circle'>
                                <MenuItem icon={<FaUser/>}>
                                    {userName}
                                    <Link to='/manage-account'/>
                                </MenuItem>
                            </Menu>
                            <div
                                className='sidebar-btn-wrapper'
                                style={{
                                    padding: '20px 24px',
                                }}>
                                <div onClick={this.handleLogoutUser} className='sidebar-btn' rel='noopener noreferrer'>
                                    <FaSignOutAlt/>
                                    <span>Wyloguj</span>
                                </div>
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
    historyBrowser: PropTypes.any
}

export default withRouter(Sidebar);