import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import FormField from '../components/FormField';
import { validateLogin } from '../utils/validation';

export default function LoginPage() {
  const location = useLocation();
  const registeredEmail = location.state?.registeredEmail;
  const [values, setValues] = useState({ email: registeredEmail || '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    const validation = validateLogin(values);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setSubmitting(true);
    try {
      await login({ email: values.email.trim(), password: values.password });
      navigate(location.state?.from || '/customer', { replace: true });
    } catch (err) {
      setFormError(err.status === 401 ? 'Invalid email or password.' : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card">
      <h1>Log in</h1>
      {registeredEmail && !formError && (
        <div className="alert alert-success" role="status">
          Registration successful. Please log in.
        </div>
      )}
      {formError && (
        <div className="alert alert-error" role="alert">
          {formError}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <FormField id="email" label="Email" type="email" value={values.email} onChange={update('email')} error={errors.email} autoComplete="email" required />
        <FormField id="password" label="Password" type="password" value={values.password} onChange={update('password')} error={errors.password} autoComplete="current-password" required />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="muted">
        New customer? <Link to="/register">Create an account</Link>
      </p>
    </section>
  );
}
