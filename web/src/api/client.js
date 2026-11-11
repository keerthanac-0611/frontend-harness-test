const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(status, message, fieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// FastAPI returns `detail` as a string or as a list of {loc, msg} validation errors.
function parseErrorBody(status, body) {
  const detail = body && body.detail;
  if (Array.isArray(detail)) {
    const fieldErrors = {};
    detail.forEach((item) => {
      const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : 'form';
      fieldErrors[field] = String(item.msg || 'Invalid value').replace(/^Value error, /, '');
    });
    return new ApiError(status, 'Please correct the highlighted fields.', fieldErrors);
  }
  if (typeof detail === 'string') {
    return new ApiError(status, detail);
  }
  return new ApiError(status, `Request failed with status ${status}`);
}

export async function request(method, path, { body, token } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Unable to reach the server. Please try again later.');
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  if (!response.ok) throw parseErrorBody(response.status, data);
  return data;
}
