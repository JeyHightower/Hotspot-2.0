import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSingleSpotThunk, updateSpotThunk } from "../../store/spots";
import { useModal } from "../Context/useModal";
import "../styles/ModalBase.css";
import "./UpdateSpotModal.css";

const UpdateSpotModal = ({ spotId, onUpdate }) => {
  const { closeModal } = useModal();
  const dispatch = useDispatch();
  const spot = useSelector((state) => state.spots.singleSpot);

  const [formData, setFormData] = useState({
    country: "",
    address: "",
    city: "",
    state: "",
    description: "",
    name: "",
    price: "",
    previewImage: "",
    image2: "",
    image3: "",
    image4: "",
    image5: "",
  });
  const [errors, setErrors] = useState({});

  // Fetch spot data when component mounts
  useEffect(() => {
    if (spotId) {
      dispatch(fetchSingleSpotThunk(spotId));
    }
  }, [dispatch, spotId]);

  // Pre-populate form when spot data is available
  useEffect(() => {
    if (spot) {
      setFormData({
        country: spot.country || "",
        address: spot.address || "",
        city: spot.city || "",
        state: spot.state || "",
        description: spot.description || "",
        name: spot.name || "",
        price: spot.price || "",
        previewImage: spot.previewImage || "",
        image2: spot.SpotImages?.[1]?.url || "",
        image3: spot.SpotImages?.[2]?.url || "",
        image4: spot.SpotImages?.[3]?.url || "",
        image5: spot.SpotImages?.[4]?.url || "",
      });
    }
  }, [spot]);

  const validateForm = () => {
    const validationErrors = {};
    if (!formData.country) validationErrors.country = "Country is required";
    if (!formData.address)
      validationErrors.address = "Street address is required";
    if (!formData.city) validationErrors.city = "City is required";
    if (!formData.state) validationErrors.state = "State is required";
    if (formData.description.length < 30)
      validationErrors.description = "Description needs 30 or more characters";
    if (!formData.name) validationErrors.name = "Name is required";
    if (!formData.price) validationErrors.price = "Price per night is required";
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
      const updatedSpot = await dispatch(updateSpotThunk(spotId, formData));
      if (updatedSpot) {
        // Refresh spot details without page reload
        await dispatch(fetchSingleSpotThunk(spotId));
        closeModal();
        if (onUpdate) onUpdate(spotId); // Callback to handle navigation
      }
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  return (
    <div className="modal-update-spot">
      <h1>Update your Spot</h1>
      <form onSubmit={handleSubmit}>
        <section>
          <h2>Where's your place located?</h2>
          <p>
            Guests will only get your exact address once they booked a
            reservation.
          </p>

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              id="country"
              type="text"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
            />
            {errors.country && <span className="error">{errors.country}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Street Address</label>
            <input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
            {errors.address && <span className="error">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
            {errors.city && <span className="error">{errors.city}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="state">State</label>
            <input
              id="state"
              type="text"
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
            />
            {errors.state && <span className="error">{errors.state}</span>}
          </div>
        </section>

        <section>
          <h2>Describe your place to guests</h2>
          <p>
            Mention the best features of your space, any special amenities like
            fast wifi or parking, and what you love about the neighborhood.
          </p>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Please write at least 30 characters"
            rows="5"
          />
          {errors.description && (
            <span className="error">{errors.description}</span>
          )}
        </section>

        <section>
          <h2>Create a title for your spot</h2>
          <p>
            Catch guests' attention with a spot title that highlights what makes
            your place special.
          </p>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </section>

        <section>
          <h2>Set a base price for your spot</h2>
          <p>
            Competitive pricing can help your listing stand out and rank higher
            in search results.
          </p>
          <input
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
          />
          {errors.price && <span className="error">{errors.price}</span>}
        </section>

        <section>
          <h2>Liven up your spot with photos</h2>
          <p>Submit a link to at least one photo to publish your spot.</p>

          <div className="form-group">
            <input
              type="url"
              value={formData.previewImage}
              onChange={(e) =>
                setFormData({ ...formData, previewImage: e.target.value })
              }
              placeholder="Preview Image URL"
            />
            {errors.previewImage && (
              <span className="error">{errors.previewImage}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="url"
              value={formData.image2}
              onChange={(e) =>
                setFormData({ ...formData, image2: e.target.value })
              }
              placeholder="Image URL"
            />
          </div>

          <div className="form-group">
            <input
              type="url"
              value={formData.image3}
              onChange={(e) =>
                setFormData({ ...formData, image3: e.target.value })
              }
              placeholder="Image URL"
            />
          </div>

          <div className="form-group">
            <input
              type="url"
              value={formData.image4}
              onChange={(e) =>
                setFormData({ ...formData, image4: e.target.value })
              }
              placeholder="Image URL"
            />
          </div>

          <div className="form-group">
            <input
              type="url"
              value={formData.image5}
              onChange={(e) =>
                setFormData({ ...formData, image5: e.target.value })
              }
              placeholder="Image URL"
            />
          </div>
        </section>

        <button type="submit" className="update-button">
          Update your Spot
        </button>
      </form>
    </div>
  );
};

export default UpdateSpotModal;
