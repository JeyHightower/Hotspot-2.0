import { csrfFetch } from './csrf';

//!ACTION TYPES:
const GET_ALL_SPOTS = 'spots/getAllSpots';
const GET_SINGLE_SPOT = 'spots/getSingleSpot';
const CREATE_SPOT = 'spots/createSpot';

//!ACTION CREATORS:
const getAllSpots = (spots) => {
  return {
    type: GET_ALL_SPOTS,
    spots,
  };
};

const getSingleSpot = (spot) => {
  return {
    type: GET_SINGLE_SPOT,
    spot,
  };
};

const createSpot = (spot) => ({
  type: CREATE_SPOT,
  spot,
});

//!THUNK ACTIONS:
export const fetchAllSpotsThunk = () => async (dispatch) => {
  const response = await csrfFetch('/api/spots');
  const spots = await response.json();
  dispatch(getAllSpots(spots));
  return spots;
};

export const fetchSingleSpotThunk = (spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}`);
  const spot = await response.json();
  dispatch(getSingleSpot(spot));
  return spot;
};

export const generateRandomSpotsThunk = (count) => async (dispatch) => {
  const response = await csrfFetch('/api/spots/generate-random', {
    method: 'POST',
    body: JSON.stringify({ count }),
  });
  const data = await response.json();
  dispatch(fetchAllSpotsThunk()); // Refresh the spots list
  return data;
};

export const createSpotThunk = (spotData) => async (dispatch) => {
  const response = await csrfFetch('/api/spots', {
    method: 'POST',
    body: JSON.stringify(spotData),
  });

  const newSpot = await response.json();
  dispatch(createSpot(newSpot));
  return newSpot;
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
      action.spots.Spots.forEach((spot) => {
        newAllSpots[spot.id] = spot;
      });
      return {
        ...state,
        allSpots: newAllSpots,
      };
    },
    [GET_SINGLE_SPOT]: (state, action) => {
      return {
        ...state,
        singleSpot: action.spot,
      };
    },
    [CREATE_SPOT]: (state, action) => {
      return {
        ...state,
        allSpots: {
          ...state.allSpots,
          [action.spot.id]: action.spot,
        },
      };
    },
  };
  const handler = handlers[action.type];
  return handler ? handler(state, action) : state;
};

export default spotsReducer;
