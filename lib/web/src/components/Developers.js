import React from 'react';
import { connect } from 'react-redux';
import withRouter from '../hoc/WithRouter';
import { bindActionCreators } from 'redux';

/* import actions */
import * as userActions from 'actions/userActions.js';

/* Ante UI */
import { Layout, Divider, Form, Input, Row, Col, Button, Card, Spin, message } from 'antd';
import { UserOutlined, LockOutlined, DeleteOutlined } from '@ant-design/icons';

const { Content } = Layout;

/* mapStateToProps */
const mapStateToProps = (state) => ({
  userProfile: state.userProfileReducer.get('userProfile')
});

/* mapDispatchToProps */
const mapDispatchToProps = (dispatch) => ({
  userActions: bindActionCreators(userActions, dispatch)
});

/* Component Class */
class Developers extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      allUsers: []
    };
  }

  componentDidMount () {
    this.getAllUsers();
  }

  getAllUsers () {
    const self = this;
    this.props.userActions.getAllUsers(function (err, response) {
      if (!err && response) {
        self.setState({
          allUsers: response
        });
      } else {
        self.setState({
          loadingStatus: false
        });
      }
    });
  }

  removeUser (userId) {
    const self = this;
    self.setState({
      removeUserLoader: true
    });
    if (userId) {
      this.props.userActions.removeUser(userId, function (err, response) {
        self.setState({
          removeUserLoader: false
        });
        if (!err) {
          message.success('User removed successfully');
          self.getAllUsers();
        }
      });
    } else {
      message.error('Something went wrong');
    }
  }

  handleFormChange (e) {
    const key = e.target.name;
    const value = e.target.value;
    this.setState({
      [key]: value
    });
  }

  addUser (event) {
    const self = this;
    event.preventDefault();
    const { addUserEmail, addUserPassword } = this.state;
    if (!addUserEmail || addUserEmail === '') {
      message.error('Developer email address is required');
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(addUserEmail)) {
      message.error('Please enter a valid email address');
      return;
    }
    if (!addUserPassword || addUserPassword === '') {
      message.error('Password is required');
      return false;
    }
    if (addUserPassword.length < 6) {
      message.error('Password must be at least 6 characters long');
      return;
    }
    const formData = {
      email: addUserEmail,
      password: addUserPassword,
      role: 'developer'
    };
    self.setState({
      addUserLoader: true
    });
    this.props.userActions.addUser(formData, function (err, response) {
      self.setState({
        addUserLoader: false
      });
      if (!err && response) {
        self.setState({
          addUserLoader: false,
          addUserEmail: null,
          addUserPassword: null
        });
        message.success('User added successfully');
        self.getAllUsers();
      }
    });
  }

  render () {
    const userProfile = this.props.userProfile;
    const allUsers = this.state.allUsers || [];
    const removeUserLoader = this.state.removeUserLoader || false;
    const isAdmin = userProfile ? userProfile.role === 'admin' : false;
    const addUserEmail = this.state.addUserEmail || '';
    const addUserPassword = this.state.addUserPassword || '';
    const addUserLoader = this.state.addUserLoader || false;

    const showAllUsers = () => {
      return allUsers.map((user) => {
        const id = user.id;
        const name = user.attributes.name;
        const emailAddress = user.attributes.email;
        const userRole = user.attributes.role;

        let actionBtns = '';
        if (isAdmin && userRole === 'developer') {
          actionBtns = [<Spin key={id} spinning={removeUserLoader}><span onClick={this.removeUser.bind(this, id)}><DeleteOutlined /> Remove</span></Spin>];
        }
        return (
          <Card className='developer-card' actions={actionBtns} size='small' key={id} title={name || 'N/A'} extra={<p>{userRole}</p>} style={{ marginTop: 16 }}>
            <p>Email: {emailAddress}</p>
          </Card>
        );
      });
    };

    return (
      <>
        <Row>
          <Col span={20} offset={2}>
            <Content className='all-users'>
              <Content>
                <h1>Developers</h1>
                {isAdmin &&
                  <Form layout='inline'>
                    <Form.Item className='align-center'>
                      <Input value={addUserEmail} style={{ width: '300px' }} name='addUserEmail' prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} autocomplete='off' />} placeholder='Developer Email' onChange={this.handleFormChange.bind(this)} className='developer-input' />
                      <Input.Password
                        value={addUserPassword} style={{ marginLeft: '16px', width: '300px' }} name='addUserPassword' prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} autocomplete='off' />} placeholder='Password' onChange={this.handleFormChange.bind(this)}
                        className='password-input'
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button loading={addUserLoader} type='primary' onClick={this.addUser.bind(this)}>Add Developer</Button>
                    </Form.Item>
                  </Form>}
                <Divider className='developer-divider' />
                {allUsers.length > 0 && showAllUsers()}
              </Content>
            </Content>
          </Col>
        </Row>
      </>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Developers));
