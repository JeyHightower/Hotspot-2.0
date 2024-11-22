import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import LoginFormPage from './components/LoginFormPage/LoginFormPage';
import SignupFormPage from './components/SignupFormPage/SignupFormPage';
import * as sessionActions from './store/session';

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
    {isLoaded && <Outlet />}
  </>
)
};

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <h1>Welcome!</h1>,
      },
      {
        path: '/login',
        element: <LoginFormPage />,
      },
      {
        path: '/signup',
        element: <SignupFormPage />,
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
