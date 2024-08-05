import { useContext } from 'react';
import { Navigate } from 'react-router';
import { AuthProvider } from '@/context/Auth';

const PrivateRoute = ({ children }) => {
  if (localStorage.getItem('userToken') == null) {
    return <Navigate to={'/'} />;
  } else {
    return children;
  }
};

export default PrivateRoute;
