import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';

/* import actions */
import * as appActions from 'actions/appActions.js';
import * as userActions from 'actions/userActions.js';

/* Ante UI */
import { Layout, Divider, Form, Input, Row, Col, Button, Icon, Tabs, Result, Select, message } from 'antd';

const { Content } = Layout;
const { TabPane } = Tabs;

/* mapStateToProps */
const mapStateToProps = (state) => ({
  userProfile: state.userProfileReducer.get('userProfile')
});

/* mapDispatchToProps */
const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(appActions, dispatch),
  userActions: bindActionCreators(userActions, dispatch)
});

/* Component Class */
class Integrations extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      slackDetails: null,
      emailDetails: null,
      allUsers: []
    };
  }

  componentDidMount () {
    this.getSlackDetails();
    this.getEmailDetails();
    this.getAllUsers();
  }

  getAllUsers () {
    const self = this;
    this.props.userActions.getAllUsers(function (err, response) {
      if (!err && response) {
        const users = response.map((user) => { return user.attributes.email; });
        self.setState({
          allUsers: users
        });
      } else {
        self.setState({
          loadingStatus: false
        });
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

  getSlackDetails () {
    const self = this;
    this.props.appActions.getSlackDetails(function (err, result) {
      if (!err && result && result.data) {
        self.setState({
          slackDetails: result.data.attributes.value
        });
      }
      self.setState({
        formLoader: false
      });
    });
  }

  addSlackDetails () {
    const self = this;
    const slackWebhookURL = this.state.slackWebhookURL;
    if (!slackWebhookURL) {
      message.error('Webhook URL is mandatory');
      return;
    }
    this.setState({
      formLoader: true
    });
    const data = {
      url: slackWebhookURL
    };
    this.props.appActions.addSlackDetails(data, function (err, result) {
      if (!err && result && result.data) {
        self.setState({
          slackDetails: result.data.attributes.value
        });
      }
      self.setState({
        formLoader: false
      });
    });
  }

  updateSlackDetails (status) {
    const self = this;
    this.setState({
      formLoader: true
    });
    const data = {
      status
    };
    this.props.appActions.updateSlackDetails(data, function (err, result) {
      if (!err && result && result.data) {
        self.setState({
          slackDetails: result.data.attributes.value
        });
      }
      self.setState({
        formLoader: false
      });
    });
  }

  deleteSlackDetails () {
    const self = this;
    this.props.appActions.deleteSlackDetails(function (err, result) {
      if (!err && result && result.data) {
        self.setState({
          slackDetails: null
        });
      }
      self.setState({
        formLoader: false
      });
      self.getSlackDetails();
    });
  }

  getEmailDetails () {
    const self = this;
    this.props.appActions.getEmailDetails(function (err, result) {
      if (!err && result && result.data) {
        self.setState({
          emailDetails: result.data.attributes.value
        });
      }
      self.setState({
        formLoader: false
      });
    });
  }

  addEmailDetails () {
    const self = this;
    const sender = this.state.sender;
    const host = this.state.host;
    const port = this.state.port;
    const username = this.state.username;
    const password = this.state.password;
    const selectedUsers = this.state.selectedUsers || [];
    if (!sender || !host || !port || !username || !password || selectedUsers.length === 0) {
      message.error('All fields are mandatory');
      return;
    }
    this.setState({
      formLoader: true
    });
    const data = {
      sender,
      host,
      port,
      username,
      password,
      receivers: selectedUsers.join(',')
    };
    this.props.appActions.addEmailDetails(data, function (err, result) {
      if (!err && result && result.data) {
        self.setState({
          emailDetails: result.data.attributes.value
        });
      }
      self.setState({
        formLoader: false
      });
    });
  }

  updateEmailDetails (status) {
    const self = this;
    this.setState({
      formLoader: true
    });
    const data = {
      status
    };
    this.props.appActions.updateEmailDetails(data, function (err, result) {
      if (!err && result && result.data) {
        self.setState({
          emailDetails: result.data.attributes.value
        });
      }
      self.setState({
        formLoader: false
      });
    });
  }

  deleteEmailDetails () {
    const self = this;
    this.props.appActions.deleteEmailDetails(function (err, result) {
      if (!err && result && result.data) {
        self.setState({
          emailDetails: null
        });
      }
      self.setState({
        formLoader: false
      });
      self.getEmailDetails();
    });
  }

  handleChange (selectedUsers) {
    this.setState({
      selectedUsers
    });
  }

  render () {
    const slackWebhookURL = this.state.slackWebhookURL || '';
    const formLoader = this.state.formLoader || false;
    const slackDetails = this.state.slackDetails || null;
    const emailDetails = this.state.emailDetails || null;
    const sender = this.state.sender || null;
    const host = this.state.host || null;
    const port = this.state.port || null;
    const username = this.state.username || null;
    const password = this.state.password || null;
    const allUsers = this.state.allUsers || [];
    const selectedUsers = this.state.selectedUsers || [];

    let slackStatus, emailStatus;
    if (slackDetails) {
      slackStatus = slackDetails.status === undefined ? true : slackDetails.status;
    }
    if (emailDetails) {
      emailStatus = emailDetails.status === undefined ? true : emailDetails.status;
    }

    const filteredOptions = allUsers.filter(o => !selectedUsers.includes(o));

    return (
      <>
        <Row>
          <Col span={20} offset={2}>
            <Content className='all-users'>
              <Content className='setting-user'>
                <h1>Integrations</h1>
                <Divider />
                <Tabs tabPosition='left' className='integrations'>
                  <TabPane tab={<span><Icon type='slack' />Slack</span>} key='2'>
                    {!slackDetails &&
                      <>
                        <Form layout='horizontal'>
                          <Form.Item>
                            <Input value={slackWebhookURL} style={{ width: '500px' }} name='slackWebhookURL' placeholder='Slack Webhook URL' onChange={this.handleFormChange.bind(this)} autocomplete='off' />
                            <Button style={{ marginLeft: '20px' }} loading={formLoader} type='primary' onClick={this.addSlackDetails.bind(this)}>Add</Button>
                          </Form.Item>
                        </Form>
                        <Divider />
                        <div>
                          <ol>
                            <li>Go to <a target='_blank' href='https://my.slack.com/services/new/incoming-webhook/' rel='noreferrer'>https://my.slack.com/services/new/incoming-webhook/</a> to create a Slack Webhook.</li>
                            <li>When creating the Slack Webhook, choose the specific channel where you want to receive alerts.</li>
                          </ol>
                        </div>
                      </>}
                    {slackDetails && <Result status='success' title={slackStatus ? <span><Icon type='check-circle' style={{ color: 'green' }} theme='filled' className='custom-check' /> Slack Integrated</span> : <span><Icon type='pause-circle' style={{ color: 'orange' }} theme='filled' /> Slack Notifications Paused</span>} subTitle={slackStatus ? 'You will receive notifications for app downtime and custom alerts directly on Slack.' : 'You have paused Slack notifications for app downtime and custom alerts.'} extra={[<Button type='primary' onClick={this.updateSlackDetails.bind(this, !slackStatus)} key='1'> {slackStatus ? 'Pause Notifications' : 'Resume Notifications'} </Button>, <Button type='danger' onClick={this.deleteSlackDetails.bind(this)} key='2'> Remove </Button>]} />}
                  </TabPane>
                  <TabPane tab={<span><Icon type='mail' />Email</span>} key='3'>
                    {!emailDetails &&
                      <>
                        <Form layout='horizontal'>
                          <Form.Item>
                            <Input value={sender} style={{ width: '400px' }} name='sender' placeholder='Sender email address' onChange={this.handleFormChange.bind(this)} autocomplete='off' /><br />
                            <Input value={host} style={{ width: '400px' }} name='host' placeholder='SMTP Host' onChange={this.handleFormChange.bind(this)} autocomplete='off' /><br />
                            <Input value={port} style={{ width: '400px' }} name='port' placeholder='SMTP Port' onChange={this.handleFormChange.bind(this)} autocomplete='off' /><br />
                            <Input value={username} style={{ width: '400px' }} name='username' placeholder='Username' onChange={this.handleFormChange.bind(this)} autocomplete='off' /><br />
                            <Input value={password} style={{ width: '400px' }} name='password' placeholder='Password' onChange={this.handleFormChange.bind(this)} autocomplete='off' /><br />
                            <Select name='receivers' mode='multiple' placeholder='Select receivers email address' value={selectedUsers} onChange={this.handleChange.bind(this)} style={{ width: '400px' }}>
                              {filteredOptions.map(item => (
                                <Select.Option key={item} value={item}>
                                  {item}
                                </Select.Option>
                              ))}
                            </Select><br />
                            <Button loading={formLoader} type='primary' onClick={this.addEmailDetails.bind(this)}>Add</Button>
                          </Form.Item>
                        </Form>
                      </>}
                    {emailDetails && <Result status='success' title={emailStatus ? <span><Icon type='check-circle' theme='filled' style={{ color: 'green' }} className='custom-check' /> Email Integrated</span> : <span><Icon type='pause-circle' theme='filled' style={{ color: 'orange' }} /> Email Notifications Paused</span>} subTitle={emailStatus ? 'You will receive notifications for app downtime and custom alerts directly on Email.' : 'You have paused Email notifications for app downtime and custom alerts.'} extra={[<Button type='primary' onClick={this.updateEmailDetails.bind(this, !emailStatus)} key='1'> {emailStatus ? 'Pause Notifications' : 'Resume Notifications'} </Button>, <Button type='danger' onClick={this.deleteEmailDetails.bind(this)} key='2'> Remove </Button>]} />}
                  </TabPane>
                </Tabs>
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
)(withRouter(Integrations));
