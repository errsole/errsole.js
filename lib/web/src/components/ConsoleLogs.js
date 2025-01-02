import React from 'react';
import { connect } from 'react-redux';
import withRouter from '../hoc/WithRouter';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import Cookies from 'universal-cookie';
import ReactJson from '@microlink/react-json-view';
import dayjs from 'dayjs';

/* import components */
import ConsoleCombinedLogs from './ConsoleCombinedLogs';

/* import actions */
import * as logActions from 'actions/logActions.js';
import * as appActions from 'actions/appActions.js';

/* Ante UI */
import { DatePicker, Layout, Button, Collapse, Select, Spin, Switch, Modal, Tooltip, Menu, Dropdown, notification, message } from 'antd';

import { LoadingOutlined, MoreOutlined, RightOutlined, DownOutlined } from '@ant-design/icons';

const cookies = new Cookies();

const { Content } = Layout;
const { Panel } = Collapse;
const { Option, OptGroup } = Select;

/* mapStateToProps */
const mapStateToProps = (state, ownProps) => {
  return Object.assign({}, ownProps, {
    currentConsoleLogs: state.appReducer.get('currentConsoleLogs')
  });
};

/* mapDispatchToProps */
const mapDispatchToProps = (dispatch) => ({
  logActions: bindActionCreators(logActions, dispatch),
  appActions: bindActionCreators(appActions, dispatch)
});

class ConsoleLogs extends React.Component {
  constructor (props) {
    super(props);
    document.title = 'Logs | errsole';
    const timezone = cookies.get('errsole-timezone-preference');
    const ConsoleLogs = this.props.currentConsoleLogs;

    // let search = this.props.location.search;
    let search = this.props.router.location?.search || '';
    let errsoleLogQueryId = null;
    let errsoleLogQueryTimestamp = null;
    if (search !== '') {
      search = search.toLowerCase();
      const qparams = new URLSearchParams(search);
      errsoleLogQueryId = qparams.get('errsole_log_id');
      errsoleLogQueryTimestamp = qparams.get('timestamp');
      if (errsoleLogQueryId || errsoleLogQueryTimestamp) window.sessionStorage.removeItem('errsole-filter-details');
    }
    this.state = {
      currentConsoleLogs: ConsoleLogs || [],
      consoleLogLoading: false,
      logsType: [],
      searchDate: null,
      searchTime: null,
      selectedDatetime: null,
      searchTerms: [],
      errsoleLogQueryId,
      errsoleLogQueryTimestamp,
      timezone: timezone || 'Local',
      autoRefresh: false,
      isAutoRefreshing: false
    };
  }

  componentDidMount () {
    // set or update timezone
    const filterDetails = JSON.parse(window.sessionStorage.getItem('errsole-filter-details')) || {};
    filterDetails.timezone = this.state.timezone;
    window.sessionStorage.setItem('errsole-filter-details', JSON.stringify(filterDetails));

    // reupdate filters if revisit the page or component
    this.updateFilterState();
    // get console logs
    setTimeout(() => {
      if (this.state.currentConsoleLogs.length === 0) {
        this.getConsoleLogs(null, 'componentReload');
      }
    }, 200);
    // get hostnames
    this.getHostnames();
  }

  componentWillUnmount () {
    this.stopAutoRefresh();
  }

  handleAutoRefreshChange = (checked) => {
    this.setState({ autoRefresh: checked });

    if (checked) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  };

  startAutoRefresh = () => {
    this.autoRefreshInterval = setInterval(() => {
      this.setState({ isAutoRefreshing: true });
      this.getConsoleLogs(null, 'autoRefresh');
    }, 5000);
  };

  stopAutoRefresh = () => {
    clearInterval(this.autoRefreshInterval);
    this.setState({ isAutoRefreshing: false });
  };

  getHostnames () {
    const self = this;
    this.props.logActions.getHostnames(function (err, response) {
      if (err) {
        message.error('Unable to get hostnames');
      } else {
        if (response && response.data) {
          const hostnames = response.data.attributes.hostnames;
          self.setState({
            hostnames
          });
        } else {
          message.error('Unable to get hostnames');
        }
      }
    });
  }

  updateFilterState () {
    const filterDetailsFromSession = window.sessionStorage.getItem('errsole-filter-details');
    const filterDetails = JSON.parse(filterDetailsFromSession);
    // if query has errsole_log_id, set it in session and clean query from url
    const errsoleLogQueryId = this.state.errsoleLogQueryId;
    const errsoleLogQueryTimestamp = this.state.errsoleLogQueryTimestamp
      ? this.state.errsoleLogQueryTimestamp.replace('t', 'T').replace('z', 'Z')
      : null;
    if (errsoleLogQueryId) {
      if (!filterDetails.httpQuery) filterDetails.httpQuery = {};
      filterDetails.httpQuery.errsole_id = errsoleLogQueryId;
      if (errsoleLogQueryTimestamp) {
        // handle time and timezone
        const timezone = this.state.timezone || 'Local';
        // Convert UTC timestamp based on the timezone state
        let formattedDatetime;
        if (timezone === 'UTC') {
          formattedDatetime = moment.utc(errsoleLogQueryTimestamp).format('YYYY-MM-DD HH:mm:ss');
        } else {
          const formattedLocalDatetime = moment.utc(errsoleLogQueryTimestamp).local();
          formattedDatetime = formattedLocalDatetime.format('YYYY-MM-DD HH:mm:ss');
        }
        const [searchDate, searchTime] = formattedDatetime.split(' ');
        filterDetails.search_date = searchDate;
        filterDetails.search_time = searchTime;
        filterDetails.httpQuery.lte_timestamp = errsoleLogQueryTimestamp;
      }
      window.sessionStorage.setItem('errsole-filter-details', JSON.stringify(filterDetails));
      // push url state
      const url = new URL(window.location.href);
      url.hash = '#/logs';
      url.search = '';
      window.history.pushState({}, '', url);
    }
    if (filterDetails) {
      // restore
      const timezone = filterDetails.timezone;
      const searchDate = filterDetails.search_date;
      const searchTime = filterDetails.search_time;
      this.setState({
        searchDate,
        searchTime,
        timezone
      });
      // check query exist
      if (filterDetails.httpQuery) {
        let searchTerms = filterDetails?.httpQuery?.search_terms;
        if (searchTerms) {
          searchTerms = searchTerms.split(',');
          this.setState({
            searchTerms
          });
        }
        const levelJson = filterDetails?.httpQuery?.level_json;
        const hostnames = filterDetails?.httpQuery?.hostnames;
        const errsoleLogId = filterDetails?.httpQuery?.errsole_id;
        let logsType = [];
        if (levelJson) {
          logsType = JSON.parse(levelJson).map(function (item) {
            return item.source + '.' + item.level + 'Logs';
          });
        }
        if (hostnames) {
          const hostnameList = JSON.parse(hostnames).map(function (hostname) {
            return 'hostname.' + hostname;
          });
          logsType = logsType.concat(hostnameList);
        }
        if (errsoleLogId) {
          logsType = logsType.concat('errsolelogid.' + errsoleLogId);
        }
        this.setState({
          logsType,
          errsoleLogId
        });
      } else if (!errsoleLogQueryId) {
        this.setState({
          logsType: ['console.errorLogs', 'errsole.alertLogs', 'errsole.errorLogs']
        });
      }
    } else if (!errsoleLogQueryId) {
      this.setState({
        logsType: ['console.errorLogs', 'errsole.alertLogs', 'errsole.errorLogs']
      });
    }
  }

