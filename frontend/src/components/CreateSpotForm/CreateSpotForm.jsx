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
    images: ['', '', '', ''],
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const validationErrors = {};
    if (!formData.country) validationErrors.country = 'Country is required';
    if (!formData.address)
      validationErrors.address = 'Street address is required';
    if (!formData.city) validationErrors.city = 'City is required';
    if (!formData.state) validationErrors.state = 'State is required';
    if (formData.description.length < 30)
      validationErrors.description = 'Description needs 30 or more characters';
    if (!formData.name) validationErrors.name = 'Name is required';
    if (!formData.price) validationErrors.price = 'Price per night is required';
    if (!formData.previewImage)
      validationErrors.previewImage = 'Preview image is required';
    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const newSpot = await dispatch(createSpotThunk(formData));
      navigate(`/spots/${newSpot.id}`);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  return (
    <div className="create-spot-form">
      <h1>Create a New Spot</h1>
      <form onSubmit={handleSubmit}>
        {/* Location Section */}
        <section>
          <h2>Where&apos;s your place located?</h2>
          <p>
            Guests will only get your exact address once they booked a
            reservation.
          </p>

          <div className="form-group">
            <label>Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="Country"
            />
            {errors.country && <span className="error">{errors.country}</span>}
          </div>

          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Address"
            />
            {errors.address && <span className="error">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="City"
            />
            {errors.city && <span className="error">{errors.city}</span>}
          </div>

          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="State"
            />
            {errors.state && <span className="error">{errors.state}</span>}
          </div>
        </section>

        {/* Description Section */}
        <section>
          <h2>Describe your place to guests</h2>
          <p>
            Mention the best features of your space, any special amentities like
            fast wifi or parking, and what you love about the neighborhood.
          </p>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Please write at least 30 characters"
          />
          {errors.description && <span className="error">{errors.description}</span>}
        </section>

        {/* Title Section */}
        <section>
          <h2>Create a title for your spot</h2>
          <p>
            Catch guests&apos attention with a spot title that highlights what
            makes your place special.
          </p>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Name of your spot"
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </section>

        {/* Price Section */}
        <section>
          <h2>Set a base price for your spot</h2>
          <p>
            Competitive pricing can help your listing stand out and rank higher
            in search results.
          </p>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="Price per night (USD)"
          />
          {errors.price && <span className="error">{errors.price}</span>}
        </section>

        {/* Photos Section */}
        <section>
          <h2>Liven up your spot with photos</h2>
          <p>Submit a link to at least one photo to publish your spot.</p>
          <input
            type="text"
            value={formData.previewImage}
            onChange={(e) => setFormData({ ...formData, previewImage: e.target.value })}
            placeholder="Preview Image URL"
          />
          {errors.previewImage && <span className="error">{errors.previewImage}</span>}

          {formData.images.map((image, index) => (
            <input
              key={index}
              type="text"
              value={image}
              onChange={(e) => {
                const newImages = [...formData.images];
                newImages[index] = e.target.value;
                setFormData({ ...formData, images: newImages });
              }}
              placeholder="Image URL"
            />
          ))}
        </section>
        <button type="submit">Create Spot</button>
      </form>
    </div>
  );
};

export default CreateSpotForm;
