import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchAllSpotsThunk } from '../../store/spots';
import './SpotsIndex.css';

const SpotsIndex = () => {
  const dispatch = useDispatch();
  const allSpots = useSelector((state) => state.spots.allSpots);

  useEffect(() => {
    dispatch(fetchAllSpotsThunk());
  }, [dispatch]);

  return (
    <div className="spots-grid">
      {Object.values(allSpots).map((spot) => (
        <div key={spot.id} className="Spot-tile">
          <img src={spot.previewImage} alt={spot.name} />
          <div className="spot-info">
            <h2>{spot.name}</h2>
            <p>
              {spot.city}, {spot.state}
            </p>
            <p>${spot.price} night</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpotsIndex;