  getConsoleLogs (queryRequest, callType) {
    let query = {};
    // make sure logsType exist
    let logsType = this.state.logsType;
    if (queryRequest && queryRequest.logsType) {
      logsType = queryRequest.logsType;
    }
    if (!logsType) {
      return false;
    }
    //
    if (!queryRequest || (queryRequest && !queryRequest.logId)) {
      if (!queryRequest || !queryRequest.datetime) {
        query.lte_timestamp = new Date().toISOString();
      } else if (queryRequest && queryRequest.datetime && !this.state.latestTimestamp && !this.state.oldTimestamp) {
        query.lte_timestamp = new Date(queryRequest.datetime).toISOString();
      }
    }

    // get latest logs
    if (queryRequest && queryRequest.logId) {
      if (queryRequest.logOrder === 'old') {
        query.lt_id = queryRequest.logId;
      }
      if (queryRequest.logOrder === 'latest') {
        query.gt_id = queryRequest.logId;
      }
    }
    // search time
    if (this.state.latestTimestamp && queryRequest?.logOrder === 'latest') {
      if (query.gt_id) {
        query.gte_timestamp = new Date(queryRequest.datetime).toISOString();
      } else {
        query.gte_timestamp = this.state.latestTimestamp;
      }
    }
    if (this.state.oldTimestamp && queryRequest?.logOrder === 'old') {
      if (query.lt_id) {
        query.lte_timestamp = new Date(queryRequest.datetime).toISOString();
      } else {
        query.lte_timestamp = this.state.oldTimestamp;
      }
    }
    // search terms
    const searchTerms = this.state.searchTerms || [];
    if (searchTerms.length > 0) {
      query.search_terms = searchTerms.join(',');
    }
    // logs and hostname type
    if (logsType.length > 0) {
      // source + log level
      query.level_json = this.getLogLevelFilters(logsType);
      if (query.level_json.length > 0) {
        query.level_json = JSON.stringify(query.level_json);
      } else {
        delete query.level_json;
      }
      // hostnames
      query.hostnames = this.getHostnameFilters(logsType);
      if (query.hostnames.length > 0) {
        query.hostnames = JSON.stringify(query.hostnames);
      } else {
        delete query.hostnames;
      }
      // errsole_id
      const errsoleId = this.getErrsoleIdFilters(logsType);
      if (errsoleId) query.errsole_id = errsoleId;
    }

    query.logOrder = queryRequest?.logOrder;

    // save in session storage
    const filterDetailsFromSession = window.sessionStorage.getItem('errsole-filter-details');
    // store only [if not reload or load-more]
    if (callType !== 'componentReload' && callType !== 'loadMore') {
      const filterDetails = filterDetailsFromSession ? JSON.parse(filterDetailsFromSession) : {};
      filterDetails.httpQuery = query;
      window.sessionStorage.setItem('errsole-filter-details', JSON.stringify(filterDetails));
    }

    if (callType === 'componentReload' && filterDetailsFromSession) {
      const filterDetails = JSON.parse(filterDetailsFromSession);
      if (filterDetails.httpQuery) {
        if (!filterDetails.search_time || !filterDetails.search_date) {
          delete filterDetails.httpQuery.lte_timestamp;
          filterDetails.httpQuery.lte_timestamp = query.lte_timestamp;
        }

        query = Object.assign({}, query, filterDetails.httpQuery);
      }
    }
    if (callType === 'reset') {
      const filterDetails = {};
      filterDetails.httpQuery = query;
      window.sessionStorage.setItem('errsole-filter-details', JSON.stringify(filterDetails));
    }

    if (this.state.isAutoRefreshing && callType === 'autoRefresh') {
      // Skip the loading spinner during auto-refresh
      this.setState({ consoleLogLoading: false });
    } else {
      this.setState({ consoleLogLoading: true });
    }
    // http req
    this.getCurrentConsoleLogs(query);
  }

  getCurrentConsoleLogs (query) {
    const self = this;
    const logOrder = query.logOrder;
    if (!query.logOrder) delete query.logOrder;

    if (query.lte_timestamp) {
      query.lte_timestamp = new Date(new Date(query.lte_timestamp).getTime() + 1000).toISOString();
    }

    this.setState({
      consoleLogLoading: true
    });
    this.props.logActions.getConsoleLogs(query, function (err, data) {
      if (!err) {
        try {
          let logs = data.data || [];
          const filters = data.meta ? data.meta.filters : {};
          // no search
          if (!filters || Object.keys(filters).length === 0) {
            if (logs.length === 0) {
              self.notificationMsg('info', 'No logs to load with the applied filters. Try adjusting the filters or search terms and search again.', '', 3);
            } else if (logs.length > 0) {
              logs = self.combineLogs(logs, logOrder);
              self.setState({
                currentConsoleLogs: logs
              });
              self.props.appActions.addConsoleLogs(logs);
            }
            self.setState({
              oldTimestamp: null,
              latestTimestamp: null
            });
          }
          // handle search
          if (filters && Object.keys(filters).length !== 0) {
            const oldTimestamp = filters.gte_timestamp;
            const latestTimestamp = filters.lte_timestamp;
            if (logs.length === 0) {
              logs = [{
                type: 'logs',
                attributes: {
                  oldTimestamp,
                  latestTimestamp
                }
              }];
            }
            logs = self.combineLogs(logs, logOrder);
            self.setState({
              currentConsoleLogs: logs
            });
            self.props.appActions.addConsoleLogs(logs);
            if (!logOrder || (!self.state.oldTimestamp && !self.state.latestTimestamp)) {
              self.setState({
                oldTimestamp,
                latestTimestamp
              });
            } else if (logOrder === 'old') {
              self.setState({
                oldTimestamp
              });
            } else if (logOrder === 'latest') {
              self.setState({
                latestTimestamp
              });
            }
          }
        } catch (e) {
          console.error(e);
          self.notificationMsg();
        }
      } else {
        self.notificationMsg();
      }
      self.setState({
        consoleLogLoading: false
      });
    });
  }

