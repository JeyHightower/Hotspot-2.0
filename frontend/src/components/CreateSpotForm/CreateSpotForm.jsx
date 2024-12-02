import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createSpotThunk } from '../../store/spots';
import './CreateSpotForm.css';

const CreateSpotForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    country: '',
    address: '',
    city: '',
    state: '',
    description: '',
    name: '',
    price: '',
    previewImage: '',
    images: ['', '', '', '']
  });
  
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = {};
    
    if (!formData.country) validationErrors.country = "Country is required";
    if (!formData.address) validationErrors.address = "Street address is required";
    if (!formData.city) validationErrors.city = "City is required";
    if (!formData.state) validationErrors.state = "State is required";
    if (formData.description.length < 30) validationErrors.description = "Description needs 30 or more characters";
    if (!formData.name) validationErrors.name = "Name is required";
    if (!formData.price) validationErrors.price = "Price per night is required";
    if (!formData.previewImage) validationErrors.previewImage = "Preview image is required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // TODO: Add createSpot action/thunk
    const newSpot = await dispatch(createSpotThunk(formData));
    if (newSpot.id) {
      navigate(`/spots/${newSpot.id}`);
    }
  };

  return (
    <div className="create-spot-form">
      <h1>Create a New Spot</h1>
      
      <form onSubmit={handleSubmit}>
        <section>
          <h2>Where &apos;s your place located?</h2>
          <p>Guests will only get your exact address once they booked a reservation.</p>
          
          <div className="form-group">
            <label>Country</label>
            <input 
              type="text"
              value={formData.country}
              onChange={e => setFormData({...formData, country: e.target.value})}
              placeholder="Country"
            />
            {errors.country && <span className="error">{errors.country}</span>}
          </div>
          {/* Similar input groups for address, city, state */}
        </section>

        <section>
          <h2>Describe your place to guests</h2>
          <p>Mention the best features of your space, any special amentities like fast wifi or parking, and what you love about the neighborhood.</p>
          <textarea
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Please write at least 30 characters"
          />
          {errors.description && <span className="error">{errors.description}</span>}
        </section>

        {/* Additional sections for name, price, and images */}

        <button type="submit">Create Spot</button>
      </form>
    </div>
  );
};

export default CreateSpotForm;
