import React from 'react';
import { connect } from 'react-redux';
import withRouter from '../hoc/WithRouter';
import { bindActionCreators } from 'redux';
import { BugOutlined, StarOutlined, UserOutlined } from '@ant-design/icons';

import { Avatar, Col, Dropdown, Layout, Row, Menu, Modal, Input, Button, Tabs, message } from 'antd';

/* import actions */
import * as userActions from 'actions/userActions.js';

const { Header } = Layout;
const { TabPane } = Tabs;

/* mapStateToProps */
const mapStateToProps = (state) => ({
  userProfile: state.userProfileReducer.get('userProfile')
});

/* mapDispatchToProps */
const mapDispatchToProps = (dispatch) => ({
  userActions: bindActionCreators(userActions, dispatch)
});

class TopHeader extends React.Component {
  constructor (props) {
    super(props);
    const userName = this.props.userProfile.name;
    this.state = {
      userName: userName || '',
      profileModalStatus: false
    };
  }

  handleFormInputChange (e) {
    const key = e.target.name;
    const value = e.target.value;
    this.setState({ [key]: value });
  }

  openProfileModal () {
    this.props.userActions.getUserProfile(function () {});
    this.setState({
      profileModalStatus: true
    });
  }

  closeProfileModal () {
    const userName = this.props.userProfile.name || '';
    this.setState({
      profileModalStatus: false,
      userName
    });
  }

  updateProfile () {
    const self = this;

    const userName = this.state.userName || '';

    if (userName === '') {
      message.error('Name is required');
      return false;
    }

    const data = {
      name: userName
    };
    this.setState({ updateProfileLoading: true });
    this.props.userActions.updateProfile(data, function (err, data) {
      if (!err && data) {
        self.setState({
          profileModalStatus: false
        });
        message.success('Profile has been updated');
      }
      self.setState({
        updateProfileLoading: false
      });
    });
  }

  openSettingsModal () {
    this.props.userActions.getUserProfile(function () {});
    this.setState({
      settingModalStatus: true
    });
  }

  closeSettingsModal () {
    this.setState({
      settingModalStatus: false
    });
  }

  updatePassword () {
    const self = this;
    let newPassword;

    const currentPassword = this.state.currentPassword || '';
    const password = this.state.password || '';
    const confirmPassword = this.state.confirm_password || '';

    if (currentPassword === '') {
      message.error('Current password is required');
      return false;
    }

    if (password === '' || confirmPassword === '') {
      message.error('Both new password and confirm password are required');
      return false;
    }

    if (password && confirmPassword === '') {
      message.error('Both new password and confirm password are required');
      return false;
    }

    if (password !== confirmPassword) {
      message.error('Both new password and confirm password should be same');
      return false;
    }

    if (currentPassword === confirmPassword) {
      message.error('New password and Current password cannot be same');
      return false;
    }

    if (confirmPassword.length < 6) {
      message.error('Password must be at least 6 characters long');
      return;
    }

    if (password !== '') {
      newPassword = password;
    }

    const data = {
      currentPassword,
      newPassword
    };

    this.setState({ updatePasswordLoading: true });
    this.props.userActions.updatePassword(data, function (err, data) {
      if (!err && data) {
        self.setState({
          settingModalStatus: false
        });
        message.success('Password has been updated');
      }
      self.setState({
        updatePasswordLoading: false
      });
    });
  }

  logout () {
    this.props.userActions.logoutUser();
  }

  render () {
    const userName = this.state.userName;
    const userEmail = this.props.userProfile.email || '';
    const profileModalStatus = this.state.profileModalStatus;
    const updateProfileLoading = this.state.updateProfileLoading;
    const settingModalStatus = this.state.settingModalStatus;

    const userProfile = () => {
      return (
        <Menu>
          <Menu.Item key={1} onClick={this.openProfileModal.bind(this)}>Profile</Menu.Item>
          <Menu.Item key={2} onClick={this.openSettingsModal.bind(this)}>Settings</Menu.Item>
          <Menu.Item key={3} onClick={this.logout.bind(this)}>Logout</Menu.Item>
        </Menu>
      );
    };

    return (
      <>
        <Header className='top-header'>
          <Row>
            <Col span={1}> </Col>
            <Col span={12}> </Col>
            <Col span={10}>
              <div className='github-star-button'>
                <a target='_blank' className='github-issue-button' href='https://github.com/errsole/errsole.js/issues' rel='noreferrer'>
                  <Button type='secondary' icon={<BugOutlined />}><p className='hidden'>Report an issue</p></Button>
                </a>
                <a target='_blank' className='github-button' href='https://github.com/errsole/errsole.js' rel='noreferrer'>
                  <Button type='secondary' icon={<StarOutlined />}><p className='hidden'>Give us a GitHub star</p></Button>
                </a>
              </div>
            </Col>
            <Col span={1}>
              <Dropdown className='user_profile_btn' overlay={userProfile()} placement='bottomRight'>
                <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
              </Dropdown>
            </Col>
          </Row>
        </Header>
        <Modal title='Profile' centered closable maskClosable footer={null} visible={profileModalStatus} onCancel={this.closeProfileModal.bind(this)} destroyOnClose>
          <p><b>Name:</b> <Input name='userName' style={{ color: 'black', width: '100%' }} value={userName} onChange={this.handleFormInputChange.bind(this)} /></p>
          <br />
          <p><b>Email:</b> <Input style={{ color: 'black', width: '100%' }} value={userEmail} disabled /></p>
          <br />
          <Button loading={updateProfileLoading} onClick={this.updateProfile.bind(this)} type='primary'>Update Profile</Button>
        </Modal>
        <Modal title='Settings' centered closable maskClosable footer={null} visible={settingModalStatus} onCancel={this.closeSettingsModal.bind(this)} destroyOnClose>
          <Tabs>
            <TabPane tab='Change Password' key='1'>
              <br />
              <p><b>Current Password:</b> <Input.Password name='currentPassword' style={{ color: 'black', width: '100%' }} onChange={this.handleFormInputChange.bind(this)} /></p>
              <br />
              <p><b>New Password:</b> <Input.Password name='password' style={{ color: 'black', width: '100%' }} onChange={this.handleFormInputChange.bind(this)} /></p>
              <br />
              <p><b>Confirm Password:</b> <Input.Password name='confirm_password' style={{ color: 'black', width: '100%' }} onChange={this.handleFormInputChange.bind(this)} /></p>
              <br />
              <Button loading={updateProfileLoading} onClick={this.updatePassword.bind(this)} type='primary'>Change Password</Button>
            </TabPane>
          </Tabs>
        </Modal>
      </>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(TopHeader));
