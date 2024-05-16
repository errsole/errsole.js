import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import Cookies from 'universal-cookie';
import ReactJson from 'react-json-view';

/* import components */
import ConsoleCombinedLogs from 'components/ConsoleCombinedLogs.js';

/* import actions */
import * as logActions from 'actions/logActions.js';

/* Ante UI */
import { Layout, Input, Icon, Button, Collapse, Select, Spin, Switch, Modal, Tooltip, Menu, Dropdown, notification } from 'antd';
const cookies = new Cookies();

const { Content } = Layout;
const { Panel } = Collapse;
const { Option } = Select;

/* mapStateToProps */
const mapStateToProps = (state) => ({
});

/* mapDispatchToProps */
const mapDispatchToProps = (dispatch) => ({
  logActions: bindActionCreators(logActions, dispatch)
});

class ConsoleLogs extends React.Component {
  constructor (props) {
    super(props);
    document.title = 'Logs | errsole';
    const timezone = cookies.get('errsole-timezone-preference');
    this.state = {
      currentConsoleLogs: [],
      consoleLogLoading: false,
      logsType: ['console.errorLogs', 'errsole.alertLogs', 'errsole.errorLogs'],
      searchDate: null,
      searchTime: null,
      selectedDatetime: null,
      searchTerms: [],
      timezone
    };
  }

  componentDidMount () {
    this.getConsoleLogs(null);
  }

