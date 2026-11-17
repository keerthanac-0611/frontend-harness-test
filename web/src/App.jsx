import { useEffect, useState } from 'react';
import { fetchCustomerList } from './api/customerApi.js';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import NavBar from './components/NavBar.jsx';
import CustomerDetailsPage from './pages/CustomerDetailsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

export default function App() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const [customerList, setCustomerList] = useState(null);
  const [customerListError, setCustomerListError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setSearchQuery('');
      setCustomerList(null);
      setCustomerListError('');
      return undefined;
    }
    // Fetched once per logged-in session; filtering happens locally.
    let active = true;
    fetchCustomerList()
      .then((data) => active && setCustomerList(data))
      .catch((err) => active && setCustomerListError(err.message));
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  return (
    <>
      <NavBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/customer" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/customer"
            element={
              <ProtectedRoute>
                <CustomerDetailsPage
                  searchQuery={searchQuery}
                  customerList={customerList}
                  customerListError={customerListError}
                />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
