import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchAllSpotsThunk } from '../../store/spots';
import SpotTile from '../SpotTile/SpotTile';
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
       <SpotTile key={spot.id} spot={spot} />
      ))}
    </div>
  );
};

export default SpotsIndex;
