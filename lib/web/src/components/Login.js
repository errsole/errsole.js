import React from 'react';
import { connect } from 'react-redux';
import withRouter from '../hoc/WithRouter'; // Adjust the path if necessary
import { bindActionCreators } from 'redux';

/* Ante UI */
import { Form, Input, Button, Row, Col, message } from 'antd';
import { Navigate } from 'react-router-dom';

/* import actions */
import * as userActions from 'actions/userActions.js';

/* mapStateToProps */
const mapStateToProps = (state) => ({
});

/* mapDispatchToProps */
const mapDispatchToProps = (dispatch) => ({
  userActions: bindActionCreators(userActions, dispatch)
});

/* Component Class */
class Login extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      loadingStatus: false
    };
  }

  componentDidMount () {
    const self = this;
    const isJWTExist = !!window.localStorage.getItem('errsole-jwt-token');
    if (isJWTExist) {
      this.props.userActions.getUserProfile(function (err, response) {
        if (!err && response && response.id) {
          self.setState({
            isUserLoggedIn: true
          });
        } else if (err) {
          self.setState({
            isUserLoggedIn: false
          });
          window.localStorage.removeItem('errsole-jwt-token');
        }
      });
    }

    this.props.userActions.getNumberOfUsers(function (err, response) {
      if (!err) {
        const totalUsers = response.attributes.count;
        self.setState({
          totalUsers
        });
      } else {
        message.error('Something went wrong');
      }
    });
  }

  handleFormChange (e) {
    const key = e.target.name;
    const value = e.target.value;
    this.setState({
      [key]: value
    });
  }

  createUser () {
    const self = this;
    const name = this.state.name || '';
    const email = this.state.email || '';
    const password = this.state.password || '';

    if (name === '' || email === '' || password === '') {
      message.error('Please fill all the details');
      return;
    }
    if (password.length < 6) {
      message.error('Password must be at least 6 characters long');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      message.error('Please enter a valid email address');
      return;
    }
    this.props.userActions.register({ name, email, password, role: 'admin' }, function (err, response) {
      if (!err) {
        if (response && response.attributes && response.attributes.token) {
          message.success('User successfully created.');
          self.setState({
            totalUsers: 1,
            isUserLoggedIn: true
          });
        } else {
          message.error('Something went wrong');
        }
      }
    });
  }

  login () {
    const self = this;
    const email = this.state.email || '';
    const password = this.state.password || '';

    if (email === '' || password === '') {
      message.error('Please fill all the details');
      return;
    }
    if (password.length < 6) {
      message.error('Password must be at least 6 characters long');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      message.error('Please enter a valid email address');
      return;
    }
    this.props.userActions.login({ email, password }, function (err, response) {
      if (!err) {
        if (response && response.attributes && response.attributes.token) {
          self.setState({
            isUserLoggedIn: true
          });
          // redirect if needed
          self.checkRedirectOrNot();
        } else {
          message.error('Something went wrong. Please check email and password.');
        }
      }
    });
  }

  checkRedirectOrNot () {
    // Extract URL parameters from the hash fragment
    const hashFragment = window.location.hash.split('?')[1];
    const hashParams = new URLSearchParams(hashFragment);
    const redirectUrl = hashParams.get('redirect') || null;
    const logsPathRegex = /^#\/logs\?errsole_log_id=[^&]+/;
    const shouldRedirect = logsPathRegex.test(redirectUrl);
    if (redirectUrl && shouldRedirect) {
      // Decode the redirect URL
      const decodedUrl = decodeURIComponent(redirectUrl);
      // Validate that the decoded URL is a relative path starting with '#/'
      const isRelativePath = decodedUrl.startsWith('#/');
      // Additional check to ensure it doesn't contain protocol schemes
      const hasProtocol = /^https?:\/\//i.test(decodedUrl);
      if (isRelativePath && !hasProtocol) {
        // Safe to redirect
        window.location.href = decodedUrl;
      }
    }
  }

  render () {
    const isUserLoggedIn = this.state.isUserLoggedIn;
    const name = this.state.name || '';
    const email = this.state.email || '';
    const password = this.state.password || '';
    const loader = this.state.loader;
    const totalUsers = this.state.totalUsers;

    return (
      <>
        {!isUserLoggedIn &&
          <Row className='login-page'>
            <Col xs={1} sm={3} md={9} lg={9} xl={9} />
            <Col xs={22} sm={18} md={6} lg={6} xl={6} className='login-form'>
              {totalUsers === 0 &&
                <Form layout='vertical' onKeyDown={(event) => event.key === 'Enter' && this.createUser()}>
                  <h1 style={{ textAlign: 'center' }}>Get Started</h1>
                  <p><br /></p>
                  <Form.Item label='Name' required>
                    <Input size='large' name='name' placeholder='Enter your name' value={name} onChange={this.handleFormChange.bind(this)} />
                  </Form.Item>
                  <Form.Item label='Email Address' required>
                    <Input size='large' name='email' placeholder='Enter your email address' value={email} onChange={this.handleFormChange.bind(this)} />
                  </Form.Item>
                  <Form.Item label='Password' required>
                    <Input.Password size='large' name='password' placeholder='Enter your password' value={password} onChange={this.handleFormChange.bind(this)} />
                  </Form.Item>
                  <Form.Item>
                    <Button size='large' block loading={loader} onClick={this.createUser.bind(this)} type='primary'>Create User</Button>
                  </Form.Item>
                </Form>}
              {totalUsers > 0 &&
                <Form layout='vertical' onKeyDown={(event) => event.key === 'Enter' && this.login()}>
                  <h1 style={{ textAlign: 'center' }}>Login</h1>
                  <p><br /></p>
                  <Form.Item label='Email Address' required>
                    <Input size='large' name='email' placeholder='Enter your email address' value={email} onChange={this.handleFormChange.bind(this)} />
                  </Form.Item>
                  <Form.Item label='Password' required>
                    <Input.Password size='large' name='password' placeholder='Enter your password' value={password} onChange={this.handleFormChange.bind(this)} />
                  </Form.Item>
                  <Form.Item>
                    <Button size='large' block loading={loader} onClick={this.login.bind(this)} type='primary'>Login</Button>
                  </Form.Item>
                </Form>}
            </Col>
            <Col xs={1} sm={3} md={9} lg={9} xl={9} />
          </Row>}
        {isUserLoggedIn && <Navigate to='/logs' replace />}
      </>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Login));
