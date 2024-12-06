import { FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './SpotTile.css';

const SpotTile = ({ spot }) => {
  const navigate = useNavigate();
  const defaultImage = 'https://placehold.co/600x400?text=No+Image';

  const imageUrl =
    spot.previewImage || spot.SpotImages?.[0]?.url || defaultImage;
  console.log(imageUrl);

  return (
    <div className="spot-tile" onClick={() => navigate(`/spots/${spot.id}`)}>
      <img
        src={imageUrl}
        alt={spot.name}
        className="spot-thumbnail"
        onError={(e) => {
          console.log('Image load error:', e);
          e.target.src = defaultImage;
        }}
      />
      <div className="spot-info">
        <p className="spot-location">
          {spot.city}, {spot.state}
        </p>
        <div className="rating-price">
          <span className="rating">
            <FaStar />{' '}
            {spot.avgRating ? Number(spot.avgRating).toFixed(1) : 'New'}
          </span>
          <p className="spot-price">${spot.price} night</p>
        </div>
      </div>
    </div>
  );
};

export default SpotTile;
