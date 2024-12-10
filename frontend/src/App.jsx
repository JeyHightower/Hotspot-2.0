import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import Layout from '../src/Layout';
import CreateSpotModal from './components/CreateSpotModal/CreateSpotModal';
import ManageSpots from './components/ManageSpots/ManageSpots';
import SpotDetails from './components/SpotDetails/SpotDetails';
import SpotsIndex from './components/SpotsIndex/SpotsIndex';
import UpdateSpotModal from './components/UpdateSpotModal/UpdateSpotModal';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: (
          <>
            <h1>Welcome!</h1>
            <SpotsIndex />
          </>
        ),
      },
      {
        path: 'spots',
        element: <Outlet />,
        children: [
          {
            path: ':spotId',
            element: <Outlet />,
            children: [
              {
                path: '',
                element: <SpotDetails />,
              },
              {
                path: 'edit',
                element: <UpdateSpotModal />,
              },
            ],
          },
          {
            path: 'new',
            element: <CreateSpotModal />,
          },
          {
            path: 'current',
            element: <ManageSpots />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
