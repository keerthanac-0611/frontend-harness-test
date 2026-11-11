import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerCustomer } from '../api/customerApi.js';
import FormField from '../components/FormField.jsx';
import { validateRegistration } from '../utils/validation.js';

const INITIAL = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '', address: '' };

export default function RegisterPage() {
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const update = (field) => (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    const validation = validateRegistration(values);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setSubmitting(true);
    try {
      await registerCustomer(values);
      navigate('/login', { state: { registeredEmail: values.email.trim().toLowerCase() } });
    } catch (err) {
      setErrors(err.fieldErrors || {});
      setFormError(err.status === 409 ? 'An account with this email already exists.' : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card">
      <h1>Create your account</h1>
      {formError && (
        <div className="alert alert-error" role="alert">
          {formError}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <FormField id="first_name" label="First name" value={values.firstName} onChange={update('firstName')} error={errors.first_name} autoComplete="given-name" required />
        <FormField id="last_name" label="Last name" value={values.lastName} onChange={update('lastName')} error={errors.last_name} autoComplete="family-name" required />
        <FormField id="email" label="Email" type="email" value={values.email} onChange={update('email')} error={errors.email} autoComplete="email" required />
        <FormField id="password" label="Password" type="password" value={values.password} onChange={update('password')} error={errors.password} autoComplete="new-password" required />
        <FormField id="confirm_password" label="Confirm password" type="password" value={values.confirmPassword} onChange={update('confirmPassword')} error={errors.confirm_password} autoComplete="new-password" required />
        <FormField id="phone" label="Phone" type="tel" value={values.phone} onChange={update('phone')} error={errors.phone} autoComplete="tel" />
        <FormField id="address" label="Address" value={values.address} onChange={update('address')} error={errors.address} autoComplete="street-address" />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Registering…' : 'Register'}
        </button>
      </form>
      <p className="muted">
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </section>
  );
}
