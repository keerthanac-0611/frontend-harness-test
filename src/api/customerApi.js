import { request } from './client';
import { ENDPOINTS } from './endpoints';

export function registerCustomer({ email, password, firstName, lastName, phone, address }) {
  return request('POST', ENDPOINTS.register, {
    body: {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      address: address || null,
    },
  });
}

export function loginCustomer({ email, password }) {
  return request('POST', ENDPOINTS.login, { body: { email, password } });
}

export function fetchCurrentCustomer(token) {
  return request('GET', ENDPOINTS.currentCustomer, { token });
}

export function fetchCustomerById(id, token) {
  return request('GET', ENDPOINTS.customerById(id), { token });
}
