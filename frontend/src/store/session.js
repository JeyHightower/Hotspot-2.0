import { csrfFetch, restoreCSRF } from './csrf';

//!ACTION TYPES:
const SET_SESSION_USER = 'session/setSessionUser';
const REMOVE_SESSION_USER = 'session/removeSessionUser';

//!ACTION CREATORS:
const setSessionUser = (user) => {
  return {
    type: SET_SESSION_USER,
    payload: user,
  };
};

const removeSessionUser = () => {
  return {
    type: REMOVE_SESSION_USER,
  };
};

//!THUNK ACTIONS:
export const loginThunk = (user) => async (dispatch) => {
  await restoreCSRF();

  const { credential, password } = user;

  const response = await csrfFetch('/api/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      credential,
      password,
    }),
  });

  const data = await response.json();
  dispatch(setSessionUser(data.user));
  return response;
};

export const restoreUserThunk = () => async (dispatch) => {
  const response = await csrfFetch('/api/session');
  const data = await response.json();
  dispatch(setSessionUser(data.user));
  return response;
};

export const signupThunk = (user) => async (dispatch) => {
  const { username, firstName, lastName, email, password } = user;
  const response = await csrfFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({
      username,
      firstName,
      lastName,
      email,
      password,
    }),
  });
  const data = await response.json();
  dispatch(setSessionUser(data.user));
  return response;
};

export const logoutThunk = () => async (dispatch) => {
  const response = await csrfFetch('/api/session', {
    method: 'DELETE',
  });
  dispatch(removeSessionUser());
  return response;
};

//!INITIAL STATE:
const initialState = {
  user: null,
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

  return handler ? handler(state, action) : state;
};

export default sessionReducer;
