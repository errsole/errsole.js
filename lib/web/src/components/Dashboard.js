import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';

/* import children component */
import Header from 'components/Header.js';
import Sidebar from 'components/Sidebar.js';

/* import actions */
import * as userActions from 'actions/userActions.js';

/* Ante UI */
import { Layout, Icon, Spin } from 'antd';
import { Redirect } from 'react-router-dom/cjs/react-router-dom.min';

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
    const isUserLoggedIn = this.state.isUserLoggedIn;
    const loadingStatus = this.state.loadingStatus;
    const antIcon = <Icon type='loading' style={{ fontSize: 40 }} spin />;

    return (
      <>
        {!isUserLoggedIn && loadingStatus && <Spin className='center-info' indicator={antIcon} />}
        {isUserLoggedIn && !loadingStatus &&
          <Layout>
            <Sidebar className='sidebar-section' />
            <Layout>
              <Header />
              {this.props.children}
            </Layout>
          </Layout>}
        {!isUserLoggedIn && !loadingStatus && <Redirect to='/login' />}
      </>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Dashboard));
