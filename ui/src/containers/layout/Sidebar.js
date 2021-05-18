/*********************************************************************** 
Documentations = https://github.com/azouaoui-med/pro-sidebar-template
************************************************************************/
import $ from 'jquery';
import React from 'react';
import {
	FaBars, FaBook, FaCog,
	FaFileAlt, FaGasPump,
	FaHandshake,
	FaHome, FaSignOutAlt,
	FaUser,
	FaUserSecret
} from 'react-icons/fa';
import { Menu, MenuItem, ProSidebar, SidebarContent, SidebarFooter, SidebarHeader, SubMenu } from 'react-pro-sidebar';
import { Link } from 'react-router-dom';
import Switch from 'react-switch';
import AuthService from './../../services/AuthService';


const Sidebar = ({ collapsed, toggled, loggedUser, handleToggleSidebar, handleCollapsedChange, handleLogoutUser, authService }) => {
	const userName = authService.getProfile().sub;
	const role = authService.getProfile().role;
	$(document).on('click', '.pro-item-content', function (e) {
		$('.pro-item-content').each(function (index) {
			$(this).removeClass('active');
		});
		$(this).addClass('active').siblings().removeClass('active');
	});

	return !authService.loggedIn() ? null : (
		<React.Fragment>
			<div className='btn-toggle' onClick={() => handleToggleSidebar(true)}>
				<FaBars />
			</div>
			<ProSidebar collapsed={collapsed} toggled={toggled} breakPoint='md' onToggle={handleToggleSidebar} className='pro-sidebar-layout'>
				<SidebarHeader>
					<div style={{
						padding: '15px', fontWeight: 'bold', fontSize: 16, letterSpacing: '1px', overflow: 'hidden',
						textOverflow: 'ellipsis', color: 'white', textAlign: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
					}}>
						<div style={{ display: 'inline' }}>
							PROLAB
						</div>
					</div>
					<Menu iconShape='circle'>
						<div
							style={{
								textTransform: 'uppercase',
								fontSize: 14,
								textAlign: 'center',
								color: 'rgba(255, 255, 255, 0.2)'
							}}>
							{authService.isUserInRole("ROLE_ADMIN") ? "Panel admina" : null}
							{authService.isUserInRole("ROLE_DISPATCHER") ? "Panel dyspozytora" : null}
						</div>
						<MenuItem icon={<FaUser />}>
							{userName}
							<Link to='/manage-account' />
						</MenuItem>
					</Menu>
				</SidebarHeader>
				<SidebarContent>
					<Menu iconShape='circle'>
						<MenuItem icon={<FaHome />}>Strona główna<Link to='/start' /> </MenuItem>
					</Menu>
					<Menu iconShape='circle'>
						<MenuItem icon={<FaGasPump />}>Lista stacji Anwim<Link to='/station-list' /> </MenuItem>
					</Menu>
					<Menu iconShape='circle' popperArrow='false'>
						<SubMenu title='Raporty cen na stacjach' icon={<FaFileAlt />}>
							<MenuItem>Raport aktualnych cen sprzedaży<Link to='/current-opponent-price-list' /></MenuItem>
							<MenuItem>Lista przecen<Link to='/discount-order-list' /></MenuItem>
						</SubMenu>
					</Menu>
					<Menu iconShape='circle' popperArrow='true'>
						<SubMenu title='Raporty konkurencji' icon={<FaUserSecret />}>
							<MenuItem>Stacje nie raportujące cen konkurencji<Link to='/stations-not-reporting-prices-list' /></MenuItem>
							<MenuItem>Lista kompletności raportów cen konkurencji<Link to='/setting-list' /></MenuItem>
						</SubMenu>
					</Menu>
					<Menu iconShape='circle' popperArrow='false'>
						<SubMenu title='Konkurencja' icon={<FaHandshake />}>
							<MenuItem>Koncerny paliwowe<Link to='/oil-company-dict-list' /></MenuItem>
							<MenuItem>Stacje konkurencyjne<Link to='/opponent-station-list' /></MenuItem>
							<MenuItem>Kategoria konkurencji<Link to='/station-category-dict-list' /></MenuItem>
							<MenuItem>Typ lokalizacji<Link to='/localization-type-dict-list' /></MenuItem>
							<MenuItem>Godziny raportowania cen<Link to='/station-reporting-time-list' /></MenuItem>
						</SubMenu>
					</Menu>
					<Menu iconShape='circle' popperArrow='false'>
						<SubMenu title='Administracja' icon={<FaCog />}>
							<MenuItem>Parametry aplikacji<Link to='/setting-list' /></MenuItem>
							<MenuItem>Lista użytkowników<Link to='/user-list' /></MenuItem>
							<MenuItem>Szablony e-mail<Link to='/email-template-list' /></MenuItem>
							<MenuItem>Dziennik zdarzeń<Link to='/event-log-list' /></MenuItem>
						</SubMenu>
					</Menu>
					<Menu iconShape='circle' popperArrow='false'>
						<SubMenu title='Słowniki' icon={<FaBook />}>
							<MenuItem>Lista paliw<Link to='/petrol-dict-list' /></MenuItem>
							<MenuItem>Lista KOR<Link to='/kor-dict-list' /></MenuItem>
						</SubMenu>
					</Menu>
				</SidebarContent>

				<SidebarFooter style={{ textAlign: 'center' }}>
					<div
						className='sidebar-btn-wrapper'
						style={{
							padding: '20px 24px',
						}}>
						<div onClick={handleLogoutUser} className='sidebar-btn' rel='noopener noreferrer'>
							<FaSignOutAlt />
							<span>Wyloguj</span>
						</div>
					</div>
					<div className='sidebar-btn-wrapper' style={{ padding: '5px', }}>
						<Switch
							height={16}
							width={30}
							checkedIcon={false}
							uncheckedIcon={false}
							onChange={handleCollapsedChange}
							checked={collapsed}
							onColor='#cd0a0a'
							offColor='#cd0a0a'
						/>
					</div>
				</SidebarFooter>
			</ProSidebar>
		</React.Fragment>
	);
};

export default Sidebar;
