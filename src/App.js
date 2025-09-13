import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './Context/AuthContext';
import Login from './components/Login/Login';
import Platform from './components/Platform/Platform';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <LoadingScreen />;
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/platform/*" 
        element={
          <PrivateRoute>
            <Platform />
          </PrivateRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/platform/dashboard" />} />
    </Routes>
  );
}

export default App;