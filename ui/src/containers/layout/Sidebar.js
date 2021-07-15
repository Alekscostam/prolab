/***********************************************************************
 Documentations = https://github.com/azouaoui-med/pro-sidebar-template
 ************************************************************************/
import $ from 'jquery';
import React from 'react';
import {FaAngleDoubleRight, FaAngleRight, FaBars, FaSignOutAlt, FaUser} from 'react-icons/fa';
import {Menu, MenuItem, ProSidebar, SidebarContent, SidebarFooter, SidebarHeader, SubMenu} from 'react-pro-sidebar';
import {Link} from 'react-router-dom';
import {Button} from "primereact/button";
import * as PropTypes from "prop-types";
import MenuService from "../../services/MenuService";
import BlockUi from "../../components/waitPanel/BlockUi";
import {MenuParserUtils} from "../../utils/parser/MenuParserUtils";

class Sidebar extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: true,
            data: null,
        }
        this.menuService = new MenuService();
    }

    componentDidMount() {
        this.menuService.getMenu().then(data => {
            MenuParserUtils.recurrenceValidation(data.menu);
            this.setState({
                loading: false,
                data: data,
            }, () => {
                console.log("Initialized menu success")
            })
        }).catch(err => {
            console.error('Error initialized menu. Error = ', err)
            this.setState({
                loading: false
            });
        });
    }

    render() {
        $(document).on('click', '.pro-item-content', function (e) {
            $('.pro-item-content').each(function (index) {
                $(this).removeClass('active');
            });
            $(this).addClass('active').siblings().removeClass('active');
        });
        let {
            collapsed,
            toggled,
            loggedUser,
            handleToggleSidebar,
            handleCollapsedChange,
            handleLogoutUser,
            authService
        } = this.props;
        //TODO pobrać się do danych o userze
        const userName = authService.getProfile().sub;
        const dynamicMenuJSON = !authService.loggedIn() ? [] : this.state.data?.menu;
        //TODO pogadać o rolach
        //const role = authService.getProfile().role;

        const renderDynamicMenu = items => {
            return <Menu iconShape='circle' popperArrow='false'>
                {items?.map(i => {
                    return i.type === "View" ? (<li>
                            <MenuItem icon={<FaAngleRight/>}> {i?.name}<Link to='/start'/> </MenuItem>
                            {i?.sub && renderDynamicMenu(i?.sub)}
                        </li>)
                        :
                        (<SubMenu icon={<FaAngleDoubleRight/>} title={i?.name}>
                            {i?.sub && renderDynamicMenu(i?.sub)}
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
                    <div className='btn-toggle' onClick={() => handleToggleSidebar(true)}>
                        <FaBars/>
                    </div>
                    <ProSidebar collapsed={collapsed} toggled={toggled} breakPoint='md' onToggle={handleToggleSidebar}
                                className={collapsed ? 'pro-sidebar-layout-light' : 'pro-sidebar-layout-dark'}>
                        <SidebarHeader>
                            <div id={"menu-title"} className={"col-12 mb-4"}>
                                <div className="row">
                                    <div className={"col-9"}>
                                        {collapsed ? null : <div style={{
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
                                                onClick={handleCollapsedChange}/>
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
                                <div onClick={handleLogoutUser} className='sidebar-btn' rel='noopener noreferrer'>
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
    collapsed: PropTypes.any,
    toggled: PropTypes.any,
    loggedUser: PropTypes.any,
    handleToggleSidebar: PropTypes.any,
    handleCollapsedChange: PropTypes.any,
    handleLogoutUser: PropTypes.any,
    authService: PropTypes.any
}

export default Sidebar;
