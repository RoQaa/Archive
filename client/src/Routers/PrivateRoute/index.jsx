import { useContext } from 'react';
import { Navigate } from 'react-router';
import { AuthProvider } from '@/context/Auth';

const PrivateRoute = ({ children }) => {
  const Loggedin = useContext(AuthProvider);
  console.log('login here', Loggedin);
  return Loggedin ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
