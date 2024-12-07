import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../Context/ModalContext';
import { createReviewThunk } from '../../store/reviews';
import './ReviewFormModal.css';

const ReviewFormModal = ({ spotId, onReviewSubmit }) => {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reviewData = { spotId, review, stars };
  
    try {
      await dispatch(createReviewThunk(reviewData));
      if (onReviewSubmit) onReviewSubmit();
      closeModal();
    } catch (error) {
      setErrors({ server: error.message });
    }
  };

  const isSubmitDisabled = review.length < 10 || stars === 0;

  return (
    <div className="review-form-modal">
      <h2>How was your stay?</h2>
      {errors.server && <p className="error">{errors.server}</p>}
    
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Leave your review here..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          minLength={10}
        />
      
        <div className="stars-input">
          {[1, 2, 3, 4, 5].map((num) => (
            <span
              key={num}
              className={`star ${num <= stars ? 'filled' : ''}`}
              onClick={() => setStars(num)}
            >
              ★
            </span>
          ))}
          <span>Stars</span>
        </div>

        <button type="submit" disabled={isSubmitDisabled}>
          Submit Your Review
        </button>
      </form>
    </div>
  );
};

export default ReviewFormModal;