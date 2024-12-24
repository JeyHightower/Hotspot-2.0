import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchAllSpotsThunk } from "../../store/spots";
import "./SpotsIndex.css";

const SpotsIndex = () => {
  const dispatch = useDispatch();
  const spots = useSelector((state) => state.spots.allSpots);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSpots = async () => {
      setIsLoading(true);
      try {
        const result = await dispatch(fetchAllSpotsThunk());
        if (!result) throw new Error("Failed to load spots");
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadSpots();
  }, [dispatch]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  console.log('Full spots data:', spots);
  console.log('Raw API response:', spots);


  return (
    <div className="spots-grid">
      {Object.values(spots).map((spot) => (
        <Link to={`/spots/${spot.id}`} key={spot.id} className="spot-link">
          <div className="spot-tile">
            <img
              src={spot.previewImage || null}
              alt={spot.name}
              className="spot-image"
            />
            <div className="spot-details">
              <div className="location-price">
                <div className="spot-location">
                  {spot.city}, {spot.state}
                </div>
                <div className="spot-rating">
                  <i className="fas fa-star"></i>
                  {spot.avgRating ? spot.avgRating.toFixed(1) : "New"}
                </div>
                <div className="spot-price">${spot.price} night</div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SpotsIndex;
