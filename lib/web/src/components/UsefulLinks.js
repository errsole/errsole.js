import React from 'react';
import { connect } from 'react-redux';
import withRouter from '../hoc/WithRouter';

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
            <Content className='all-useful-links'>
              <Content>
                <h1>Useful Links</h1>
                <Divider />
                <List itemLayout='horizontal'>
                  <List.Item>
                    <ul>
                      <li>
                        <a href='https://github.com/errsole/errsole.js/discussions/categories/faqs' target='_blank' rel='noopener noreferrer'>FAQs</a>
                      </li>
                    </ul>
                  </List.Item>
                  <List.Item>
                    <ul>
                      <li>
                        <b>Encountering issues?</b> <a href='https://github.com/errsole/errsole.js/issues/new' target='_blank' rel='noopener noreferrer'>Open an issue</a> on our GitHub repository.
                      </li>
                    </ul>
                  </List.Item>
                  <List.Item>
                    <ul>
                      <li>
                        <b>Have questions?</b> Use our <a href='https://github.com/errsole/errsole.js/discussions/categories/q-a' target='_blank' rel='noopener noreferrer'>Q&A forum</a>.
                      </li>
                    </ul>
                  </List.Item>
                  <List.Item>
                    <ul>
                      <li>
                        <b>Want to request a feature or share your ideas?</b> Use our <a href='https://github.com/errsole/errsole.js/discussions/categories/general' target='_blank' rel='noopener noreferrer'>discussion forum</a>.
                      </li>
                    </ul>
                  </List.Item>
                  <List.Item>
                    <ul>
                      <li>
                        <b>Want to contribute?</b> First, share your idea with the community in our <a href='https://github.com/errsole/errsole.js/discussions/categories/general' target='_blank' rel='noopener noreferrer'>discussion forum</a> to see what others are saying. Then, fork the repository, make your changes, and submit a pull request.
                      </li>
                    </ul>
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
