import Header from '../Header-Logo/Header-Logo';
import { useSelector } from 'react-redux';
import './Navigation.css';
import ProfileButton from './ProfileButton';
import { useModal } from '../Context/useModal';
import CreateSpotModal from '../CreateSpotModal/CreateSpotModal';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector((state) => state.session.user);
  const { setModalContent } = useModal();

  const openCreateSpotModal = () => {
    setModalContent(<CreateSpotModal />);
  };

  return (
    <nav>
      <ul className="nav-list">
        {isLoaded && (
          <>
            <li>
              <Header />
            </li>
            <div className="nav-right">
              {sessionUser && (
                <button onClick={openCreateSpotModal} className="create-spot-button">
                  Create a New Spot
                </button>
              )}
              <div className="profile-button-container">
                <ProfileButton user={sessionUser} />
              </div>
            </div>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;