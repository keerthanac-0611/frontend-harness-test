import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import App from '../App.jsx';
import { AuthProvider } from '../auth/AuthContext.jsx';

const CUSTOMER = {
  id: 7,
  email: 'jane@example.com',
  first_name: 'Jane',
  last_name: 'Doe',
  phone: null,
  address: '1 Main St',
  created_at: '2026-01-01T00:00:00+00:00',
};

function jsonResponse(status, body) {
  return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));
}

function renderApp(path) {
  return render(
    <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('customer flows', () => {
  it('registers a customer and redirects to login', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => jsonResponse(201, CUSTOMER));
    const user = userEvent.setup();
    renderApp('/register');

    await user.type(screen.getByLabelText(/first name/i), 'Jane');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/^email/i), 'Jane@Example.com');
    await user.type(screen.getByLabelText(/^password/i), 'Str0ngPass');
    await user.type(screen.getByLabelText(/confirm password/i), 'Str0ngPass');
    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText(/registration successful/i)).toBeInTheDocument();
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/customers/register');
    expect(JSON.parse(options.body)).toMatchObject({ email: 'Jane@Example.com', first_name: 'Jane', last_name: 'Doe' });
  });

  it('shows duplicate email error from the API', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => jsonResponse(409, { detail: 'Email is already registered' }));
    const user = userEvent.setup();
    renderApp('/register');

    await user.type(screen.getByLabelText(/first name/i), 'Jane');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/^email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'Str0ngPass');
    await user.type(screen.getByLabelText(/confirm password/i), 'Str0ngPass');
    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
  });

  it('logs in and shows customer details', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) =>
      url === '/api/auth/login'
        ? jsonResponse(200, { access_token: 'tkn', token_type: 'bearer', expires_in: 3600, customer: CUSTOMER })
        : jsonResponse(200, CUSTOMER),
    );
    const user = userEvent.setup();
    renderApp('/login');

    await user.type(screen.getByLabelText(/^email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'Str0ngPass');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/welcome, jane doe/i)).toBeInTheDocument();
    expect(screen.getByText('1 Main St')).toBeInTheDocument();
    const detailsCall = globalThis.fetch.mock.calls.find(([url]) => url === '/api/customers/me');
    expect(detailsCall[1].headers.Authorization).toBe('Bearer tkn');
  });

  it('shows invalid credentials message', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => jsonResponse(401, { detail: 'Invalid email or password' }));
    const user = userEvent.setup();
    renderApp('/login');

    await user.type(screen.getByLabelText(/^email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'WrongPass1');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });

  it('redirects unauthenticated users from details to login', async () => {
    renderApp('/customer');
    await waitFor(() => expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument());
  });
});
