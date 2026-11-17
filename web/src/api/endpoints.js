// Single source of truth for backend endpoints used by the UI.
// Paths must match contracts/customer-api.contract.json (verified by the harness integration reviewer).
export const ENDPOINTS = {
  customers: '/api/customers',
  register: '/api/customers/register',
  login: '/api/auth/login',
  currentCustomer: '/api/customers/me',
  customerById: (id) => `/api/customers/${encodeURIComponent(id)}`,
};
