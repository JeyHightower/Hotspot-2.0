import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import Header from '../Header-Logo/Header-Logo';
import ProfileButton from './ProfileButton';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser  = useSelector((state) => state.session.user);

  return (
    <nav>
      <ul className="nav-list">
        {isLoaded && (
          <>
            <li>
              <Header />
            </li>
            <li className="profile-button-container">
              <ProfileButton user={sessionUser} />
            </li>
            {isLoaded && sessionUser && (
              <li>
                <NavLink to="/spots/new" className="create-spot-button">
                  Create a New Spot
                </NavLink>
              </li>
            )}
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;