import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import './SpotTile.css';

const SpotTile = ({ spot }) => {
    console.log(spot)
    const navigate = useNavigate();
    const defaultImage = 'https://placehold.co/600x400?text=No+Image';
    const previewImage = spot?.previewImage || 'default-image-url.jpg';
    
    const imageUrl = spot.previewImage || spot.SpotImages?.[0]?.url || defaultImage;

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
                <p className="spot-location">{spot.city}, {spot.state}</p>
                <div className="rating-price">
                    <span className="rating">
                        <FaStar /> {spot.avgRating ? Number(spot.avgRating).toFixed(1) : 'New'}
                    </span>
                    <p className="spot-price">${spot.price} night</p>
                </div>
            </div>
        </div>
    );
};

export default SpotTile;
