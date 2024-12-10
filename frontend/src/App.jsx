import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '../src/Layout';
import SpotsIndex from './components/SpotsIndex/SpotsIndex';
import SpotDetails from './components/SpotDetails/SpotDetails';
import UpdateSpotModal from './components/UpdateSpotModal/UpdateSpotModal';
import CreateSpotForm from './components/CreateSpotModal/CreateSpotModal';
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
        path: '/spots/manage',
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
        element: <UpdateSpotModal />
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
