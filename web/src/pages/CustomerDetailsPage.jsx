import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentCustomer } from '../api/customerApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import CustomerSearchResults from '../components/CustomerSearchResults.jsx';
import { filterCustomersByName } from '../utils/customerSearch.js';

const FIELDS = [
  ['Customer ID', 'id'],
  ['First name', 'first_name'],
  ['Last name', 'last_name'],
  ['Email', 'email'],
  ['Phone', 'phone'],
  ['Address', 'address'],
];

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function CustomerDetailsPage({ searchQuery, customerList, customerListError }) {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchCurrentCustomer(token)
      .then((data) => active && setCustomer(data))
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) {
          logout();
          navigate('/login', { replace: true });
        } else {
          setError(err.message);
        }
      });
    return () => {
      active = false;
    };
  }, [token, logout, navigate]);

  if (searchQuery.trim() !== '') {
    if (customerListError) {
      return (
        <div className="alert alert-error" role="alert">
          {customerListError}
        </div>
      );
    }
    if (!customerList) return <p aria-busy="true">Loading customers…</p>;
    return <CustomerSearchResults customers={filterCustomersByName(customerList, searchQuery)} />;
  }

  if (error) {
    return (
      <div className="alert alert-error" role="alert">
        {error}
      </div>
    );
  }
  if (!customer) return <p aria-busy="true">Loading your details…</p>;

  return (
    <section className="card">
      <h1>
        Welcome, {customer.first_name} {customer.last_name}
      </h1>
      <dl className="details">
        {FIELDS.map(([label, key]) => (
          <div key={key} className="details-row">
            <dt>{label}</dt>
            <dd>{customer[key] ?? '—'}</dd>
          </div>
        ))}
        <div className="details-row">
          <dt>Member since</dt>
          <dd>{formatDate(customer.created_at)}</dd>
        </div>
      </dl>
    </section>
  );
}
