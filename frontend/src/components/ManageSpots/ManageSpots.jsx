import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteSpotThunk, fetchUserSpotsThunk } from "../../store/spots";
import DeleteConfirmModal from "../DeleteConfirmModal/DeleteConfirmModal";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import SpotTile from "../SpotTile/SpotTile";
import UpdateSpotModal from "../UpdateSpotModal/UpdateSpotModal";
import "./ManageSpots.css";

const ManageSpots = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.session.user);
  const allSpots = useSelector((state) => state.spots.allSpots);

  const userSpots = Object.values(allSpots).filter(
    (spot) => spot.ownerId === user?.id
  );

  useEffect(() => {
    dispatch(fetchUserSpotsThunk());
  }, [dispatch]);

  const handleUpdate = (spotId) => {
    navigate(`/spots/${spotId}`);
  };

  const handleDelete = (spotId) => async () => {
    const success = await dispatch(deleteSpotThunk(spotId));
    if (success) {
      dispatch(fetchUserSpotsThunk());
    }
  };

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="manage-spots">
      <h1>Manage Spots</h1>
      {userSpots.length === 0 ? (
        <button
          onClick={() => navigate("/spots/new")}
          className="create-spot-button"
        >
          Create a New Spot
        </button>
      ) : (
        <div className="spots-grid">
          {userSpots.map((spot) => (
            <div key={spot.id} className="spot-tile-container">
              <SpotTile
                spot={spot}
                actions={
                  <div className="spot-actions">
                    <OpenModalButton
                      buttonText="Update"
                      modalComponent={
                        <UpdateSpotModal
                          spotId={spot.id}
                          onUpdate={handleUpdate}
                        />
                      }
                    />
                    <OpenModalButton
                      buttonText="Delete"
                      modalComponent={
                        <DeleteConfirmModal
                          onDelete={handleDelete(spot.id)}
                          type="Spot"
                        />
                      }
                    />
                  </div>
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageSpots;
