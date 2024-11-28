import { csrfFetch } from './csrf';

//!ACTION TYPES:
const GET_ALL_SPOTS = 'spots/getAllSpots';

//!ACTION CREATORS:
const getAllSpots = (spots) => {
  return {
    type: GET_ALL_SPOTS,
    spots,
  };
};

//!THUNK ACTIONS:
export const fetchAllSpotsThunk = () => async (dispatch) => {
  const response = await csrfFetch('/api/spots');
  const spots = await response.json();
  dispatch(getAllSpots(spots));
  return spots;
};

//!INITIAL STATE:
const initialState = {
  allSpots: {},
  singleSpot: {},
};

//!REDUCERS:
const spotsReducer = (state = initialState, action) => {
  const handlers = {
    [GET_ALL_SPOTS]: (state, action) => {
      const newAllSpots = {};
      action.spots.forEach((spot) => {
        newAllSpots[spot.id] = spot;
      });
      return {
        ...state,
        allSpots: newAllSpots,
      };
    },
  };
  const handler = handlers[action.type];
  return handler ? handler(state, action) : state;
};

export default spotsReducer;
