// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // React 18
import { Provider } from 'react-redux';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import 'antd/dist/reset.css'; // Ant Design CSS reset
import { Result } from 'antd';
import store from './services/reduxStore';
import { createHashHistory } from 'history';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UsefulLinks from './components/UsefulLinks';
import DataRetention from './components/DataRetention';
import Integrations from './components/Integrations';
import Developers from './components/Developers';
import ConsoleLogs from './components/ConsoleLogs';

const history = createHashHistory();
const NoMatch = () => (
  <Result status='warning' title='404' subTitle='Sorry, the page you visited does not exist.' />
);

const App = () => (
  <Provider store={store}>
    <Router history={history}>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<Dashboard />}>
          <Route path='logs' element={<ConsoleLogs />} />
          <Route path='settings/developers' element={<Developers />} />
          <Route path='settings/integrations' element={<Integrations />} />
          <Route path='settings/data-retention' element={<DataRetention />} />
          <Route path='useful-links' element={<UsefulLinks />} />
        </Route>
        <Route path='*' element={<NoMatch />} />
      </Routes>
    </Router>
  </Provider>
);

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
