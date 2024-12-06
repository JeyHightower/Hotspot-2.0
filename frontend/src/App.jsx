import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '../src/Layout';
import SpotsIndex from './components/SpotsIndex/SpotsIndex';
import SpotDetails from './components/SpotDetails/SpotDetails';
import CreateSpotForm from './components/CreateSpotForm/CreateSpotForm';
import ManageSpots from './components/ManageSpots/ManageSpots';

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
        element: <CreateSpotForm />,
      },
      {
        path: '/spots/:spotId/edit',
        element: <CreateSpotForm />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
