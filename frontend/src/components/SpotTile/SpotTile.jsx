import { FaStar } from 'react-icons/fa';
import './SpotTile.css';

const SpotTile = ({ spot }) => {
    //define a variable to hold the average rating
    const rating = spot.avgRating ? Number(spot.avgRating).toFixed(1) : 'New';
  return (
    <div className="spot-tile" title={spot.name}>
      <img src={spot.previewImage} alt={spot.name} className="spot-thumbnail" />
      <div className="Spot-info">
        <p className="spot-location">
          {spot.city}, {spot.state}
        </p>
        <div className='rating-price'>
            <span className='rating'>
                <FaStar /> {rating}
            </span>
            <p className="spot-price">${spot.price} night</p>
        </div>
        
      </div>
    </div>
  );
};

export default SpotTile;