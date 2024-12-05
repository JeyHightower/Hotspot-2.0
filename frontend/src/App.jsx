import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '../src/Layout';
import SpotsIndex from './components/SpotsIndex/SpotsIndex';
import SpotDetails from './components/SpotDetails/SpotDetails';
import CreateSpotForm from './components/CreateSpotForm/CreateSpotForm';
import ManageSpots from './components/ManageSpots/ManageSpots';



/// Router configuration with nested children
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <SpotsIndex />,
      },
      {
        path: '/spots',
        children: [
          {
            path: 'current',
            element: <ManageSpots />,
          },
          {
            path: ':spotId',
            element: <SpotDetails />,
          },
          {
            path: 'new',
            element: <CreateSpotForm />,
          },
          {
            path:':spotId/edit',
            element: <CreateSpotForm />
          }
        ],
      },
    ],
  },
]);

function App(){
  return <RouterProvider router={router} />
}


export default App;