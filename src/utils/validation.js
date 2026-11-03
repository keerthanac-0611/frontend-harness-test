// Client-side validation for fast UI feedback. The backend remains the source of truth for business rules.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\- ]{6,19}$/;

export function validatePassword(password) {
  if (!password || password.length < 8) return 'Password must be at least 8 characters long';
  if (password.length > 128) return 'Password must be at most 128 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a digit';
  return null;
}

export function validateRegistration(values) {
  const errors = {};
  if (!values.firstName?.trim()) errors.first_name = 'First name is required';
  else if (values.firstName.length > 50) errors.first_name = 'First name must be at most 50 characters';
  if (!values.lastName?.trim()) errors.last_name = 'Last name is required';
  else if (values.lastName.length > 50) errors.last_name = 'Last name must be at most 50 characters';
  if (!EMAIL_PATTERN.test(values.email || '')) errors.email = 'Enter a valid email address';
  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;
  if (values.password !== values.confirmPassword) errors.confirm_password = 'Passwords do not match';
  if (values.phone && !PHONE_PATTERN.test(values.phone.trim())) errors.phone = 'Enter a valid phone number';
  if (values.address && values.address.length > 200) errors.address = 'Address must be at most 200 characters';
  return errors;
}

export function validateLogin(values) {
  const errors = {};
  if (!EMAIL_PATTERN.test(values.email || '')) errors.email = 'Enter a valid email address';
  if (!values.password) errors.password = 'Password is required';
  return errors;
}
