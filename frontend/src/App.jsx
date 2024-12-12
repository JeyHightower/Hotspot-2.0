import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import Layout from './Layout';
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
          <div className="welcome-container">
            <h1 className="welcome-message">Where Sunshine and Adventure Meet: Find Your Perfect Stay in the World&apos;s Hottest Destinations!</h1>
            <SpotsIndex />
          </div>
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
