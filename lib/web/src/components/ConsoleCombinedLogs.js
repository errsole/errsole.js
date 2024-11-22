/* imports modules */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import Cookies from 'universal-cookie';
import ReactJson from '@microlink/react-json-view';

/* Ante UI */
import { Layout, Collapse, Dropdown, Button, Spin, notification, Modal, Menu, message } from 'antd';
import { LoadingOutlined, RightOutlined, DownOutlined, MoreOutlined } from '@ant-design/icons';

/* import actions */
import * as logActions from 'actions/logActions.js';
const cookies = new Cookies();
const { Content } = Layout;
const { Panel } = Collapse;

/* mapStateToProps */
const mapStateToProps = (state, ownProps) => {
  return Object.assign({}, ownProps, {
    userId: state.userProfileReducer.get('userId'),
    userProfile: state.userProfileReducer.get('userProfile')
  });
};

const mapDispatchToProps = (dispatch) => ({
  logActions: bindActionCreators(logActions, dispatch)
});

class ConsoleCombinedLogs extends React.Component {
  constructor (props) {
    super(props);
    const errorLogTimestamp = this.props.errorLogTimestamp;
    const errorLogId = this.props.errorLogId;
    const errorLogHostname = this.props.errorLogHostname;
    const timezone = cookies.get('errsole-timezone-preference');

    this.state = {
      errorLogTimestamp,
      errorLogId,
      consoleCombinedLogLoading: false,
      combinedLogs: [],
      timezone,
      errorLogHostname
    };
  }

  componentDidMount () {
    const errorLogTimestamp = this.state.errorLogTimestamp;
    if (errorLogTimestamp) {
      this.getConsoleCombinedLogs({ datetime: errorLogTimestamp, logOrder: 'old' });
    }
  }

