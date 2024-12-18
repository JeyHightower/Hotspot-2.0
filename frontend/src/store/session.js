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
  try {
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Login failed with status: ${response.status}`);
    }

    const data = await response.json();
    dispatch(setSessionUser(data.user));
    return response;
  } catch (error) {
    console.error('Login user error:', error);
    throw new Error(error.message || 'Failed to log in. Please check your credentials.');
  }
};


export const restoreUserThunk = () => async (dispatch) => {
  try {
    const response = await csrfFetch('/api/session');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    dispatch(setSessionUser(data.user));
    return response;
  } catch (error) {
    console.error('Restore user error:', error);
    throw error;
  }
};

export const signupThunk = (user) => async (dispatch) => {
  try {
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
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Response not ok:', text);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    dispatch(setSessionUser(data.user));
    return response;
  } catch (error) {
    console.error('Signup user error:', error);
    throw error; // Rethrow the error after logging it
  }
};

export const logoutThunk = () => async (dispatch) => {
  try {
    const response = await csrfFetch('/api/session', {
      method: 'DELETE',
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Response not ok:', text);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    dispatch(removeSessionUser());
    return response;
  } catch (error) {
    console.error('Logout user error:', error);
    throw error;
  }
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
