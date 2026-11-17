export function filterCustomersByName(customers, query) {
  const normalizedQuery = query.trim().toLowerCase();

  return customers.filter((customer) =>
    `${customer.first_name} ${customer.last_name}`
      .toLowerCase()
      .includes(normalizedQuery),
  );
}
