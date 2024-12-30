import { csrfFetch } from "./csrf";

const CREATE_REVIEW = "reviews/createReview";
const DELETE_REVIEW = "reviews/deleteReview";

const createReview = (review) => ({
  type: CREATE_REVIEW,
  review,
});

const deleteReview = (reviewId) => ({
  type: DELETE_REVIEW,
  reviewId,
});

export const createReviewThunk = (reviewData) => async (dispatch) => {
  try {
    const response = await csrfFetch(
      `/api/spots/${reviewData.spotId}/reviews`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          review: reviewData.review,
          stars: Number(reviewData.stars),
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.log("Error response:", errorData); // Debug log
      throw new Error(errorData.message || "Failed to create review");
    }

    const review = await response.json();
    dispatch(createReview(review));
    return review;
  } catch (error) {
    console.error("Create review error:", error.message);
    throw error;
  }
};

export const deleteReviewThunk = (reviewId) => async (dispatch) => {
  await csrfFetch(`/api/reviews/${reviewId}`, {
    method: "DELETE",
  });
  dispatch(deleteReview(reviewId));
};

const initialState = {
  spot: {},
  user: {},
};

const reviewsReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_REVIEW:
      return {
        ...state,
        spot: {
          ...state.spot,
          [action.review.spotId]: {
            ...(state.spot[action.review.spotId] || {}),
            [action.review.id]: action.review,
          },
        },
      };
    case DELETE_REVIEW:
      const newState = { ...state };
      delete newState.spot[action.reviewId];
      return newState;
    default:
      return state;
  }
};

export default reviewsReducer;
