import { csrfFetch } from "./csrf";

//!ACTION TYPES:
const GET_ALL_SPOTS = "spots/getAllSpots";
const GET_SINGLE_SPOT = "spots/getSingleSpot";
const CREATE_SPOT = "spots/createSpot";
const DELETE_SPOT = "spots/deleteSpot";
// const UPDATE_SPOT = 'spots/updateSpot';

//!ACTION CREATORS:
const getAllSpots = (spots) => ({
  type: GET_ALL_SPOTS,
  spots,
});

const getSingleSpot = (spot) => ({
  type: GET_SINGLE_SPOT,
  spot,
});

const createSpot = (spot) => ({
  type: CREATE_SPOT,
  spot,
});

const deleteSpot = (spotId) => ({
  type: DELETE_SPOT,
  spotId,
});

// const updateSpot = (spotId) => ({
//   type: UPDATE_SPOT,
//   spotId,
// });

//!THUNK ACTIONS:
export const fetchAllSpotsThunk = () => async (dispatch) => {
  try {
    const response = await csrfFetch("/api/spots");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const spots = await response.json();
    console.log("Raw spots data:", spots); // Add this line
    dispatch(getAllSpots(spots));
    return spots;
  } catch (error) {
    console.error("Error fetching spots:", error);
    return null;
  }
};

export const fetchSingleSpotThunk = (spotId) => async (dispatch) => {
  if (!spotId) return;
  try {
    const response = await csrfFetch(`/api/spots/${spotId}`);
    const spot = await response.json();
    dispatch(getSingleSpot(spot));
    return spot;
  } catch (error) {
    console.error("Error fetching spot:", error);
    return null;
  }
};

export const updateSpotThunk = (spotId, spotData) => async (dispatch) => {
  try {
    // Add default lat/lng if not provided
    const dataToSend = {
      ...spotData,
      lat: spotData.lat || 0,
      lng: spotData.lng || 0,
    };

    const response = await csrfFetch(`/api/spots/${spotId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    });

    if (response.ok) {
      const spot = await response.json();
      dispatch(getSingleSpot(spot));
      return spot;
    }
  } catch (error) {
    throw error;
  }
};

export const createSpotThunk = (spotData) => async (dispatch) => {
  const response = await csrfFetch("/api/spots", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(spotData),
  });

  const newSpot = await response.json();
  dispatch(createSpot(newSpot));
  return newSpot;
};

export const deleteSpotThunk = (spotId) => async (dispatch) => {
  const response = await csrfFetch(`/api/spots/${spotId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    dispatch(deleteSpot(spotId));
    return true;
  }
};

export const fetchUserSpotsThunk = () => async (dispatch) => {
  try {
    const response = await csrfFetch("/api/spots/current"); // Correct endpoint
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const spots = await response.json();
    dispatch(getAllSpots(spots));
    return spots;
  } catch (error) {
    console.error("Error fetching spots:", error);
    return null;
  }
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
      const spots = action.spots.Spots;
      if (spots) {
        spots.forEach((spot) => {
          newAllSpots[spot.id] = {
            ...spot,
            previewImage: spot.previewImage || spot.images?.[0]?.url || null,
          };
        });
      }
      return {
        ...state,
        allSpots: newAllSpots,
      };
    },
    [GET_SINGLE_SPOT]: (state, action) => ({
      ...state,
      singleSpot: action.spot,
    }),
    [CREATE_SPOT]: (state, action) => ({
      ...state,
      allSpots: {
        ...state.allSpots,
        [action.spot.id]: action.spot,
      },
    }),
    [DELETE_SPOT]: (state, action) => {
      const newAllSpots = { ...state.allSpots };
      delete newAllSpots[action.spotId];
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
