import './SpotTile.css';

const SpotTile = ({ spot }) => {
  return (
    <div className="spot-tile" title={spot.name}>
      <img src={spot.previewImage} alt={spot.name} className="spot-thumbnail" />
      <div className="Spot-info">
        <p className="spot-location">
          {spot.city}, {spot.state}
        </p>
        <p className="spot-price">${spot.price} night</p>
      </div>
    </div>
  );
};

export default SpotTile;