  getConsoleLogs (queryRequest) {
    const query = {};
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
      query.gte_timestamp = this.state.latestTimestamp;
    }
    if (this.state.oldTimestamp && queryRequest?.logOrder === 'old') {
      query.lte_timestamp = this.state.oldTimestamp;
    }
    this.getCurrentConsoleLogs(query, logsType, queryRequest?.logOrder);
  }

  getCurrentConsoleLogs (query, logsType, logOrder) {
    const self = this;
    const searchTerms = this.state.searchTerms || [];
    if (searchTerms.length > 0) {
      query.search_terms = searchTerms.join(',');
    }
    if (logsType.length > 0) {
      query.level_json = this.convertLogs(logsType);
      query.level_json = JSON.stringify(query.level_json);
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
              self.notificationMsg('info', 'No logs to load');
            } else if (logs.length > 0) {
              logs = self.combineLogs(logs, logOrder);
              self.setState({
                currentConsoleLogs: logs
              });
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
            if (!logOrder) {
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

  convertLogs (logList) {
    const result = [];
    logList.forEach(log => {
      const parts = log.split('.');
      if (parts.length === 2) {
        const source = parts[0];
        const level = parts[1].replace('Logs', '');
        result.push({ source, level });
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

  notificationMsg (type = 'info', message = 'Something went wrong. Please report the issue using the Help & Support section', description = '') {
    notification[type]({
      message,
      description,
      duration: 7,
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

  removeFilterTags (value) {
    let logsType = this.state.logsType || [];
    logsType = logsType.filter(type => type !== value);
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
    this.getConsoleLogs({ logOrder, logId, datetime });
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
      this.notificationMsg('info', 'No logs to load');
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

  setSelectedDatetime (searchDate, searchTime) {
    const timezone = this.state.timezone || 'Local';
    if (timezone !== 'Local') {
      // UTC Current
      const currentUTCTime = moment.utc();
      // selected UTC
      const selectedDatetime = moment.utc(searchDate + ' ' + searchTime);

      const isBefore = selectedDatetime.isBefore(currentUTCTime);
      if (isBefore) {
        this.setState({
          selectedDatetime,
          currentConsoleLogs: []
        });
        const timestamp = selectedDatetime.toISOString();
        this.getConsoleLogs({ datetime: timestamp, logOrder: 'latest' });
      } else {
        this.notificationMsg('error', 'Please enter a valid date and time range in the format YYYY-MM-DD HH:MM:SS');
      }
    } else {
      const selectedDatetime = moment(searchDate + ' ' + searchTime);
      this.setState({
        selectedDatetime
      });
      const timestamp = selectedDatetime.toISOString();
      this.setState({
        currentConsoleLogs: []
      });
      this.getConsoleLogs({ datetime: timestamp, logOrder: 'latest' });
    }
  }

  apply () {
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
    if (isDateEmpty && isTimeEmpty) {
      this.setState({
        currentConsoleLogs: []
      });
      this.getConsoleLogs(null);
    } else if (this.isValidDateFormat(searchDate) && this.isValidTimeFormat(searchTime)) {
      this.setSelectedDatetime(searchDate, searchTime);
    } else {
      this.notificationMsg('error', 'Please enter a valid date and time range in the format YYYY-MM-DD HH:MM:SS');
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
    setTimeout(() => {
      const currentTime = new Date().toISOString();
      this.getConsoleLogs({ datetime: currentTime, logOrder: 'old' });
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
    this.setState({
      timezone
    });
  }

  openCombinedLogsModal (errorLogTimestamp, errorLogId) {
    if (errorLogTimestamp) {
      this.setState({
        errorLogTimestamp,
        errorLogId,
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
    const antIcon = <Icon type='loading' style={{ fontSize: 30 }} spin />;
    const searchTerms = this.state.searchTerms || [];
    const activeLogMeta = this.state.activeLogMeta || null;
    const metaModalStatus = this.state.metaModalStatus || false;

    const renderConsoleLogs = () => {
      return currentConsoleLogs.map((log) => {
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

          const panel = <Panel showArrow={false} className='log_panel no-log-panel' key={Math.random()} header={'No logs were found during the period from ' + oldTimestamp + ' to ' + latestTimestamp}><pre className='log_message_detail'>{'No logs were found during the period from ' + oldTimestamp + ' to ' + latestTimestamp}</pre></Panel>;
          return panel;
        }

        let header;
        if (level === 'error' || level === 'alert') {
          header = <p className='log_panel_header panel-details'><span className='log_timestamp'>{occurredAtFormated}</span><span className='log_message_top' style={{ color: '#db4e09' }}>{message}</span></p>;
        } else {
          header = <p className='log_panel_header panel-details'><span className='log_timestamp'>{occurredAtFormated}</span><span className='log_message_top'>{message}</span></p>;
        }

        const menu = (
          <Menu>
            <Menu.Item key='1' onClick={this.openLogMetaModal.bind(this, logId, meta)}>
              View Meta
            </Menu.Item>
          </Menu>
        );

        const panel = <Panel className='log_panel' header={header} key={logId} extra={<span className='view-log-extra' onClick={event => { event.stopPropagation(); }}><Tooltip placement='topRight' title='View all logs around this log'><Button onClick={this.openCombinedLogsModal.bind(this, occurredAt, logId)} type='primary'>View Logs</Button></Tooltip><Dropdown overlay={menu} className='view-log-details'><Button type='primary'><Icon type='more' /></Button></Dropdown></span>}><pre className='log_message_detail'>{message}</pre><p className='log-details'><b>Hostname: </b>{hostname} &nbsp;&nbsp;|&nbsp;&nbsp; <b>PID: </b>{pid} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Source: </b>{source} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Level: </b>{level}</p></Panel>;

        return panel;
      });
    };

    const showMeta = () => {
      if (activeLogMeta) {
        try {
          const parsedObject = JSON.parse(activeLogMeta);
          if (typeof parsedObject === 'object') {
            return <ReactJson src={parsedObject} name={false} collapsed={3} displayDataTypes={false} displayObjectSize={false} enableClipboard={false} />;
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

    return (
      <div className='logs-layout'>
        <Spin indicator={antIcon} spinning={consoleLogLoading} delay={100}>
          <Content>
            <div className='search-div'>
              <div className='search-logs'>
                <Select dropdownClassName='search-logs-dropdown' className='search-input' mode='tags' placeholder='Search Keywords' onChange={this.updateSearchTerms.bind(this)} value={searchTerms} />
              </div>
            </div>
            <div className='filter-div'>
              <div className='filter filter-input-div float-l filter-logs'>
                <Select className='filter-input' mode='multiple' placeholder='Select Filters' onChange={this.updateLogsFilter.bind(this)} value={logsType}>
                  <Option value='console.errorLogs'>Console: Error Logs</Option>
                  <Option value='console.infoLogs'>Console: Info Logs</Option>
                  <Option value='errsole.alertLogs'>Errsole: Alert Logs</Option>
                  <Option value='errsole.errorLogs'>Errsole: Error Logs</Option>
                  <Option value='errsole.warnLogs'>Errsole: Warn Logs</Option>
                  <Option value='errsole.infoLogs'>Errsole: Info Logs</Option>
                  <Option value='errsole.debugLogs'>Errsole: Debug Logs</Option>
                </Select>
              </div>
              <div className='filter float-l date-picker'>
                <Input placeholder='YYYY-MM-DD' className='date-picker-date' name='searchDate' value={searchDate} onChange={this.handleFormChange.bind(this)} />
              </div>
              <div className='filter float-l date-picker'>
                <Input placeholder='HH:MM:SS' className='date-picker-time' name='searchTime' value={searchTime} onChange={this.handleFormChange.bind(this)} />
              </div>
              <div className='filter float-l log-btn-apply'>
                <Button onClick={this.apply.bind(this)} type='primary'>Apply</Button>
              </div>
              <div className='filter float-l log-btn-reset'>
                <Button onClick={this.reset.bind(this)}>Reset</Button>
              </div>
            </div>
            <div className='filter_sort p-20 console_log_content'>
              <div className='content-box'>
                <p className='header'><Icon className='header_col_icon' onClick={this.handleAllPanel.bind(this)} type={activeKeys.length > 0 ? 'down' : 'right'} /><span className='header_col_1'>Timestamp</span>
                  <span className='header_col_2'>Message
                    <div className='filter float-r log-btn-reset'>
                      <span>Timezone <Switch checkedChildren='Local' unCheckedChildren='UTC' checked={timezone === 'Local'} onChange={this.changeTimezone.bind(this)} /></span>
                    </div>
                  </span><span className='log-ttl-msg' />
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
          <ConsoleCombinedLogs errorLogTimestamp={errorLogTimestamp} errorLogId={errorLogId} />
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
