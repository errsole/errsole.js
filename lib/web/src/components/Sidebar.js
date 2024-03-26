import React from 'react';
import { connect } from 'react-redux';
import { withRouter, NavLink, Redirect } from 'react-router-dom';
import { Layout, Menu, Icon } from 'antd';

const { Sider } = Layout;
const { SubMenu } = Menu;

/* mapStateToProps */
const mapStateToProps = (state) => ({
});

/* mapDispatchToProps */
const mapDispatchToProps = (dispatch) => ({
});

class Sidebar extends React.Component {
  render () {
    const pathname = this.props.location ? this.props.location.pathname : '';
    const route = pathname.split('/')[pathname.split('/').length - 1];
    const menuKeys = ['logs', 'errors', 'slow-requests', 'settings', 'developers'];
    const activeMenuKeys = menuKeys.findIndex((i) => i === route).toString();

    return (
      <>
        <Sider width={200} style={{ overflow: 'auto', height: '100vh', left: 0 }}>
          <div className='logo'>
            <NavLink exact to='/logs'><img src='https://www.errsole.com/assets/images/errsole-logo-light.png' height={30} /></NavLink>
          </div>
          <Menu className='side-menu' theme='dark' mode='inline' selectedKeys={[activeMenuKeys]} defaultOpenKeys={['3']}>
            <Menu.Item key='0'>
              <Icon type='file-text' />
              <NavLink className='sidebar-menu' exact to='/logs'>Logs</NavLink>
            </Menu.Item>
            <Menu.Item key='1'>
              <Icon type='exclamation-circle' />
              <NavLink className='sidebar-menu' exact to='/errors'>Errors</NavLink>
            </Menu.Item>
            <Menu.Item key='2'>
              <Icon type='clock-circle' />
              <NavLink className='sidebar-menu' exact to='/slow-requests'>Slow Requests</NavLink>
            </Menu.Item>
            <SubMenu className='submenu' key='3' title={<span><Icon type='setting' /> <span>Settings</span></span>}>
              <Menu.Item key='4'>
                <Icon type='team' />
                <NavLink className='sidebar-menu' to='/settings/developers'>Developers</NavLink>
              </Menu.Item>
            </SubMenu>
          </Menu>
          {activeMenuKeys === '-1' && <Redirect to='/logs' />}
        </Sider>
      </>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Sidebar));
