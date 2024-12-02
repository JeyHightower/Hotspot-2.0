import { createBrowserRouter, RouterProvider, Outlet, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Navigation from './components/Navigation/Navigation';
import * as sessionActions from './store/session';
import SpotsIndex from './components/SpotsIndex/SpotsIndex';
import SpotDetails from './components/SpotDetails/SpotDetails';

const Layout = () => {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUserThunk()).then(() => {
      setIsLoaded(true);
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
};

// Create the router with the necessary future flags
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <SpotsIndex />,
      },
      {
        path: '/spots/:spotId',
        element: <SpotDetails />,
      }
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

// In your spot tile component
const SpotTile = ({ spot }) => {
  const avgRating = spot.avgRating ? spot.avgRating.toFixed(1) : 'New';

  return (
    <div className="spot-tile">
      <img src={spot.previewImage} alt={spot.name} />
      <div className="spot-info">
        <div className="location-rating">
          <span>{spot.city}, {spot.state}</span>
          <span className="rating">
            <i className="fas fa-star"></i> {avgRating}
          </span>
        </div>
        <div className="price">
          ${spot.price} night
        </div>
      </div>
    </div>
  );
};
