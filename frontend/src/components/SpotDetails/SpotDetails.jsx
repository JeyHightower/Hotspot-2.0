import { useEffect } from "react";
import { FaStar, FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { deleteReviewThunk } from "../../store/reviews";
import { fetchSingleSpotThunk } from "../../store/spots";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import ReviewFormModal from "../ReviewFormModal/ReviewFormModal";
import "./SpotDetails.css";

const SpotDetails = () => {
  const { spotId } = useParams();
  const dispatch = useDispatch();

  const spot = useSelector((state) => state.spots.singleSpot);
  const user = useSelector((state) => state.session.user);

  const hasReviewed = spot?.Reviews?.some(
    (review) => review.userId === user?.id
  );
  const isOwner = spot?.ownerId === user?.id;
  const canPostReview = user && !hasReviewed && !isOwner;

  const Owner = spot?.Owner;
  const reviews = spot?.Reviews || [];
  console.log("Reviews:", reviews);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchSingleSpotThunk(spotId));
      console.log("Spot data:", spot);
    };
    fetchData();
  }, [dispatch, spotId]);

  const isComingSoon = () => {
    alert("Feature coming soon");
  };

  if (!spot || !spot.id) return <div>Loading...</div>;

  const {
    name,
    description,
    price,
    city,
    state,
    country,
    SpotImages,
    avgRating,
    numReviews,
  } = spot;

  const reviewSummary = () => {
    if (!numReviews) return "New";
    const rating = avgRating ? parseFloat(avgRating).toFixed(1) : "New";
    return (
      <>
        <FaStar className="star-filled" />
        {rating} · {numReviews} {numReviews === 1 ? "Review" : "Reviews"}
      </>
    );
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await dispatch(deleteReviewThunk(reviewId));
      await dispatch(fetchSingleSpotThunk(spotId));
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  // Sort reviews to show newest first
  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="spot-details">
      <div className="spot-details-container">
        <h1 className="spot-name">{name}</h1>
        <p className="spot-location">
          {city}, {state}, {country}
        </p>

        <div className="spot-images-grid">
          <div className="main-image">
            {SpotImages?.[0] && <img src={SpotImages[0].url} alt="Main view" />}
          </div>
          <div className="secondary-images">
            {SpotImages?.slice(1, 5).map((image, index) => (
              <div key={index} className="small-image">
                <img src={image.url} alt={`View ${index + 2}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="content-wrapper">
          <div className="host-info">
            <h2>
              Hosted by {Owner?.firstName} {Owner?.lastName}
            </h2>
            <p className="description">{description}</p>
          </div>

          <div className="callout-box">
            <div className="price-rating">
              <span className="price">
                <span className="amount">${price}</span> night
              </span>
              <span className="rating">{reviewSummary()}</span>
            </div>
            <button className="reserve-button" onClick={isComingSoon}>
              Reserve
            </button>
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <h2>
          <FaStar className="star-filled" />
          {avgRating ? `${Number(avgRating).toFixed(1)} · ` : "New · "}
          {numReviews} {numReviews === 1 ? "Review" : "Reviews"}
        </h2>

        {canPostReview && (
          <OpenModalButton
            buttonText="Post Your Review"
            modalComponent={
              <ReviewFormModal
                spotId={spotId}
                onReviewSubmit={() => {
                  console.log("Review submitted, refreshing data...");
                  return dispatch(fetchSingleSpotThunk(spotId));
                }}
              />
            }
          />
        )}

        <div className="reviews-list">
          {sortedReviews.length > 0 ? (
            sortedReviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <h3>{review.User?.firstName}</h3>
                  <span className="review-date">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <div className="review-stars">
                  {[...Array(review.stars)].map((_, i) => (
                    <FaStar key={i} className="star-filled" />
                  ))}
                </div>
                <p className="review-text">{review.review}</p>
                {user?.id === review.userId && (
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="delete-review-button"
                  >
                    <FaTrash /> Delete Review
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>No reviews yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotDetails;
