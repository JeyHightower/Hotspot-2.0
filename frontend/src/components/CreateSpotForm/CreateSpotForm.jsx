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

  const validateForm = () => {
    const validationErrors = {};
    if (!formData.country) validationErrors.country = 'Country is required';
    if (!formData.address) validationErrors.address = 'Street address is required';
    if (!formData.city) validationErrors.city = 'City is required';
    if (!formData.state) validationErrors.state = 'State is required';
    if (formData.description.length < 30) validationErrors.description = 'Description needs 30 or more characters';
    if (!formData.name) validationErrors.name = 'Name is required';
    if (!formData.price) validationErrors.price = 'Price per night is required';
    if (!formData.previewImage) validationErrors.previewImage = 'Preview image is required';
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
          <h2>Where's your place located?</h2>
          <p>Guests will only get your exact address once they booked a reservation.</p>
          {/* Form fields for Country, Address, City, State */}
        </section>

        {/* Description Section */}
        <section>
          <h2>Describe your place to guests</h2>
          <p>Mention the best features of your space, any special amentities like fast wifi or parking, and what you love about the neighborhood.</p>
          {/* Description textarea */}
        </section>

        {/* Title Section */}
        <section>
          <h2>Create a title for your spot</h2>
          <p>Catch guests' attention with a spot title that highlights what makes your place special.</p>
          {/* Name input */}
        </section>

        {/* Price Section */}
        <section>
          <h2>Set a base price for your spot</h2>
          <p>Competitive pricing can help your listing stand out and rank higher in search results.</p>
          {/* Price input */}
        </section>

        {/* Photos Section */}
        <section>
          <h2>Liven up your spot with photos</h2>
          <p>Submit a link to at least one photo to publish your spot.</p>
          {/* Image inputs */}
        </section>

        <button type="submit">Create Spot</button>
      </form>
    </div>
  );
};

export default CreateSpotForm;