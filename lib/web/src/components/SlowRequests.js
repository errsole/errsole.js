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

class SlowRequests extends React.Component {
  render () {
    return (
      <>
        <Result
          icon={<Icon type='bell' />}
          title='This feature is available in Errsole Cloud'
          subTitle='For more detailed information about this feature, please visit the Errsole website.'
          extra={[
            <Button type='primary' key='errsole'>
              <a href='https://www.errsole.com' target='_blank' rel='noopener noreferrer' style={{ textDecoration: 'none', color: 'inherit' }}> Visit Errsole </a>
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
)(withRouter(SlowRequests));
