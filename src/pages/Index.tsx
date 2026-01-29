import { Navigate } from 'react-router-dom';

// Redirect to welcome page
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
