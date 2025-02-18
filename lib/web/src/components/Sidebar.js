import React from 'react';
import { connect } from 'react-redux';
import withRouter from '../hoc/WithRouter.js';
import { Alert, Layout, Menu, Button, Modal } from 'antd';
import { bindActionCreators } from 'redux';
import { NavLink, Navigate } from 'react-router-dom';
import { FileTextOutlined, TeamOutlined, ControlOutlined, LinkOutlined, SettingOutlined, DatabaseOutlined, LikeOutlined } from '@ant-design/icons';

import * as appActions from 'actions/appActions.js';

const { Sider } = Layout;
const { SubMenu } = Menu;

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
const localStorage = isBrowser
  ? window.localStorage
  : {
      store: {},
      getItem (key) {
        return this.store[key] || null;
      },
      setItem (key, value) {
        this.store[key] = value;
      },
      removeItem (key) {
        delete this.store[key];
      },
      clear () {
        this.store = {};
      }
    };

/* mapStateToProps */
const mapStateToProps = (state) => ({
  userProfile: state.userProfileReducer.get('userProfile')
});

/* mapDispatchToProps */
const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(appActions, dispatch)
});

class Sidebar extends React.Component {
  constructor (props) {
    super(props);
    this.menuCheckboxRef = React.createRef();
    this.state = {
      updates: null,
      timer: this.getFromLocalStorage('timer', 0),
      status: this.getFromLocalStorage('status', null),
      isPopUpVisible: false,
      showFeedbackMenu: this.getFromLocalStorage('showFeedbackMenu', false)
    };
    this.interval = null;
  }

  handleMenuClick = () => {
    if (this.menuCheckboxRef.current) {
      this.menuCheckboxRef.current.checked = false; // Collapse sidebar
    }
  };

