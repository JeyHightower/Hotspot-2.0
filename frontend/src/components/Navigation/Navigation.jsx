import { useSelector } from 'react-redux';
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
              <ProfileButton user={sessionUser } />
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;