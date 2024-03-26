import Immutable from 'immutable';

const initialState = Immutable.Map({
  isUserLoggedIn: false,
  userId: null,
  userProfile: {}
});

function userProfileReducer (state = initialState, action) {
  switch (action.type) {
    case 'GET_USER_PROFILE_SUCCESS': {
      const userDetails = action.userData;
      state = state.set('isUserLoggedIn', true);
      state = state.set('userId', userDetails.id);
      state = state.set('userProfile', userDetails.attributes);
      break;
    }
    case 'UPDATE_USER_PROFILE_SUCCESS': {
      const userData = action.userData;
      state = state.set('userProfile', userData.attributes);
      break;
    }
    case 'RESET_USER_STATE': {
      state = initialState;
      break;
    }
  }
  return state;
}

export default userProfileReducer;
