import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { Result } from 'antd';
import Store from 'services/reduxStore';
import { createHashHistory } from 'history';

import Login from 'components/Login';
import Dashboard from 'components/Dashboard';
import ConsoleLogs from 'components/ConsoleLogs';
import Developers from 'components/Developers';
import Integrations from 'components/Integrations';
import DataRetention from 'components/DataRetention';

import 'antd/dist/antd.css';
const history = createHashHistory();

const NoMatch = () => (
  <Result status='warning' title='404' subTitle='Sorry, the page you visited does not exist.' />
);

const App = () => {
  return (
    <Provider store={Store}>
      <Router history={history}>
        <Switch>
          <Route path='/login' component={Login} />
          <Dashboard path='/'>
            <Route path='/logs' component={ConsoleLogs} />
            <Route path='/settings/developers' component={Developers} />
            <Route path='/settings/integrations' component={Integrations} />
            <Route path='/settings/data-retention' component={DataRetention} />
          </Dashboard>
          <Route path='*' component={NoMatch} />
        </Switch>
      </Router>
    </Provider>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
