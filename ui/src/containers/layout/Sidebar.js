/***********************************************************************
 Documentations = https://github.com/azouaoui-med/pro-sidebar-template
 ************************************************************************/
import $ from 'jquery';
import React from 'react';
import {FaBars, FaSignOutAlt, FaTag, FaUser} from 'react-icons/fa';
import {Menu, MenuItem, ProSidebar, SidebarContent, SidebarFooter, SidebarHeader, SubMenu} from 'react-pro-sidebar';
import {Link} from 'react-router-dom';
import {Button} from "primereact/button";

const Sidebar = ({collapsed, toggled, loggedUser, handleToggleSidebar, handleCollapsedChange, handleLogoutUser, authService}) => {
    const userName = authService.getProfile().sub;
    const role = authService.getProfile().role;
    $(document).on('click', '.pro-item-content', function (e) {
        $('.pro-item-content').each(function (index) {
            $(this).removeClass('active');
        });
        $(this).addClass('active').siblings().removeClass('active');
    });

    //TODO
    const dynamicMenuStr = '[ { "ObjectType":"Group", "Name":"Zlecenia i próbki", "Id":"123", "Icon":"jk234jg23bjh4g23g4", "Object":[ { "ObjectType":"Group", "Name":"Zlecenia", "Id":"124", "Icon":null, "Object":[ { "ObjectType":"View", "Name":"Rejestr zleceń", "Id":"2", "Icon":null, "Object":null }, { "ObjectType":"View", "Name":"Rejestr Próbek", "Id":"3", "Icon":null, "Object":null } ] } ] } ]';
    const dynamicMenuJSON = JSON.parse(dynamicMenuStr);

    const renderDynamicMenu = items => {
        return <Menu iconShape='circle' popperArrow='false'>
            {items?.map(i => {
                return i.ObjectType === "View" ? (<li>
                        <MenuItem icon={<FaTag/>}> {i?.Name}<Link to='/start'/> </MenuItem>
                        {i?.Object && renderDynamicMenu(i?.Object)}
                    </li>)
                    :
                    (<SubMenu icon={<FaTag/>} title={i?.Name}>
                        {i?.Object && renderDynamicMenu(i?.Object)}
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
                                    <img height={'34px'} src={`/images/login_logo.svg`} alt='Prolab'/>
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
        </React.Fragment>
    );
};

export default Sidebar;
