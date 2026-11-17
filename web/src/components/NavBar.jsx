import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import CustomerSearch from './CustomerSearch.jsx';

export default function NavBar({ searchQuery, onSearchChange }) {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <span className="brand">Customer Portal</span>
      {isAuthenticated && (
        <div className="nav-search">
          <CustomerSearch value={searchQuery} onChange={onSearchChange} />
        </div>
      )}
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <Link to="/customer">My details</Link>
            <button type="button" className="link-button" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
