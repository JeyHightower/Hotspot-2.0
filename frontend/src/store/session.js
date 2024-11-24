import { csrfFetch } from './csrf';

//!ACTION TYPES:
const SET_SESSION_USER = 'session/setSessionUser';
const REMOVE_SESSION_USER = 'session/removeSessionUser';

//!ACTION CREATORS:
const setSessionUser = (user) => {
  return {
    type: SET_SESSION_USER,
    payload: user
  };
};

const removeSessionUser = () => {
  return {
    type: REMOVE_SESSION_USER,
  };
};

//!THUNK ACTIONS:
export const loginThunk = (user) => async (dispatch) => {
  const { credential, password } = user;
  const response = await csrfFetch("/api/session", {
    method: "POST",
    body: JSON.stringify({
      credential,
      password,
    })
  });
  const data = await response.json();
  dispatch(setSessionUser(data.user));
  return response;
};

export const restoreUserThunk = () => async (dispatch) => {
  const response = await csrfFetch("/api/session");
  const data = await response.json();
  dispatch(setSessionUser(data.user));
  return response;
};

//!INITIAL STATE:
const initialState = {
  user: null
};

//!REDUCERS:
const sessionReducer = (state = initialState, action) => {
  const handlers = {
    [SET_SESSION_USER]: (state, action) => ({
      ...state,
      user: action.payload,
    }),
    [REMOVE_SESSION_USER]: (state) => ({
      ...state,
      user: null,
    }),
  };
  const handler = handlers[action.type];

  //?return new state or current state;
  return handler ? handler(state, action) : state;
};

export default sessionReducer;
