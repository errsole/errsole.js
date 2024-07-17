import Immutable from 'immutable';

const initialState = Immutable.Map({
  currentConsoleLogs: []
});

function appReducer (state = initialState, action) {
  switch (action.type) {
    case 'ADD_CONSOLE_LOGS': {
      const logs = action.logs;
      state = state.set('currentConsoleLogs', logs);
      break;
    }
    case 'CLEAR_CONSOLE_LOGS': {
      state = state.set('currentConsoleLogs', []);
      break;
    }
    case 'RESET_USER_STATE': {
      state = initialState;
      break;
    }
  }
  return state;
}

export default appReducer;
