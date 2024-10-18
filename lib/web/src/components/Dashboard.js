import React from 'react';
import { connect } from 'react-redux';
import withRouter from '../hoc/WithRouter';
import { bindActionCreators } from 'redux';
import { LoadingOutlined } from '@ant-design/icons';

/* import children component */
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

/* import actions */
import * as userActions from 'actions/userActions.js';

/* Ante UI */
import { Layout, Spin } from 'antd';
import { Navigate, Outlet } from 'react-router-dom';

/* mapStateToProps */
const mapStateToProps = (state) => ({
  userProfile: state.userProfileReducer.get('userProfile')
});

/* mapDispatchToProps */
const mapDispatchToProps = (dispatch) => ({
  userActions: bindActionCreators(userActions, dispatch)
});

/* Component Class */
class Dashboard extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      loadingStatus: true,
      isUserLoggedIn: false
    };
  }

  componentDidMount () {
    const self = this;
    this.props.userActions.getUserProfile(function (err, response) {
      if (!err && response && response.id) {
        self.setState({
          loadingStatus: false,
          isUserLoggedIn: true
        });
      } else {
        self.setState({
          loadingStatus: false,
          isUserLoggedIn: false
        });
      }
    });
  }

  render () {
    const { isUserLoggedIn, loadingStatus } = this.state;
    const antIcon = <LoadingOutlined style={{ fontSize: 40 }} spin />;

    // User is not authenticated; redirect to login with the current URL as a query parameter
    const currentUrl = window.location.href;
    let encodedRedirect;
    const isRedirectableLink = (url) => {
      const logsPathRegex = /\/#\/logs\?errsole_log_id=[^&]+/;
      return logsPathRegex.test(url);
    };

    if (isRedirectableLink(currentUrl)) {
      encodedRedirect = encodeURIComponent(currentUrl);
    }

    return (
      <>
        {!isUserLoggedIn && loadingStatus && (
          <Spin className='center-info' indicator={antIcon} />
        )}
        {isUserLoggedIn && !loadingStatus && (
          <Layout>
            <Sidebar className='sidebar-section' />
            <Layout>
              <Header />
              <Outlet />
            </Layout>
          </Layout>
        )}
        {!isUserLoggedIn && !loadingStatus && !encodedRedirect && <Navigate to='/login' />}
        {!isUserLoggedIn && !loadingStatus && encodedRedirect && <Navigate to={`/login?redirect=${encodedRedirect}`} />}
      </>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Dashboard));
