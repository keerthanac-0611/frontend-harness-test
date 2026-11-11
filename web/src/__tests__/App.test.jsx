import { render, screen, waitFor, within } from '@testing-library/react';
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

function mockLoginAndCustomerFetch() {
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((url) =>
    url === '/api/auth/login'
      ? jsonResponse(200, { access_token: 'tkn', token_type: 'bearer', expires_in: 3600, customer: CUSTOMER })
      : jsonResponse(200, CUSTOMER),
  );
  return fetchMock;
}

async function logIn(user) {
  await user.type(screen.getByLabelText(/^email/i), 'jane@example.com');
  await user.type(screen.getByLabelText(/^password/i), 'Str0ngPass');
  await user.click(screen.getByRole('button', { name: /log in/i }));
}

describe('customer flows', () => {
  it('shows the search input in the authenticated navbar only', async () => {
    const fetchMock = mockLoginAndCustomerFetch();
    const user = userEvent.setup();
    renderApp('/login');

    expect(screen.queryByRole('searchbox', { name: /search by customer name/i })).not.toBeInTheDocument();
    await logIn(user);

    const search = await screen.findByRole('searchbox', { name: /search by customer name/i });
    const nav = screen.getByRole('navigation');
    expect(search).toHaveAttribute('placeholder', 'Search by customer name');
    expect(within(nav).getByText('Customer Portal').compareDocumentPosition(search) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/customers/me')).toHaveLength(1);
  });

  it('filters signed-in customer details locally and restores them for a blank query', async () => {
    const fetchMock = mockLoginAndCustomerFetch();
    const user = userEvent.setup();
    renderApp('/login');
    await logIn(user);

    const search = await screen.findByRole('searchbox', { name: /search by customer name/i });
    expect(await screen.findByText(/welcome, jane doe/i)).toBeInTheDocument();

    await user.type(search, ' jAn ');
    expect(screen.getByText(/welcome, jane doe/i)).toBeInTheDocument();
    await user.clear(search);
    await user.type(search, 'jane doe');
    expect(screen.getByText(/welcome, jane doe/i)).toBeInTheDocument();
    await user.clear(search);
    await user.type(search, 'nobody');
    expect(screen.getByText('No customer found.')).toBeInTheDocument();
    expect(screen.queryByText(/welcome, jane doe/i)).not.toBeInTheDocument();
    await user.clear(search);
    expect(screen.getByText(/welcome, jane doe/i)).toBeInTheDocument();
    await user.type(search, '   ');
    expect(screen.getByText(/welcome, jane doe/i)).toBeInTheDocument();

    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/customers/me')).toHaveLength(1);
  });

  it('clears the search query on logout so a later login starts fresh', async () => {
    const fetchMock = mockLoginAndCustomerFetch();
    const user = userEvent.setup();
    renderApp('/login');
    await logIn(user);

    const search = await screen.findByRole('searchbox', { name: /search by customer name/i });
    await user.type(search, 'nobody');
    expect(screen.getByText('No customer found.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /log out/i }));
    expect(await screen.findByRole('heading', { name: /log in/i })).toBeInTheDocument();
    expect(screen.queryByRole('searchbox', { name: /search by customer name/i })).not.toBeInTheDocument();

    await logIn(user);
    const resetSearch = await screen.findByRole('searchbox', { name: /search by customer name/i });
    expect(resetSearch).toHaveValue('');
    expect(await screen.findByText(/welcome, jane doe/i)).toBeInTheDocument();
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/customers/me')).toHaveLength(2);
  });

  it('keeps the loading state visible while the customer request is pending', async () => {
    let resolveCustomer;
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) =>
      url === '/api/auth/login'
        ? jsonResponse(200, { access_token: 'tkn', token_type: 'bearer', expires_in: 3600, customer: CUSTOMER })
        : new Promise((resolve) => {
            resolveCustomer = resolve;
          }),
    );
    const user = userEvent.setup();
    renderApp('/login');
    await logIn(user);

    const search = await screen.findByRole('searchbox', { name: /search by customer name/i });
    await user.type(search, 'nobody');
    expect(screen.getByText('Loading your details…')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('No customer found.')).not.toBeInTheDocument();
    resolveCustomer(new Response(JSON.stringify(CUSTOMER), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    expect(await screen.findByText('No customer found.')).toBeInTheDocument();
  });

  it('keeps customer API errors visible instead of showing a no-match result', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) =>
      url === '/api/auth/login'
        ? jsonResponse(200, { access_token: 'tkn', token_type: 'bearer', expires_in: 3600, customer: CUSTOMER })
        : jsonResponse(500, { detail: 'Customer service unavailable' }),
    );
    const user = userEvent.setup();
    renderApp('/login');
    await logIn(user);

    const search = await screen.findByRole('searchbox', { name: /search by customer name/i });
    await user.type(search, 'nobody');
    expect(await screen.findByRole('alert')).toHaveTextContent('Customer service unavailable');
    expect(screen.queryByText('No customer found.')).not.toBeInTheDocument();
  });

  it('preserves session-expiration logout and clears the search input', async () => {
    let resolveCustomer;
    vi.spyOn(globalThis, 'fetch').mockImplementation((url) =>
      url === '/api/auth/login'
        ? jsonResponse(200, { access_token: 'tkn', token_type: 'bearer', expires_in: 3600, customer: CUSTOMER })
        : new Promise((resolve) => {
            resolveCustomer = resolve;
          }),
    );
    const user = userEvent.setup();
    renderApp('/login');
    await logIn(user);

    const search = await screen.findByRole('searchbox', { name: /search by customer name/i });
    await user.type(search, 'nobody');
    resolveCustomer(new Response(JSON.stringify({ detail: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }));

    expect(await screen.findByRole('heading', { name: /log in/i })).toBeInTheDocument();
    expect(screen.queryByRole('searchbox', { name: /search by customer name/i })).not.toBeInTheDocument();
  });

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
