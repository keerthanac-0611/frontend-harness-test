import { describe, expect, it } from 'vitest';
import { validateLogin, validatePassword, validateRegistration } from '../utils/validation';

const valid = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  password: 'Str0ngPass',
  confirmPassword: 'Str0ngPass',
  phone: '+1 555-0100',
  address: '',
};

describe('validation', () => {
  it('accepts a valid registration', () => {
    expect(validateRegistration(valid)).toEqual({});
  });

  it('flags missing names, bad email, mismatched passwords and bad phone', () => {
    const errors = validateRegistration({ ...valid, firstName: ' ', email: 'x', confirmPassword: 'nope', phone: 'abc' });
    expect(Object.keys(errors).sort()).toEqual(['confirm_password', 'email', 'first_name', 'phone']);
  });

  it.each(['short1A', 'alllowercase1', 'ALLUPPERCASE1', 'NoDigitsHere'])('rejects weak password %s', (pw) => {
    expect(validatePassword(pw)).not.toBeNull();
  });

  it('requires login email and password', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: 'Enter a valid email address',
      password: 'Password is required',
    });
  });
});
