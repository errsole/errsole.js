import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Result, Button, Icon } from 'antd';

/* mapStateToProps */
const mapStateToProps = (state) => ({
});

/* mapDispatchToProps */
const mapDispatchToProps = (dispatch) => ({
});

class Errors extends React.Component {
  render () {
    return (
      <>
        <Result
          icon={<Icon type='notification' />}
          title='Currently, this feature is available in Errsole Cloud'
          subTitle='This feature is coming soon to our open source community!'
          extra={[
            <Button type='primary' key='errsole'>
              <a href='https://www.errsole.com' target='_blank' rel='noopener noreferrer' style={{ textDecoration: 'none', color: 'inherit' }}> Learn More at Errsole Cloud </a>
            </Button>
          ]}
        />
      </>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Errors));
