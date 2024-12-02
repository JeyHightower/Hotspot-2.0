import { createBrowserRouter, RouterProvider, Outlet} from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Navigation from './components/Navigation/Navigation';
import * as sessionActions from './store/session';
import SpotsIndex from './components/SpotsIndex/SpotsIndex';
import SpotDetails from './components/SpotDetails/SpotDetails';
import CreateSpotForm from './components/CreateSpotForm/CreateSpotForm';
import ManageSpots from './components/ManageSpots/ManageSpots';


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
        path: '/spots/current',
        element: <ManageSpots />,

      },
      {
        path: '/spots/:spotId',
        element: <SpotDetails />,
      },
      {
        path: '/spots/new',
        element: <CreateSpotForm />
      }
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
