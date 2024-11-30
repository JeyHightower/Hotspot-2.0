import './SpotDetails.css';

const SpotDetails = ({ spot }) => {
  const {
    id,
    name,
    description,
    price,
    city,
    state,
    country,
    Owner,
    SpotImages,
  } = spot;

  const isComingSoon = () => {
    alert('Feature Coming Soon!');
  }

  return (
    <div className="spot-details">
      <div className="spot-details-container">
        <h1>{name}</h1>
        <div className="spot-location">
          {city}, {state}, {country}
        </div>
        <div className-="spot-images-grid">
          <div className="main-imagee">
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
            <div classNme = "host-description">
                <h2>Hosted by{Owner?.firstName} {Owner?.lastName}</h2>
                <p>{description}</p>
        </div>
        <div className='callout-box'>
            <div className='price-info'>
                <span className='price'>${price}</ span> night</div>'
            </div>
            <button className='reserve-button' onClick={isComingSoon}>Reserve</button>
        </div>
      </div>
    </div>
  );
};

export default SpotDetails;