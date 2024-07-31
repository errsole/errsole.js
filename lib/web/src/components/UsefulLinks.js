import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

/* Ante UI */
import { Layout, Divider, Row, Col, List } from 'antd';

const { Content } = Layout;

/* Component Class */
class UsefulLinks extends React.Component {
  constructor (props) {
    super(props);
    this.state = { };
  }

  render () {
    return (
      <>
        <Row>
          <Col span={20} offset={2}>
            <Content className='all-users'>
              <Content className='setting-user'>
                <h1>Useful Links</h1>
                <Divider />
                <List itemLayout='horizontal'>
                  <List.Item>
                    <span><span>•</span> <a href='https://example.com/faqs' target='_blank' rel='noopener noreferrer'>FAQs</a></span>
                  </List.Item>
                  <List.Item>
                    <span><span>•</span> <b>Encountering issues?</b> <a href='https://example.com/issues' target='_blank' rel='noopener noreferrer'>Open an issue</a> on our GitHub repository.</span>
                  </List.Item>
                  <List.Item>
                    <span><span>•</span> <b>Have questions?</b> Use our <a href='https://example.com/qna' target='_blank' rel='noopener noreferrer'>Q&A forum</a>.</span>
                  </List.Item>
                  <List.Item>
                    <span><span>•</span> <b>Want to request a feature or share your ideas?</b> Use our <a href='https://example.com/discussion' target='_blank' rel='noopener noreferrer'>discussion forum</a>.</span>
                  </List.Item>
                  <List.Item>
                    <span><span>•</span> <b>Want to contribute?</b> First, share your idea with the community in our <a href='https://example.com/contribute' target='_blank' rel='noopener noreferrer'>discussion forum</a> to see what others are saying. Then, fork the repository, make your changes, and submit a pull request.</span>
                  </List.Item>
                </List>
              </Content>
            </Content>
          </Col>
        </Row>
      </>
    );
  }
}

export default connect()(withRouter(UsefulLinks));
