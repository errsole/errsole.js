import { combineReducers } from 'redux';

import appReducer from 'reducers/appReducer';
import userProfileReducer from 'reducers/userProfileReducer';

export default combineReducers({
  appReducer,
  userProfileReducer
});
