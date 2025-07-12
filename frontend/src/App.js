import React from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

function App() {
  const { user } = useAuth();

  return (
    <div className="bg-gray-900 min-h-screen">
      {user ? <Dashboard /> : <LoginPage />}
    </div>
  );
}

export default App;
