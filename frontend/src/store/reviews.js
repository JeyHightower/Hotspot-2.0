
import { csrfFetch } from './csrf';

const CREATE_REVIEW = 'reviews/createReview';
const DELETE_REVIEW = 'reviews/deleteReview';

const createReview = (review) => ({
  type: CREATE_REVIEW,
  review
});

const deleteReview = (reviewId) => ({
  type: DELETE_REVIEW,
  reviewId
});

export const createReviewThunk = (reviewData) => async dispatch => {
  const response = await csrfFetch(`/api/spots/${reviewData.spotId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(reviewData)
  });
  const review = await response.json();
  dispatch(createReview(review));
  return review;
};

export const deleteReviewThunk = (reviewId) => async dispatch => {
  await csrfFetch(`/api/reviews/${reviewId}`, {
    method: 'DELETE'
  });
  dispatch(deleteReview(reviewId));
};

const initialState = {
  spot: {},
  user: {}
};

const reviewsReducer = (state = initialState, action) => {
  const handlers = {
    [CREATE_REVIEW]: (state, action) => ({
      ...state,
      spot: {
        ...state.spot,
        [action.review.spotId]: {
          ...state.spot[action.review.spotId],
          [action.review.id]: action.review
        }
      }
    }),
    [DELETE_REVIEW]: (state, action) => {
      const newState = { ...state };
      delete newState.spot[action.reviewId];
      return newState;
    }
  };
  const handler = handlers[action.type];
  return handler ? handler(state, action) : state;
};

export default reviewsReducer;
