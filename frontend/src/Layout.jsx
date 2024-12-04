import { Outlet } from 'react-router-dom';
import { useEffect, useState,  } from 'react';
import { useDispatch } from 'react-redux';
import Navigation from './components/Navigation/Navigation';
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
        <Navigation isLoaded={isLoaded} />
        {isLoaded && <Outlet />}
      </>
    );
  };
  
export default Layout;