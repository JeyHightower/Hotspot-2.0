import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { createReviewThunk } from "../../store/reviews";
import { useModal } from "../Context/useModal";
import "../styles/ModalBase.css";
import "./ReviewFormModal.css";

const ReviewFormModal = ({ spotId, onReviewSubmit }) => {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState("");
  const [errors, setErrors] = useState({});
  const [hoveredStar, setHoveredStar] = useState(0);

  // Reset form when modal opens
  useEffect(() => {
    setStars(0);
    setReview("");
    setErrors({});
    setHoveredStar(0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input
    if (review.length < 10) {
      setErrors({ server: "Review must be at least 10 characters long" });
      return;
    }
    if (stars === 0) {
      setErrors({ server: "Please select a star rating" });
      return;
    }

    const reviewData = {
      spotId: Number(spotId),
      review: review.trim(),
      stars: Number(stars),
    };

    try {
      const newReview = await dispatch(createReviewThunk(reviewData));
      if (newReview) {
        closeModal();
        if (onReviewSubmit) {
          await onReviewSubmit();
        }
      }
    } catch (error) {
      console.error("Review submission error:", error);
      setErrors({
        server:
          error.message || "An error occurred while submitting your review",
      });
    }
  };

  const isSubmitDisabled = review.length < 10 || stars === 0;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div
        className="modal-base review-form-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>How was your stay?</h2>
        {errors.server && <p className="error-message">{errors.server}</p>}

        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Leave your review here..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            minLength={10}
            rows={4}
          />
          {review.length < 10 && review.length > 0 && (
            <p className="character-count">
              At least {10 - review.length} more characters needed
            </p>
          )}

          <div className="stars-input">
            {[1, 2, 3, 4, 5].map((num) => (
              <FaStar
                key={num}
                className={`star ${
                  num <= (hoveredStar || stars) ? "filled" : "empty"
                }`}
                onClick={() => setStars(num)}
                onMouseEnter={() => setHoveredStar(num)}
                onMouseLeave={() => setHoveredStar(0)}
              />
            ))}
            <span className="stars-label">Stars</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={isSubmitDisabled ? "disabled" : ""}
          >
            Submit Your Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewFormModal;
