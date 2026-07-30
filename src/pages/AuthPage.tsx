import { useState, type FormEvent } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { TextField } from '../components/forms/PropertyEditor';
import type { Data, DriverProfile } from '../types';

type AuthPageProps = {
  data: Data;
  register: (email: string, password: string, profile: DriverProfile) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
};

export function AuthPage({ data, register, login }: AuthPageProps) {
  return data.authentication.account ? (
    <LoginForm email={data.authentication.account.email} login={login} />
  ) : (
    <RegistrationForm data={data} register={register} />
  );
}

type LoginFormProps = {
  email: string;
  login: (email: string, password: string) => Promise<void>;
};

export function LoginForm({ email: accountEmail, login }: LoginFormProps) {
  const [email, setEmail] = useState(accountEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <form className="auth-card auth-card-compact" onSubmit={submit}>
        <div className="auth-icon"><LockKeyhole size={28} /></div>
        <span className="eyebrow">WELCOME BACK</span>
        <h1>Sign in to Media Factory</h1>
        <p>Your driver profile and saved graphics are ready on this browser.</p>
        <div className="auth-fields">
          <TextField
            label="Email address"
            type="email"
            value={email}
            autoComplete="email"
            onChange={setEmail}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={setPassword}
          />
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary wide auth-submit" disabled={busy || !email || !password}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="auth-browser-note">
          This version keeps your account and work on this browser.
        </p>
      </form>
    </AuthShell>
  );
}

type RegistrationFormProps = {
  data: Data;
  register: (email: string, password: string, profile: DriverProfile) => Promise<void>;
};

export function RegistrationForm({ data, register }: RegistrationFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmedName, setConfirmedName] = useState(false);
  const [profile, setProfile] = useState<DriverProfile>({
    ...data.profile,
    nameLocked: false,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const valid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    password.length >= 8 &&
    password === confirmPassword &&
    Boolean(profile.name.trim()) &&
    confirmedName;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    setBusy(true);
    setError('');
    try {
      await register(email, password, profile);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Registration failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <form className="auth-card auth-register-card" onSubmit={submit}>
        <div className="auth-heading">
          <div className="auth-icon"><ShieldCheck size={28} /></div>
          <div>
            <span className="eyebrow">CREATE YOUR ACCOUNT</span>
            <h1>Set up Media Factory</h1>
            <p>
              Create your login, then confirm the driver name used across every template.
              {data.onboardingComplete && ' Your existing graphics and settings will be kept.'}
            </p>
          </div>
        </div>

        <div className="auth-section">
          <div className="auth-step"><span>1</span><div><b>Account login</b><small>Your returning sign-in details</small></div></div>
          <div className="form-grid auth-account-grid">
            <TextField
              label="Email address"
              type="email"
              value={email}
              autoComplete="email"
              placeholder="you@example.com"
              onChange={setEmail}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              onChange={setPassword}
            />
            <TextField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              autoComplete="new-password"
              onChange={setConfirmPassword}
            />
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="form-error">Passwords do not match.</p>
          )}
        </div>

        <div className="auth-section">
          <div className="auth-step"><span>2</span><div><b>Driver name</b><small>Used automatically in your graphics</small></div></div>
          <div className="auth-name-field">
            <TextField
              label="Driver name"
              value={profile.name}
              autoComplete="name"
              onChange={name => setProfile({ ...profile, name })}
            />
          </div>
          <label className="name-confirmation">
            <input
              type="checkbox"
              checked={confirmedName}
              onChange={event => setConfirmedName(event.target.checked)}
            />
            <span>
              I confirm <b>{profile.name.trim() || 'this driver name'}</b> is correct. The driver
              name cannot be changed after registration.
            </span>
          </label>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary wide auth-submit" disabled={!valid || busy}>
          {busy ? 'Creating account…' : 'Create account and continue'}
        </button>
        <p className="auth-browser-note">
          This version keeps your account and work on this browser.
        </p>
      </form>
    </AuthShell>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="logo large">
          <span>MF</span>
          <div>
            <b>MEDIA FACTORY</b>
            <small>DRIVER GRAPHICS</small>
          </div>
        </div>
        <div className="auth-brand-copy">
          <span className="eyebrow">YOUR RACING. YOUR BRAND.</span>
          <h2>Professional race graphics, built around one driver.</h2>
          <p>Set your profile once and keep every design consistent.</p>
        </div>
      </div>
      <div className="auth-form-panel">{children}</div>
    </div>
  );
}
