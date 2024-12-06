import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchAllSpotsThunk } from '../../store/spots';
import './SpotsIndex.css';

const SpotsIndex = () => {
  const dispatch = useDispatch();
  // Add this console.log to see what data we're getting
  const allSpots = useSelector((state) => {
    console.log('Redux spots state:', state.spots.allSpots);
    return state.spots.allSpots;
  });

  useEffect(() => {
    dispatch(fetchAllSpotsThunk());
  }, [dispatch]);

  return (
    <div className="spots-grid">
      {Object.values(allSpots).map((spot) => (
        <div className="spot-tile" key={spot.id}>
          <img src={spot.previewImage} alt={spot.name} />
          <div className="spot-details">
            <div className="location-price">
              <div className="spot-location">{spot.city}, {spot.state}</div>
              <div className="spot-price">${spot.price} night</div>
            </div>
            <div className="spot-rating">
              <i className="fas fa-star"></i>
              {spot.avgRating || 'New'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpotsIndex;