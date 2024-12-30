import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useModal } from "../Context/useModal";
import CreateSpotModal from "../CreateSpotModal/CreateSpotModal";
import Header from "../Header-Logo/Header-Logo";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import SignupFormModal from "../SignupFormModal/SignupFormModal";
import "./Navigation.css";
import ProfileButton from "./ProfileButton";

function Navigation({ isLoaded }) {
  const sessionUser = useSelector((state) => state.session.user);
  const { setModalContent } = useModal();
  const navigate = useNavigate();

  const openCreateSpotModal = () => {
    setModalContent(<CreateSpotModal />);
  };

  let sessionLinks;
  if (sessionUser) {
    sessionLinks = (
      <div className="nav-right">
        <button onClick={openCreateSpotModal} className="create-spot-button">
          Create a New Spot
        </button>
        <div className="profile-button-container">
          <ProfileButton user={sessionUser} />
        </div>
      </div>
    );
  } else {
    sessionLinks = (
      <div className="nav-right">
        <OpenModalButton
          buttonText="Sign Up"
          modalComponent={<SignupFormModal />}
          className="signup-button"
        />
        <OpenModalButton
          buttonText="Log In"
          modalComponent={<LoginFormModal />}
          className="login-button"
        />
      </div>
    );
  }

  return (
    <nav>
      <ul className="nav-list">
        {isLoaded && (
          <>
            <li>
              <Header />
            </li>
            {sessionLinks}
          </>
        )}
      </ul>
    </nav>
  );
}
export default Navigation;
