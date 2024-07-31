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
    const data = [
      {
        text: 'FAQs',
        linkText: 'FAQs',
        link: 'https://github.com/errsole/errsole.js/discussions/categories/faqs'
      },
      {
        text: 'Encountering issues? Open an issue on our GitHub repository.',
        linkText: 'Open an issue',
        link: 'https://github.com/errsole/errsole.js/issues/new'
      },
      {
        text: 'Have questions? Use our Q&A forum.',
        linkText: 'Q&A forum',
        link: 'https://github.com/errsole/errsole.js/discussions/categories/q-a'
      },
      {
        text: 'Want to request a feature or share your ideas? Use our discussion forum.',
        linkText: 'discussion forum',
        link: 'https://github.com/errsole/errsole.js/discussions/categories/general'
      },
      {
        text: 'Want to contribute? First, share your idea with the community in our discussion forum to see what others are saying. Then, fork the repository, make your changes, and submit a pull request.',
        linkText: 'discussion forum',
        link: 'https://github.com/errsole/errsole.js/discussions/categories/general'
      }
    ];

    return (
      <>
        <Row>
          <Col span={20} offset={2}>
            <Content className='all-users'>
              <Content className='setting-user'>
                <h1>Useful Links</h1>
                <Divider />
                <List itemLayout='horizontal' dataSource={data} renderItem={item => (<List.Item> <span>•</span> <span> {item.text.split(item.linkText).map((part, index, array) => (<span key={index}> {part} {index < array.length - 1 && (<a href={item.link} target='_blank' rel='noreferrer'>{item.linkText}</a>)} </span>))} </span> </List.Item>)} />
              </Content>
            </Content>
          </Col>
        </Row>
      </>
    );
  }
}

export default connect()(withRouter(UsefulLinks));
