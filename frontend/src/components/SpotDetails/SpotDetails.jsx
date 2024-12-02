import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSingleSpotThunk } from '../../store/spots';
import OpenModalButton  from '../OpenModalButton/OpenModalButton';
import ReviewFormModal from '../ReviewFormModal/ReviewFormModal';
import { deleteReviewThunk } from '../../store/reviews';
import DeleteConfirmModal from '../DeleteConfirmModal/DeleteConfirmModal';
import './SpotDetails.css';

const SpotDetails = () => {
  const { spotId } = useParams();
  const dispatch = useDispatch();
  const spot = useSelector((state) => state.spots.singleSpot);
  const user = useSelector((state) => state.session.user);
  const hasReviewed = spot?.Reviews?.some(
    (review) => review.userId === user?.id,
  );
  const Owner = spot?.Owner;
  const reviews = spot?.Reviews || [];

  useEffect(() => {
    dispatch(fetchSingleSpotThunk(spotId));
  }, [dispatch, spotId]);

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

  const isComingSoon = () => {
    alert('Feature Coming Soon!');
  };

  const ratingDisplay = !numReviews ? 'New' : Number(avgRating).toFixed(2);
  const reviewText = numReviews === 1 ? 'Review' : 'Reviews';
  const canReview = user && !hasReviewed && user.id !== Owner?.id;

  const formatReviewDate = (date) => {
    const options = { month: 'long', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  const reviewSummary = () => {
    if (!numReviews) return 'New';
    return (
      <>
        {Number(avgRating).toFixed(1)} · {numReviews}{' '}
        {numReviews === 1 ? 'Review' : 'Reviews'}
      </>
    );
  };

  const handleDeleteReview = (reviewId) => async () => {
    await dispatch(deleteReviewThunk(reviewId));
    dispatch(fetchSingleSpotThunk(spotId));
  };

  return (
    <div className="spot-details">
      <div className="spot-details-container">
        <h1>{name}</h1>
        <div className="spot-location">
          {city}, {state}, {country}
        </div>
        <div className="spot-images-grid">
          <div className="main-images">
            {SpotImages && SpotImages[0] && (
              <img src={SpotImages[0].url} alt="Main spot view" />
            )}
          </div>
          <div className="small-images">
            {SpotImages &&
              SpotImages.slice(1, 5).map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`Spot view ${index + 2}`}
                />
              ))}
          </div>
        </div>
        <div className="spot-info-container">
          <div className="host-description">
            <h2>
              Hosted by {Owner?.firstName} {Owner?.lastName}
            </h2>
            <p>{description}</p>
          </div>

          <div className="callout-box">
            <div className="price-review-summary">
              <div className="price-line">
                <span className="price">${price}</span> night
              </div>
              <div className="rating-line">
                <i className="fas fa-star"></i>
                {reviewSummary()}
              </div>
            </div>
            <div className="rating-display">
              <i className="fas fa-star"></i>
              {ratingDisplay}
            </div>
          </div>
          <div className="price-review-summary">
            <div className="price-line">
              <span className="price">${price}</span> night
            </div>
            <div className="rating-line">
              <i className="fas fa-star"></i>
              {ratingDisplay} · {numReviews} {reviewText}
            </div>
          </div>
          <button onClick={isComingSoon}>Reserve</button>
        </div>
      </div>

      <div className="reviews-section">
        <h2 className="reviews-header">
          <i className="fas fa-star"></i> {reviewSummary()}
        </h2>
        
        {canReview && (
          <OpenModalButton
            buttonText="Post Your Review"
            modalComponent={
              <ReviewFormModal 
                spotId={spotId}
                onReviewSubmit={() => {
                  dispatch(fetchSingleSpotThunk(spotId));
                }}
              />
            }
          />
        )}
        
        {reviews?.length > 0 ? (
          <div className="reviews-list">
            {reviews
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map(review => (
                <div key={review.id} className="review-item">
                  <h3>{review.User.firstName}</h3>
                  <div className="review-date">
                    {formatReviewDate(review.createdAt)}
                  </div>
                  <p>{review.review}</p>
                  {user?.id === review.userId && (
                    <OpenModalButton
                      buttonText="Delete"
                      modalComponent={
                        <DeleteConfirmModal
                          onDelete={handleDeleteReview(review.id)}
                          type="Review"
                        />
                      }
                    />
                  )}
                </div>
              ))}
          </div>
        ) : (
          user && user.id !== Owner?.id && <p>Be the first to post a review!</p>
        )}
      </div>
    </div>
  );
};

export default SpotDetails;