  getLogLevelFilters (filterList) {
    const result = [];
    filterList.forEach(list => {
      if (list.startsWith('console.') || list.startsWith('errsole.')) {
        const parts = list.split('.');
        if (parts.length === 2) {
          const source = parts[0];
          const level = parts[1].replace('Logs', '');
          result.push({ source, level });
        }
      }
    });
    return result;
  }

  getHostnameFilters (filterList) {
    const result = [];
    filterList.forEach(list => {
      if (list.startsWith('hostname.')) {
        const parts = list.split('hostname.');
        if (parts.length === 2) {
          const hostname = parts[1];
          result.push(hostname);
        }
      }
    });
    return result;
  }

  getErrsoleIdFilters (filterList) {
    let result;
    filterList.forEach(list => {
      if (list.startsWith('errsolelogid.')) {
        const parts = list.split('errsolelogid.');
        if (parts.length === 2) {
          result = parts[1];
        }
      }
    });
    return result;
  }

  combineLogs (newLogs, logOrder) {
    const oldLogs = this.state.currentConsoleLogs || [];
    let allLogs;
    if (logOrder === 'latest') allLogs = oldLogs.concat(newLogs);
    else if (logOrder === 'old') allLogs = newLogs.concat(oldLogs);
    else allLogs = newLogs;
    return allLogs;
  }

  notificationMsg (type = 'info', message = 'Something went wrong. Please report the issue using the Help & Support section', description = '', duration = 7) {
    notification[type]({
      message,
      description,
      duration,
      onClick: () => {}
    });
  }

  updateLogsFilter (item) {
    let logsType = [];
    logsType = logsType.concat(item);
    this.setState({
      logsType
    });
  }

  updateSearchTerms (terms) {
    let searchTerms = [];
    searchTerms = searchTerms.concat(terms);
    this.setState({
      searchTerms
    });
  }

  loadMoreErrors (logOrder) {
    const currentConsoleLogs = this.state.currentConsoleLogs || [];
    let logId, datetime;
    if (logOrder === 'latest') {
      logId = currentConsoleLogs.length > 0 ? currentConsoleLogs[currentConsoleLogs.length - 1].id : null;
      if (this.state.latestTimestamp) {
        if (logId) {
          datetime = currentConsoleLogs[currentConsoleLogs.length - 1].attributes.timestamp;
        } else {
          datetime = this.state.latestTimestamp;
        }
      }
    } else if (logOrder === 'old') {
      logId = currentConsoleLogs.length > 0 ? currentConsoleLogs[0].id : null;
      if (this.state.oldTimestamp) {
        if (logId) {
          datetime = currentConsoleLogs[0].attributes.timestamp;
        } else {
          datetime = this.state.oldTimestamp;
        }
      }
    }
    this.getConsoleLogs({ logOrder, logId, datetime }, 'loadMore');
  }

