import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Header from '../Header-Logo/Header-Logo';
import './Navigation.css';
import ProfileButton from './ProfileButton';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector((state) => state.session.user);

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
                <Link to="/spots/new" className="create-spot-button">
                  Create a New Spot
                </Link>
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
