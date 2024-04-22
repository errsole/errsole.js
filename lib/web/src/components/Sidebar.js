import React from 'react';
import { connect } from 'react-redux';
import { withRouter, NavLink, Redirect } from 'react-router-dom';
import { Layout, Menu, Icon, Button, Modal } from 'antd';
import { bindActionCreators } from 'redux';

import * as appActions from 'actions/appActions.js';

const { Sider } = Layout;
const { SubMenu } = Menu;

/* mapStateToProps */
const mapStateToProps = (state) => ({
});

/* mapDispatchToProps */
const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(appActions, dispatch)
});

class Sidebar extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      updates: null
    };
  }

  componentDidMount () {
    this.checkUpdates();
  }

  checkUpdates () {
    const self = this;
    this.props.appActions.checkUpdates(function (err, result) {
      if (!err) {
        self.setState({
          updates: result.data.attributes
        });
      }
    });
  }

  errsoleUpdateModel (status) {
    this.setState({
      showUpdateModel: status
    });
  }

  render () {
    const pathname = this.props.location ? this.props.location.pathname : '';
    const route = pathname.split('/')[pathname.split('/').length - 1];
    const menuKeys = ['logs', 'errors', 'slow-requests', 'settings', 'developers'];
    const activeMenuKeys = menuKeys.findIndex((i) => i === route).toString();
    const updates = this.state.updates;
    const showUpdateModel = this.state.showUpdateModel || false;

    function getAssetPath (path) {
      const basePathMatch = window.location.pathname.match(/^(\/[^/]+\/?)/);
      let basePath = basePathMatch ? basePathMatch[0] : '/';
      if (!basePath.endsWith('/')) {
        basePath += '/';
      }
      return `${basePath}${path.startsWith('/') ? path.slice(1) : path}`;
    }

    // check updates
    function compareVersions (currentVersion, latestVersion) {
      const splitCurrentVersion = currentVersion.split('.').map(Number);
      const splitLatestVersion = latestVersion.split('.').map(Number);
      const labels = ['Major', 'Minor', 'Patch'];
      for (let i = 0; i < 3; i++) {
        if (splitCurrentVersion[i] < splitLatestVersion[i]) {
          return { result: -1, level: labels[i], updateNeeded: true };
        } else if (splitCurrentVersion[i] > splitLatestVersion[i]) {
          return { result: 1, level: labels[i], updateNeeded: false };
        }
      }
      return { result: 0, level: 'same', updateNeeded: false };
    }

    let updateLevel = null;
    let msg = '';
    let install = '';
    if (updates) {
      const errsoleUpdates = compareVersions(updates.version, updates.latest_version);
      errsoleUpdates.name = updates.name;
      const storageUpdates = compareVersions(updates.storage_version, updates.storage_latest_version);
      storageUpdates.name = updates.storage_name;
      if (errsoleUpdates.updateNeeded || storageUpdates.updateNeeded) {
        updateLevel = 'Patch';
        if (errsoleUpdates.level === 'Minor' || storageUpdates.level === 'Minor') {
          updateLevel = 'Minor';
        }
        if (errsoleUpdates.level === 'Major' || storageUpdates.level === 'Major') {
          updateLevel = 'Major';
        }
      }
      if (errsoleUpdates.updateNeeded && storageUpdates.updateNeeded) {
        msg = 'Updates: ' + errsoleUpdates.level + ' version available for `errsole` and ' + storageUpdates.level + ' version update for `' + updates.storage_name + '`';
        install = 'npm install errsole@' + updates.latest_version + ' ' + updates.storage_name + '@' + updates.storage_latest_version;
      } else if (errsoleUpdates.updateNeeded) {
        msg = 'Updates: ' + errsoleUpdates.level + ' version available for `errsole` .';
        install = 'npm install errsole@' + updates.latest_version;
      } else if (storageUpdates.updateNeeded) {
        msg = 'Updates: ' + storageUpdates.level + ' version available for `' + storageUpdates.name + '`';
        install = 'npm install ' + updates.storage_name + '@' + updates.storage_latest_version;
      }
    }

    return (
      <>
        <Sider width={200} style={{ overflow: 'auto', height: '100vh', left: 0 }}>
          <div className='logo'>
            <NavLink exact to='/logs'><img src={getAssetPath('assets/images/errsole-logo-light.png')} height={30} /></NavLink>
          </div>
          <Menu className='side-menu' theme='dark' mode='inline' selectedKeys={[activeMenuKeys]} defaultOpenKeys={['3']}>
            <Menu.Item key='0'>
              <Icon type='file-text' />
              <NavLink className='sidebar-menu' exact to='/logs'>Logs</NavLink>
            </Menu.Item>
            <SubMenu className='submenu' key='3' title={<span><Icon type='setting' /> <span>Settings</span></span>}>
              <Menu.Item key='4'>
                <Icon type='team' />
                <NavLink className='sidebar-menu' to='/settings/developers'>Developers</NavLink>
              </Menu.Item>
            </SubMenu>
            {updateLevel &&
              <Menu.Item key='updates' className='version-menu'>
                <Button onClick={this.errsoleUpdateModel.bind(this, true)} type='primary' className='update-button' ghost>{updateLevel + ' Version Available'}</Button>
              </Menu.Item>}
          </Menu>
          {activeMenuKeys === '-1' && <Redirect to='/logs' />}
        </Sider>
        {updateLevel &&
          <Modal title='Update Available' visible={showUpdateModel} closable={false} okText='Ok' cancelText='' cancelButtonProps={{ disabled: true }} onOk={this.errsoleUpdateModel.bind(this, false)} footer={[<Button key='submit' type='primary' onClick={this.errsoleUpdateModel.bind(this, false)}> Ok</Button>]}>
            <p>{msg}</p>
            <p className='npm_install'>{install}</p>
          </Modal>}
      </>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Sidebar));