  componentDidMount () {
    this.checkUpdates();
    this.initFeedbackTimer();
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  componentWillUnmount () {
    clearInterval(this.interval);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  getFromLocalStorage = (key, defaultValue) => {
    const value = localStorage.getItem(key);
    return value !== null ? JSON.parse(value) : defaultValue;
  };

  setToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  initFeedbackTimer = () => {
    if (window.location.hostname === 'localhost') {
      return; // Skip feedback logic on localhost
    }

    const savedStatus = this.getFromLocalStorage('status', null);
    const savedTimer = this.getFromLocalStorage('timer', 0);
    const showFeedbackMenu = this.getFromLocalStorage('showFeedbackMenu', false);

    if (savedStatus === 'submitted') {
      // If feedback has already been submitted, don't show the menu.
      this.setState({ showFeedbackMenu: false });
    } else {
      // Resume with the saved timer value (if any)
      this.setState(
        { timer: savedTimer, status: savedStatus, showFeedbackMenu },
        () => {
          this.startTimer();
        }
      );
    }
  };

  startTimer = () => {
    if (window.location.hostname === 'localhost' || this.state.status === 'submitted') {
      return;
    }
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => {
      this.setState(
        (prevState) => ({ timer: prevState.timer + 1 }),
        () => {
          this.setToLocalStorage('timer', this.state.timer);
          if (this.state.timer >= 30 && !this.state.isPopUpVisible) {
            this.setState({ isPopUpVisible: true });
          }
        }
      );
    }, 60000);
  };

  handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && this.state.status !== 'submitted') {
      this.startTimer();
    } else {
      clearInterval(this.interval);
    }
  };

  handleSubmit = () => {
    clearInterval(this.interval);
    this.setState(
      { status: 'submitted', isPopUpVisible: false, showFeedbackMenu: false },
      () => {
        this.setToLocalStorage('status', 'submitted');
        this.setToLocalStorage('showFeedbackMenu', false);
      }
    );
  };

  resetTimer = () => {
    this.setState({ timer: 0, status: null, isPopUpVisible: false }, () => {
      this.setToLocalStorage('timer', 0);
      this.setToLocalStorage('status', null);
    });
  };

  handleSkip = () => {
    clearInterval(this.interval);
    this.setState({ status: 'skipped', isPopUpVisible: false, timer: null, showFeedbackMenu: true }, () => {
      this.setToLocalStorage('status', 'skipped');
      this.setToLocalStorage('timer', null);
      this.setToLocalStorage('showFeedbackMenu', true);
    });
  };

  handleRemindMeLater = () => {
    // Clear the existing timer interval.
    clearInterval(this.interval);
    // Reset the timer to 0 and mark the status as 'remindMeLater'.
    this.setState({ status: 'remindMeLater', isPopUpVisible: false, timer: 0 }, () => {
      // Save the reset values to local storage.
      this.setToLocalStorage('status', 'remindMeLater');
      this.setToLocalStorage('timer', 0);
      // Restart the timer so that the next popup will appear after 30 minutes.
      this.startTimer();
    });
  };

  handleCloseModal = () => {
    this.handleRemindMeLater();
  };

  handleOpenFeedbackModal = () => {
    this.setState({ isPopUpVisible: true });
  };

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
    const { location } = this.props.router;
    const pathname = location ? location.pathname : '';
    const route = pathname.split('/').pop();
    const menuKeys = ['logs', 'errors', 'slow-requests', 'settings', 'developers', 'integrations', 'data-retention', 'useful-links'];
    const activeMenuKeys = menuKeys.findIndex((i) => i === route).toString();

    const updates = this.state.updates;
    const showUpdateModel = this.state.showUpdateModel || false;
    const userProfile = this.props.userProfile;
    const isAdmin = userProfile ? userProfile.role === 'admin' : false;

    function getAssetPath (path) {
      let basePath = window.location.pathname;
      if (!basePath.endsWith('/')) {
        basePath += '/';
      }
      return `${basePath}${path.startsWith('/') ? path.slice(1) : path}`;
    }

    // check updates
    function compareVersions (currentVersion, latestVersion) {
      const splitCurrentVersion = currentVersion.split('.').map(Number);
      const splitLatestVersion = latestVersion.split('.').map(Number);
      const labels = ['major', 'minor', 'patch'];
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
    let msg1 = '';
    let msg2 = '';
    let msg3 = null;
    let install = '';
    if (updates) {
      const errsoleUpdates = compareVersions(updates.version, updates.latest_version);
      errsoleUpdates.name = updates.name;
      const storageUpdates = compareVersions(updates.storage_version, updates.storage_latest_version);
      storageUpdates.name = updates.storage_name;
      storageUpdates.dialect = updates.storage_dialect;
      if (errsoleUpdates.updateNeeded || storageUpdates.updateNeeded) {
        updateLevel = 'Patch';
        msg2 = 'To get the latest improvements and bug fixes, update using this command:';
        if (errsoleUpdates.level === 'minor' || storageUpdates.level === 'minor') {
          updateLevel = 'Minor';
          msg2 = 'To get the latest features and bug fixes, update using this command:';
        }
        if (errsoleUpdates.level === 'major' || storageUpdates.level === 'major') {
          updateLevel = 'Major';
          msg2 = 'To get the latest improvements and bug fixes, update using this command:';
        }
      }
      if (errsoleUpdates.updateNeeded && storageUpdates.updateNeeded) {
        msg1 = <p>A new version of the {updates.name} and {updates.storage_name} modules have been released. Currently, you are using <b>{updates.name} v{updates.version}</b> and <b>{storageUpdates.name} v{updates.storage_version}</b></p>;
        install = <b>npm install {updates.name}@{updates.latest_version} {updates.storage_name}@{updates.storage_latest_version}</b>;
      } else if (errsoleUpdates.updateNeeded) {
        msg1 = <p>A new version of the {updates.name} module has been released. Currently, you are using <b>{updates.name} v{updates.version}</b></p>;
        install = <b>npm install {updates.name}@{updates.latest_version}</b>;
      } else if (storageUpdates.updateNeeded) {
        msg1 = <p>A new version of the {storageUpdates.name} module has been released. Currently, you are using <b>{updates.storage_name} v{updates.storage_version}</b></p>;
        install = <b>npm install {updates.storage_name}@{updates.storage_latest_version}</b>;
      }
      if (storageUpdates.dialect === 'sqlite') {
        msg3 = <p>For improved performance, use `errsole-sqlite` instead of `errsole-sequelize` with SQLite. <a target='_blank' href='https://github.com/errsole/errsole.js/blob/master/docs/sqlite-storage.md' rel='noreferrer'>Click here</a> for setup instructions.</p>;
      }
      if (storageUpdates.dialect === 'mysql') {
        msg3 = <p>For improved performance, use `errsole-mysql` instead of `errsole-sequelize` with MySQL. <a target='_blank' href='https://github.com/errsole/errsole.js/blob/master/docs/mysql-storage.md' rel='noreferrer'>Click here</a> for setup instructions.</p>;
      }
      if (storageUpdates.dialect === 'postgres') {
        msg3 = <p>For improved performance, use `errsole-postgres` instead of `errsole-sequelize` with PostgreSQL. <a target='_blank' href='https://github.com/errsole/errsole.js/blob/master/docs/postgresql-storage.md' rel='noreferrer'>Click here</a> for setup instructions.</p>;
      }
    }

    return (
      <>
        <div className='sidebar-container'>
          {/* Hidden Checkbox to Toggle Sidebar */}
          <input type='checkbox' id='menu-toggle' className='menu-checkbox' ref={this.menuCheckboxRef} />
          <label htmlFor='menu-toggle' className='menu-toggle'>
            <span className='menu-icon'>☰</span> {/* Menu Icon */}
          </label>
          <Sider className='ant-layout-sider' width={200} style={{ overflow: 'auto', height: '100vh', left: 0 }}>
            <div className='logo'>
              <NavLink exact to='/logs'><img src={getAssetPath('assets/images/logo-light.png')} height={30} /></NavLink>
            </div>
            <Menu className='side-menu' theme='dark' mode='inline' selectedKeys={[activeMenuKeys]} onClick={this.handleMenuClick} defaultOpenKeys={['3']}>
              <Menu.Item key='0'>
                <FileTextOutlined />
                <NavLink className='sidebar-menu' exact to='/logs'>Logs</NavLink>
              </Menu.Item>
              <SubMenu className='submenu' key='3' title={<span><SettingOutlined /><span>Settings</span></span>}>
                <Menu.Item key='4'>
                  <TeamOutlined />
                  <NavLink className='sidebar-menu' to='/settings/developers'>Developers</NavLink>
                </Menu.Item>
                {isAdmin &&
                  <Menu.Item key='5'>
                    <ControlOutlined />
                    <NavLink className='sidebar-menu' to='/settings/integrations'>Integrations</NavLink>
                  </Menu.Item>}
                {isAdmin &&
                  <Menu.Item key='6'>
                    <DatabaseOutlined />
                    <NavLink className='sidebar-menu' to='/settings/data-retention'>Data Retention</NavLink>
                  </Menu.Item>}
              </SubMenu>
              <Menu.Item key='7'>
                <LinkOutlined />
                <NavLink className='sidebar-menu' exact to='/useful-links'>Useful Links</NavLink>
              </Menu.Item>
              {this.state.showFeedbackMenu && (
                <Menu.Item key='8' onClick={this.handleOpenFeedbackModal}>
                  <LikeOutlined />
                  <span className='sidebar-menu'> Feedback</span>
                </Menu.Item>
              )}
              {updateLevel &&
                <Menu.Item key='updates' className='version-menu'>
                  <Button onClick={this.errsoleUpdateModel.bind(this, true)} type='primary' className='update-button' ghost>{updateLevel + ' Version Available'}</Button>
                </Menu.Item>}
            </Menu>
            {activeMenuKeys === '-1' && <Navigate to='/logs' />}

          </Sider>

          {this.state.isPopUpVisible && (
            <Modal
              title="We'd love your feedback!"
              visible={this.state.isPopUpVisible}
              onCancel={this.handleCloseModal}
              footer={[
                <Button key='submit' type='primary' onClick={this.handleSubmit}>
                  Already submitted
                </Button>,
                <Button key='skip' danger onClick={this.handleSkip}>
                  Skip for now
                </Button>,
                <Button key='remind' onClick={this.handleRemindMeLater}>
                  Remind me later
                </Button>
              ]}
            >
              <p>Share your thoughts with us – your feedback helps us improve! <a href='https://forms.gle/1pJ3jrNH2BSd3mu29' target='_blank' rel='noreferrer'>click here</a>.</p>
            </Modal>
          )}
          <div
            className='overlay'
            onClick={() => {
              if (this.menuCheckboxRef.current) {
                this.menuCheckboxRef.current.checked = false; // Collapse sidebar
              }
            }}
          />
        </div>
        {updateLevel &&
          <Modal title='Update Available' visible={showUpdateModel} closable={false} okText='Ok' cancelText='' cancelButtonProps={{ disabled: true }} onOk={this.errsoleUpdateModel.bind(this, false)} footer={[<Button key='submit' type='primary' onClick={this.errsoleUpdateModel.bind(this, false)}> Ok</Button>]}>
            <p>{msg1}</p>
            <p>{msg2}</p>
            <p className='npm_install'>{install}</p>
            {msg3 && <p><Alert message={msg3} type='warning' /></p>}
          </Modal>}
      </>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Sidebar));
