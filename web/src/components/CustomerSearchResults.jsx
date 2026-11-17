import React from 'react';

export default function CustomerSearchResults({ customers }) {
  if (customers.length === 0) return <p>No customer found.</p>;

  return (
    <section className="card">
      <h2 className="search-results-title">Matching customers</h2>
      <ul className="search-results">
        {customers.map((customer) => (
          <li key={customer.id}>
            {customer.first_name} {customer.last_name}
          </li>
        ))}
      </ul>
    </section>
  );
}
