import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import "./App.css";
import Layout from "./Layout";
import CreateSpotModal from "./components/CreateSpotModal/CreateSpotModal";
import ManageSpots from "./components/ManageSpots/ManageSpots";
import SpotDetails from "./components/SpotDetails/SpotDetails";
import SpotsIndex from "./components/SpotsIndex/SpotsIndex";
import UpdateSpotModal from "./components/UpdateSpotModal/UpdateSpotModal";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: (
          <div className="welcome-container">
            <div className="welcome-header">
              <h1 className="welcome-message">
                Where Luxury Meets Adventure
                <span className="welcome-subtitle">
                  Discover extraordinary stays in the world's most sought-after
                  destinations
                </span>
              </h1>
            </div>
            <SpotsIndex />
          </div>
        ),
      },
      {
        path: "spots",
        element: <Outlet />,
        children: [
          {
            path: ":spotId",
            element: <Outlet />,
            children: [
              {
                path: "",
                element: <SpotDetails />,
              },
              {
                path: "edit",
                element: <UpdateSpotModal />,
              },
            ],
          },
          {
            path: "new",
            element: <CreateSpotModal />,
          },
          {
            path: "manage",
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
