import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../Header-Logo/Header-Logo';
import ProfileButton from './ProfileButton';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const navigate = useNavigate();
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