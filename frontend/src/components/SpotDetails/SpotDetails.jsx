import { useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { deleteReviewThunk } from "../../store/reviews";
import { fetchSingleSpotThunk } from "../../store/spots";
import "./SpotDetails.css";

const SpotDetails = () => {
  const { spotId } = useParams();
  const dispatch = useDispatch();

  const spot = useSelector((state) => state.spots.singleSpot);
  const user = useSelector((state) => state.session.user);

  const hasReviewed = spot?.Reviews?.some(
    (review) => review.userId === user?.id
  );
  const Owner = spot?.Owner;
  const reviews = spot?.Reviews || [];

  useEffect(() => {
    dispatch(fetchSingleSpotThunk(spotId));
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
    return (
      <>
        <FaStar className="star-filled" />
        {Number(avgRating).toFixed(1)} · {numReviews}{" "}
        {numReviews === 1 ? "Review" : "Reviews"}
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
    </div>
  );
};

export default SpotDetails;