  sortLogs (latest) {
    const old = this.state.currentConsoleLogs || [];
    const total = old.concat(latest);
    const combined = total.filter(element => element.attributes.timestamp !== undefined);
    // Remove duplicates
    const uniqueLogs = combined.reduce((acc, current) => {
      const x = acc.find(item => item.id === current.id);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
    // Sort by id first
    uniqueLogs.sort((a, b) => a.id.localeCompare(b.id));
    // Then sort by timestamp
    uniqueLogs.sort((a, b) => {
      const dateA = new Date(a.attributes.timestamp);
      const dateB = new Date(b.attributes.timestamp);
      return dateA - dateB;
    });

    // Function to compare arrays
    const arraysAreEqual = (array1, array2) => {
      if (array1.length !== array2.length) return false;
      for (let i = 0; i < array1.length; i++) {
        if (array1[i].id !== array2[i].id || new Date(array1[i].attributes.timestamp).getTime() !== new Date(array2[i].attributes.timestamp).getTime()) {
          return false;
        }
      }
      return true;
    };

    // Check if old and uniqueLogs are the same
    if (arraysAreEqual(old, uniqueLogs)) {
      this.notificationMsg('info', 'No logs to load with the applied filters. Try adjusting the filters or search terms and search again.', '', 3);
    }

    return uniqueLogs;
  }

  handleFormChange (e) {
    const key = e.target.name;
    const value = e.target.value;
    this.setState({
      [key]: value
    });
  }

  handleDateTimeChange (datetime, datetimeString) {
    if (!datetimeString) {
      this.handleDateChange(null);
      this.handleTimeChange(null);
      return;
    }
    const [datePart, timePart] = datetimeString.split(' ');
    this.handleDateChange(datePart || null);
    this.handleTimeChange(timePart || null);
  }

  handleDateChange (dateString) {
    this.setState({ searchDate: dateString }); // Save the formatted date string
  }

  handleTimeChange (timeString) {
    this.setState({ searchTime: timeString }); // Save the formatted time string
  }

  setSelectedDatetime (searchDate, searchTime) {
    const timezone = this.state.timezone || 'Local';
    const selectedDatetime = timezone === 'Local'
      ? moment(searchDate + ' ' + searchTime)
      : moment.utc(searchDate + ' ' + searchTime);

    this.setState({
      selectedDatetime,
      currentConsoleLogs: []
    });

    this.props.appActions.clearConsoleLogs();
    const timestamp = selectedDatetime.toISOString();
    this.getConsoleLogs({ datetime: timestamp, logOrder: 'latest' });
  }

  apply () {
    const self = this;
    const searchDate = this.state.searchDate;
    const searchTime = this.state.searchTime;

    let isDateEmpty = false;
    if (typeof searchDate !== 'string' || searchDate.trim() === '') {
      isDateEmpty = true;
    }
    let isTimeEmpty = false;
    if (typeof searchTime !== 'string' || searchTime.trim() === '') {
      isTimeEmpty = true;
    }
    if (this.state.oldTimestamp || this.state.latestTimestamp) {
      this.setState({
        oldTimestamp: null,
        latestTimestamp: null
      });
    }
    if (isDateEmpty && isTimeEmpty) {
      // clear date, time from session storage
      const filterDetailsFromSession = window.sessionStorage.getItem('errsole-filter-details');
      if (filterDetailsFromSession) {
        const filterDetails = JSON.parse(filterDetailsFromSession);
        delete filterDetails.searchDate;
        delete filterDetails.searchTime;
        window.sessionStorage.setItem('errsole-filter-details', JSON.stringify(filterDetails));
      }
      //
      this.setState({
        currentConsoleLogs: []
      });
      this.props.appActions.clearConsoleLogs();
      this.getConsoleLogs(null);
    } else if (this.isValidDateFormat(searchDate) && this.isValidTimeFormat(searchTime)) {
      // add date, time in session storage
      const filterDetailsFromSession = window.sessionStorage.getItem('errsole-filter-details');
      if (filterDetailsFromSession) {
        const filterDetails = JSON.parse(filterDetailsFromSession);
        filterDetails.search_date = searchDate;
        filterDetails.search_time = searchTime;
        window.sessionStorage.setItem('errsole-filter-details', JSON.stringify(filterDetails));
      }
      setTimeout(function () { self.setSelectedDatetime(searchDate, searchTime); }, 200);
    } else {
      this.notificationMsg('error', 'Please enter a valid date and time range in the format YYYY-MM-DD HH:MM:SS 222');
    }
  }

  reset () {
    this.setState({
      logsType: [],
      selectedDatetime: null,
      searchDate: null,
      searchTime: null,
      currentConsoleLogs: [],
      searchTerms: [],
      oldTimestamp: null,
      latestTimestamp: null
    });
    this.props.appActions.clearConsoleLogs();
    setTimeout(() => {
      const currentTime = new Date().toISOString();
      this.getConsoleLogs({ datetime: currentTime, logOrder: 'old' }, 'reset');
    }, 200);
  }

  isValidDateFormat (dateString) {
    const format = 'YYYY-MM-DD';
    return moment(dateString, format, true).isValid();
  }

  isValidTimeFormat (timeString) {
    const format = 'HH:mm:ss';
    return moment(timeString, format, true).isValid();
  }

  handleAllPanel () {
    const currentConsoleLogs = this.state.currentConsoleLogs || [];
    const activeKeys = this.state.activeKeys || [];
    if (currentConsoleLogs.length > 0 && activeKeys.length === 0) {
      const logIds = currentConsoleLogs.map(log => log.id);
      this.setState({
        activeKeys: logIds
      });
    } else if (currentConsoleLogs.length > 0 && activeKeys.length > 0) {
      this.setState({
        activeKeys: []
      });
    }
  }

  handlePanelChange (keys) {
    this.setState({
      activeKeys: keys
    });
  }

  changeTimezone (status) {
    let timezone;
    if (status) {
      timezone = 'Local';
    } else {
      timezone = 'UTC';
    }
    cookies.set('errsole-timezone-preference', timezone, { path: '/', maxAge: 30 * 24 * 60 * 60 });
    const filterDetailsFromSession = window.sessionStorage.getItem('errsole-filter-details');
    if (filterDetailsFromSession) {
      const filterDetails = JSON.parse(filterDetailsFromSession);
      filterDetails.timezone = timezone;
      window.sessionStorage.setItem('errsole-filter-details', JSON.stringify(filterDetails));
    } else {
      const filterDetails = {};
      filterDetails.timezone = timezone;
      window.sessionStorage.setItem('errsole-filter-details', JSON.stringify(filterDetails));
    }
    this.setState({
      timezone
    });
  }

  openCombinedLogsModal (errorLogTimestamp, errorLogId, errorLogHostname) {
    if (errorLogTimestamp) {
      this.setState({
        errorLogTimestamp,
        errorLogId,
        errorLogHostname,
        combinedLogsModalStatus: true
      });
    }
  }

  closeCombinedLogsModal () {
    this.setState({
      errorLogTimestamp: null,
      combinedLogsModalStatus: false
    });
  }

  openLogMetaModal (logId, meta) {
    const self = this;
    if (logId && meta) {
      this.setState({
        activeLogId: logId,
        activeLogMeta: meta,
        metaModalStatus: true
      });
    } else if (logId) {
      this.props.logActions.getLogMeta(logId, function (err, data) {
        if (!err && data) {
          const attributes = data.data?.attributes || {};
          const meta = attributes?.meta || '{}';
          self.setState({
            activeLogId: logId,
            activeLogMeta: meta,
            metaModalStatus: true
          });
        }
      });
    }
  }

  closeLogMetaModal () {
    this.setState({
      activeLogId: null,
      activeLogMeta: null,
      metaModalStatus: false
    });
  }

  render () {
    const logsType = this.state.logsType || [];
    const consoleLogLoading = this.state.consoleLogLoading || false;
    const searchDate = this.state.searchDate;
    const searchTime = this.state.searchTime;
    const activeKeys = this.state.activeKeys || [];
    const currentConsoleLogs = this.state.currentConsoleLogs || [];
    const timezone = this.state.timezone || 'Local';
    const combinedLogsModalStatus = this.state.combinedLogsModalStatus || false;
    const errorLogTimestamp = this.state.errorLogTimestamp || null;
    const errorLogId = this.state.errorLogId || null;
    const errorLogHostname = this.state.errorLogHostname || null;
    const antIcon = <LoadingOutlined style={{ fontSize: 30 }} spin />;
    const searchTerms = this.state.searchTerms || [];
    const activeLogMeta = this.state.activeLogMeta || null;
    const metaModalStatus = this.state.metaModalStatus || false;
    const hostnames = this.state.hostnames || [];
    const errsoleLogId = this.state.errsoleLogId;

    const renderConsoleLogs = () => {
      return currentConsoleLogs.map((log) => {
        if (!log.attributes || !log.attributes.message || !log.attributes.level || !log.attributes.timestamp) {
          return false;
        } else if (log.attributes.message === '') {
          return false;
        }
        const message = log.attributes.message;
        const hostname = log.attributes.hostname || 'N/A';
        const pid = log.attributes.pid || 'N/A';
        const source = log.attributes.source || 'N/A';
        const level = log.attributes.level;
        const occurredAt = log.attributes.timestamp;
        const meta = log.attributes.meta || null;
        const logId = log.id;
        const occurredAtFormated = timezone === 'Local' ? moment(occurredAt).format('YYYY-MM-DD HH:mm:ss Z') : moment.utc(occurredAt).format('YYYY-MM-DD HH:mm:ss Z');

        if (log.attributes.latestTimestamp || log.attributes.oldTimestamp) {
          const oldTimestamp = timezone === 'Local' ? moment(log.attributes.oldTimestamp).format('YYYY-MM-DD HH:mm:ss') : moment.utc(log.attributes.oldTimestamp).format('YYYY-MM-DD HH:mm:ss');
          const latestTimestamp = timezone === 'Local' ? moment(log.attributes.latestTimestamp).format('YYYY-MM-DD HH:mm:ss') : moment.utc(log.attributes.latestTimestamp).format('YYYY-MM-DD HH:mm:ss');

          const panel = <Panel showArrow={false} className='log_panel no-log-panel' key={Math.random()} header={<p>No logs were found for the search keywords during the period from <b>{oldTimestamp}</b> to <b>{latestTimestamp}</b></p>}><pre className='log_message_detail'>{'No logs were found for the search keywords during the period from ' + oldTimestamp + ' to ' + latestTimestamp}</pre></Panel>;
          return panel;
        }

        let header;
        if (level === 'error' || level === 'alert') {
          header = <p className={(source === 'errsole' && 'log_panel_header panel-details') || (source === 'console' && 'log_panel_header panel-details-no-meta')}><span className='log_timestamp'>{occurredAtFormated}</span><span className='log_message_top' style={{ color: '#db4e09' }}>{message}</span></p>;
        } else {
          header = <p className={(source === 'errsole' && 'log_panel_header panel-details') || (source === 'console' && 'log_panel_header panel-details-no-meta')}><span className='log_timestamp'>{occurredAtFormated}</span><span className='log_message_top'>{message}</span></p>;
        }

        const menu = (
          <Menu>
            <Menu.Item key='1' onClick={this.openLogMetaModal.bind(this, logId, meta)}>
              View Meta
            </Menu.Item>
          </Menu>
        );

        const panel = <Panel className='log_panel' header={header} key={logId} extra={<span className='view-log-extra' onClick={event => { event.stopPropagation(); }}><Tooltip placement='topRight' title='View surrounding logs on the host'><Button onClick={this.openCombinedLogsModal.bind(this, occurredAt, logId, hostname)} type='primary'>View Logs</Button></Tooltip>{source === 'errsole' && <Dropdown overlay={menu} className='view-log-details'><Button type='primary'><MoreOutlined /></Button></Dropdown>}</span>}><pre className='log_message_detail'>{message}</pre><p className='log-details'><b>Hostname: </b>{hostname} &nbsp;&nbsp;|&nbsp;&nbsp; <b>PID: </b>{pid} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Source: </b>{source} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Level: </b>{level}</p></Panel>;

        return panel;
      });
    };

    const sortObjectKeys = (data) => {
      if (Array.isArray(data)) {
        return data.map(sortObjectKeys);
      } else if (typeof data === 'object' && data !== null) {
        return Object.keys(data).sort().reduce((result, key) => {
          result[key] = sortObjectKeys(data[key]);
          return result;
        }, {});
      } else {
        return data;
      }
    };

    const showMeta = () => {
      if (activeLogMeta) {
        try {
          const parsedObject = JSON.parse(activeLogMeta);
          if (typeof parsedObject === 'object') {
            return <ReactJson src={sortObjectKeys(parsedObject)} name={false} collapsed={3} displayDataTypes={false} displayObjectSize={false} enableClipboard={false} />;
          } else {
            return <pre>{activeLogMeta}</pre>;
          }
        } catch (e) {
          return <pre>{activeLogMeta}</pre>;
        }
      } else {
        return 'No details available';
      }
    };

    const showHostnames = () => {
      return hostnames.map((name) => {
        return <Option value={'hostname.' + name} key={name}>Hostname: {name}</Option>;
      });
    };

    const showErrsoleLogId = () => {
      if (errsoleLogId) {
        return <Option value={'errsolelogid.' + errsoleLogId} key={errsoleLogId}>Log Id: {errsoleLogId}</Option>;
      }
    };

    return (
      <div className='logs-layout'>
        <Spin indicator={antIcon} spinning={consoleLogLoading && !this.state.isAutoRefreshing} delay={100}>
          <Content>
            <div className='search-div'>
              <div className='search-logs'>
                <Select dropdownClassName='search-logs-dropdown' className='search-input custom-select' mode='tags' placeholder='Search Keywords' onChange={this.updateSearchTerms.bind(this)} value={searchTerms} />
              </div>
            </div>
            <div className='filter-div'>
              <div className='filter filter-input-div float-l filter-logs'>
                <Select className='filter-input custom-select' mode='multiple' placeholder='Select Filter' onChange={this.updateLogsFilter.bind(this)} value={logsType}>
                  <OptGroup label='Log Levels'>
                    <Option value='console.errorLogs'>Console: Error Logs</Option>
                    <Option value='console.infoLogs'>Console: Info Logs</Option>
                    <Option value='errsole.alertLogs'>Errsole: Alert Logs</Option>
                    <Option value='errsole.errorLogs'>Errsole: Error Logs</Option>
                    <Option value='errsole.warnLogs'>Errsole: Warn Logs</Option>
                    <Option value='errsole.infoLogs'>Errsole: Info Logs</Option>
                    <Option value='errsole.debugLogs'>Errsole: Debug Logs</Option>
                  </OptGroup>
                  <OptGroup label='Hostnames'>
                    {hostnames.length > 0 && showHostnames()}
                  </OptGroup>
                  {errsoleLogId && showErrsoleLogId()}
                </Select>
              </div>
              <div className='filter float-l date-picker'>
                <DatePicker
                  className='datetime-picker-date'
                  placeholder='Select Date and Time'
                  format='YYYY-MM-DD HH:mm:ss'
                  showTime
                  onChange={this.handleDateTimeChange.bind(this)}
                  needConfirm={false}
                  value={
                    searchDate && searchTime
                      ? dayjs(`${searchDate} ${searchTime}`, 'YYYY-MM-DD HH:mm:ss')
                      : null
                  }
                />
              </div>
              <div className='button-row'>
                <div className='filter float-l log-btn-apply'>
                  <Button onClick={this.apply.bind(this)} type='primary'>Apply</Button>
                </div>
                <div className='filter float-l log-btn-reset'>
                  <Button onClick={this.reset.bind(this)}>Reset</Button>
                </div>
              </div>
            </div>
            <div className='filter_sort p-20 console_log_content'>
              <div className='content-box'>
                <p className='header'>{activeKeys.length > 0
                  ? (<DownOutlined className='header_col_icon' onClick={this.handleAllPanel.bind(this)} />
                    )
                  : (
                    <RightOutlined className='header_col_icon' onClick={this.handleAllPanel.bind(this)} />
                    )}<span className='header_col_1'>Timestamp</span>
                  <span className='header_col_2'>Message
                    <div className='filter float-r log-btn-reset'>
                      <span className='Timezone'>Timezone <Switch checkedChildren='Local' unCheckedChildren='UTC' checked={timezone === 'Local'} onChange={this.changeTimezone.bind(this)} /></span>
                      <span className='Auto-Refresh'>
                        Auto Refresh <Switch
                          checkedChildren='On'
                          unCheckedChildren='Off'
                          checked={this.state.autoRefresh}
                          onChange={this.handleAutoRefreshChange}
                                     />
                      </span>
                    </div>
                  </span>
                  <span className='hide-message'>
                    <div className='filter float-r log-btn-reset divide-container'>
                      <div className='timezone-container'>
                        <span>Timezone <Switch checkedChildren='Local' unCheckedChildren='UTC' checked={timezone === 'Local'} onChange={this.changeTimezone.bind(this)} /></span>
                      </div>
                      <div className='autorefresh-container'>
                        <span className='Auto-Refresh'>
                          AutoRefresh <Switch
                            checkedChildren='On'
                            unCheckedChildren='Off'
                            checked={this.state.autoRefresh}
                            onChange={this.handleAutoRefreshChange}
                                      />
                        </span>
                      </div>
                    </div>
                  </span>
                  <span className='log-ttl-msg' />
                </p>
                {currentConsoleLogs.length !== 0 &&
                  <Collapse activeKey={activeKeys} onChange={this.handlePanelChange.bind(this)}>
                    <p className='logs_more'>There may be older logs to load. <a onClick={this.loadMoreErrors.bind(this, 'old')}>Load More</a> </p>
                    {renderConsoleLogs()}
                    <p className='logs_more'>There may be newer logs to load. <a onClick={this.loadMoreErrors.bind(this, 'latest')}>Load More</a> </p>
                  </Collapse>}
                {currentConsoleLogs.length === 0 && <div className='ant-empty ant-empty-normal'><div className='ant-empty-image'><svg width='64' height='41' viewBox='0 0 64 41' xmlns='http://www.w3.org/2000/svg'><g transform='translate(0 1)' fill='none' fillRule='evenodd'><ellipse fill='#F5F5F5' cx='32' cy='33' rx='32' ry='7' /><g fillRule='nonzero' stroke='#D9D9D9'><path d='M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z' /><path d='M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z' fill='#FAFAFA' /></g></g></svg></div><p className='ant-empty-description'>No Data</p></div>}
              </div>
            </div>
          </Content>
        </Spin>
        <Modal className='view-logs-modal' width='90%' centered closable maskClosable footer={null} visible={combinedLogsModalStatus} onCancel={this.closeCombinedLogsModal.bind(this, null)} destroyOnClose>
          <ConsoleCombinedLogs errorLogTimestamp={errorLogTimestamp} errorLogId={errorLogId} errorLogHostname={errorLogHostname} />
        </Modal>
        <Modal className='view-log-meta-modal' width='90%' centered closable maskClosable footer={null} visible={metaModalStatus} onCancel={this.closeLogMetaModal.bind(this, null)} destroyOnClose>
          <div className='log-meta-div'>{showMeta()}</div>
        </Modal>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ConsoleLogs));