  getConsoleCombinedLogs (queryRequest) {
    const self = this;
    const query = {};
    if (queryRequest && queryRequest.logOrder) {
      //
      if (!queryRequest || (queryRequest && !queryRequest.logId)) {
        if (queryRequest && queryRequest.datetime) {
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
      const errorLogHostname = this.state.errorLogHostname;
      if (errorLogHostname) {
        query.hostname = errorLogHostname;
      }
      if (query.lte_timestamp) {
        query.lte_timestamp = new Date(new Date(query.lte_timestamp).getTime() + 1000).toISOString();
      }
      self.setState({
        consoleCombinedLogLoading: true
      });
      this.props.logActions.getConsoleLogs(query, function (err, data) {
        if (!err) {
          try {
            const logs = data.data || [];
            if (logs.length === 0) {
              self.notificationMsg('info', 'No logs to load');
            } else {
              const TotalLogs = self.combineLogs(logs, query.gt_id, query.lt_id);
              self.setState({
                combinedLogs: TotalLogs
              });
              setTimeout(function () {
                if (logs.length > 0 && TotalLogs.length === logs.length) {
                  const element = document.getElementsByClassName('selected_error_log_panel')[0];
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }
              }, 300);
            }
          } catch (e) {
            console.error(e);
            self.notificationMsg();
          }
        } else {
          self.notificationMsg();
        }
        self.setState({
          consoleCombinedLogLoading: false
        });
      });
    } else {
      message.error('Something went wrong');
    }
  }

  combineLogs (newLogs, isGtId, isLtId) {
    const oldLogs = this.state.combinedLogs || [];
    let allLogs;
    if (isGtId) allLogs = oldLogs.concat(newLogs);
    else if (isLtId) allLogs = newLogs.concat(oldLogs);
    else allLogs = newLogs;
    return allLogs;
  }

  sortLogs (latest) {
    const old = this.state.combinedLogs;
    const combined = old.concat(latest);
    const updatedConsoleLogs = combined.filter((value, index, self) => {
      return !self.slice(index + 1).some(item => item.id === value.id);
    });
    updatedConsoleLogs.sort((a, b) => new Date(a.attributes.timestamp) - new Date(b.attributes.timestamp));
    return updatedConsoleLogs;
  }

  notificationMsg (type = 'info', message = 'Something went wrong. Please report the issue using the Help & Support section', description = '') {
    notification[type]({
      message,
      description,
      duration: 7,
      onClick: () => {}
    });
  }

  loadMoreErrors (logOrder) {
    const combinedLogs = this.state.combinedLogs || [];
    if (combinedLogs.length > 0 && logOrder === 'latest') {
      const logId = combinedLogs[combinedLogs.length - 1].id;
      this.getConsoleCombinedLogs({ logOrder, logId });
    }
    if (combinedLogs.length > 0 && logOrder === 'old') {
      const logId = combinedLogs[0].id;
      this.getConsoleCombinedLogs({ logOrder, logId });
    }
  }

  handleAllPanel () {
    const combinedLogs = this.state.combinedLogs || [];
    const activeKeys = this.state.activeKeys || [];
    if (combinedLogs.length > 0 && activeKeys.length === 0) {
      const logIds = combinedLogs.map(log => log.id);
      this.setState({
        activeKeys: logIds
      });
    } else if (combinedLogs.length > 0 && activeKeys.length > 0) {
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
    const consoleCombinedLogLoading = this.state.consoleCombinedLogLoading || false;
    const combinedLogs = this.state.combinedLogs || [];
    const timezone = this.state.timezone || 'Local';
    const activeKeys = this.state.activeKeys || [];
    const errorLogId = this.state.errorLogId || null;
    const activeLogMeta = this.state.activeLogMeta || null;
    const metaModalStatus = this.state.metaModalStatus || false;

    const renderConsoleCombinedLogs = () => {
      return combinedLogs.map((log) => {
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
        const meta = log.attributes.meta || null;
        let occurredAt = log.attributes.timestamp;
        const logId = log.id;

        occurredAt = timezone === 'Local' ? moment(occurredAt).format('YYYY-MM-DD HH:mm:ss Z') : moment.utc(occurredAt).format('YYYY-MM-DD HH:mm:ss Z');

        let header;
        if (level === 'error' || level === 'alert') {
          header = <p className={(source === 'errsole' && 'log_panel_header meta-log') || (source === 'console' && 'log_panel_header')}><span className='log_timestamp'>{occurredAt}</span><span className='log_message_top' style={{ color: '#db4e09' }}>{message}</span></p>;
        } else {
          header = <p className={(source === 'errsole' && 'log_panel_header meta-log') || (source === 'console' && 'log_panel_header')}><span className='log_timestamp'>{occurredAt}</span><span className='log_message_top'>{message}</span></p>;
        }

        let selectedError = false;
        if (errorLogId === logId) {
          selectedError = true;
        }

        const menu = (
          <Menu>
            <Menu.Item key='1' onClick={this.openLogMetaModal.bind(this, logId, meta)}>
              View Meta
            </Menu.Item>
          </Menu>
        );

        const panel = <Panel className={selectedError ? 'log_panel selected_error_log_panel' : 'log_panel'} header={header} key={logId} extra={source === 'errsole' && <span className='view-log-extra' onClick={event => { event.stopPropagation(); }}><Dropdown overlay={menu} className='view-log-details'><Button type='primary'><MoreOutlined /></Button></Dropdown></span>}><pre className='log_message_detail'>{message}</pre><p className='log-details'><b>Hostname: </b>{hostname} &nbsp;&nbsp;|&nbsp;&nbsp; <b>PID: </b>{pid} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Source: </b>{source} &nbsp;&nbsp;|&nbsp;&nbsp; <b>Level: </b>{level}</p></Panel>;

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

    const antIcon = <LoadingOutlined style={{ fontSize: 30 }} spin />;

    return (
      <>
        <Spin indicator={antIcon} spinning={consoleCombinedLogLoading} delay={100}>
          <Content>
            <div className='filter_sort console_log_content'>
              <div className='content-box'><p className='header'>{activeKeys.length > 0 ? (<DownOutlined className='header_col_icon' onClick={this.handleAllPanel.bind(this)} />) : (<RightOutlined className='header_col_icon' onClick={this.handleAllPanel.bind(this)} />)} <span className='header_col_1'>Timestamp</span><span className='header_col_2'>Message</span></p>
                {combinedLogs.length !== 0 &&
                  <Collapse activeKey={activeKeys} onChange={this.handlePanelChange.bind(this)}>
                    <p className='logs_more'>There maybe older logs to load. <a onClick={this.loadMoreErrors.bind(this, 'old')}>Load More</a> </p>
                    {renderConsoleCombinedLogs()}
                    <p className='logs_more'>There maybe newer logs to load. <a onClick={this.loadMoreErrors.bind(this, 'latest')}>Load More</a> </p>
                  </Collapse>}
                {combinedLogs.length === 0 && <div className='ant-empty ant-empty-normal'><div className='ant-empty-image'><svg width='64' height='41' viewBox='0 0 64 41' xmlns='http://www.w3.org/2000/svg'><g transform='translate(0 1)' fill='none' fillRule='evenodd'><ellipse fill='#F5F5F5' cx='32' cy='33' rx='32' ry='7' /><g fillRule='nonzero' stroke='#D9D9D9'><path d='M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z' /><path d='M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z' fill='#FAFAFA' /></g></g></svg></div><p className='ant-empty-description'>No Data</p></div>}
              </div>
            </div>
          </Content>
          <Modal className='view-log-meta-modal' width='90%' centered closable maskClosable footer={null} visible={metaModalStatus} onCancel={this.closeLogMetaModal.bind(this, null)} destroyOnClose>
            <div className='log-meta-div'>{showMeta()}</div>
          </Modal>
        </Spin>
      </>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConsoleCombinedLogs);
