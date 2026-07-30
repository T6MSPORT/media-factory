import { useState, type FormEvent } from 'react';
import { CheckCircle2, Cloud, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import { TextField } from '../components/forms/PropertyEditor';
import type { Data, DriverProfile } from '../types';

type AuthPageProps = {
  data: Data;
  authError?: string;
  passwordRecovery?: boolean;
  register: (email: string, password: string, profile: DriverProfile) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  saveRecoveredPassword: (password: string) => Promise<void>;
};

export function AuthPage({
  data,
  authError,
  passwordRecovery,
  register,
  login,
  resendConfirmation,
  resetPassword,
  saveRecoveredPassword,
}: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>(
    data.authentication.account || data.authentication.lastEmail ? 'login' : 'register',
  );
  const [confirmationDismissed, setConfirmationDismissed] = useState(false);

  if (passwordRecovery) {
    return <ResetPasswordForm savePassword={saveRecoveredPassword} />;
  }

  if (data.authentication.pendingEmailConfirmation && !confirmationDismissed) {
    return (
      <ConfirmationForm
        email={data.authentication.account?.email || data.authentication.lastEmail || ''}
        resendConfirmation={resendConfirmation}
        showLogin={() => {
          setConfirmationDismissed(true);
          setMode('login');
        }}
      />
    );
  }

  return mode === 'login' ? (
    <LoginForm
      email={data.authentication.account?.email || data.authentication.lastEmail || ''}
      authError={authError}
      login={login}
      resetPassword={resetPassword}
      showRegistration={() => setMode('register')}
    />
  ) : (
    <RegistrationForm
      data={data}
      authError={authError}
      register={register}
      showLogin={() => setMode('login')}
    />
  );
}

type LoginFormProps = {
  email: string;
  authError?: string;
  login: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  showRegistration: () => void;
};

export function LoginForm({
  email: accountEmail,
  authError,
  login,
  resetPassword,
  showRegistration,
}: LoginFormProps) {
  const [email, setEmail] = useState(accountEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
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

  const forgotPassword = async () => {
    if (!email.trim()) {
      setError('Enter your email address first.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await resetPassword(email);
      setNotice('Password reset email sent. Check your inbox.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Reset email could not be sent.');
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
        <p>Your account works on any device.</p>
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
        {(error || authError) && <p className="form-error" role="alert">{error || authError}</p>}
        {notice && <p className="form-notice" role="status">{notice}</p>}
        <button className="primary wide auth-submit" disabled={busy || !email || !password}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <button type="button" className="auth-text-button" onClick={forgotPassword} disabled={busy}>
          Forgot password?
        </button>
        <p className="auth-switch">
          New to Media Factory?{' '}
          <button type="button" onClick={showRegistration}>Create an account</button>
        </p>
      </form>
    </AuthShell>
  );
}

type RegistrationFormProps = {
  data: Data;
  authError?: string;
  register: (email: string, password: string, profile: DriverProfile) => Promise<void>;
  showLogin?: () => void;
};

export function RegistrationForm({
  data,
  authError,
  register,
  showLogin,
}: RegistrationFormProps) {
  const [email, setEmail] = useState(
    data.authentication.lastEmail || data.authentication.account?.email || '',
  );
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
            <span className="eyebrow">CREATE YOUR CLOUD ACCOUNT</span>
            <h1>Set up Media Factory</h1>
            <p>
              Create your login, then confirm the driver name used across every template.
              {data.onboardingComplete && ' Your existing work on this device will be kept.'}
            </p>
          </div>
        </div>

        <div className="auth-section">
          <div className="auth-step"><span>1</span><div><b>Account login</b><small>Use it on any device</small></div></div>
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

        {(error || authError) && <p className="form-error" role="alert">{error || authError}</p>}
        <button className="primary wide auth-submit" disabled={!valid || busy || Boolean(authError)}>
          {busy ? 'Creating account…' : 'Create account and continue'}
        </button>
        {showLogin && (
          <p className="auth-switch">
            Already registered? <button type="button" onClick={showLogin}>Sign in</button>
          </p>
        )}
      </form>
    </AuthShell>
  );
}

export function ConfirmationForm({
  email,
  resendConfirmation,
  showLogin,
}: {
  email: string;
  resendConfirmation: (email: string) => Promise<void>;
  showLogin: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const resend = async () => {
    setBusy(true);
    setNotice('');
    setError('');
    try {
      await resendConfirmation(email);
      setNotice('Confirmation email resent. Check your inbox and spam folder.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Confirmation email could not be sent.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <div className="auth-card auth-card-compact">
        <div className="auth-icon auth-icon-success"><CheckCircle2 size={28} /></div>
        <span className="eyebrow">ONE LAST STEP</span>
        <h1>Confirm your email</h1>
        <p>
          We’ve sent a confirmation link to <b>{email}</b>. Open it to activate your cloud
          account. You won’t be able to sign in until the email is confirmed.
        </p>
        {notice && <p className="form-notice" role="status">{notice}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button
          type="button"
          className="primary wide auth-submit"
          onClick={resend}
          disabled={busy}
        >
          {busy ? 'Sending…' : 'Resend confirmation email'}
        </button>
        <button type="button" className="auth-text-button" onClick={showLogin}>
          I’ve confirmed my email — sign in
        </button>
      </div>
    </AuthShell>
  );
}

function ResetPasswordForm({
  savePassword,
}: {
  savePassword: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 8 || password !== confirmPassword) return;
    setBusy(true);
    setError('');
    try {
      await savePassword(password);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Password could not be updated.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <form className="auth-card auth-card-compact" onSubmit={submit}>
        <div className="auth-icon"><KeyRound size={28} /></div>
        <span className="eyebrow">ACCOUNT RECOVERY</span>
        <h1>Choose a new password</h1>
        <div className="auth-fields">
          <TextField
            label="New password"
            type="password"
            value={password}
            autoComplete="new-password"
            onChange={setPassword}
          />
          <TextField
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={setConfirmPassword}
          />
        </div>
        {confirmPassword && password !== confirmPassword && (
          <p className="form-error">Passwords do not match.</p>
        )}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button
          className="primary wide auth-submit"
          disabled={busy || password.length < 8 || password !== confirmPassword}
        >
          {busy ? 'Saving…' : 'Save new password'}
        </button>
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
          <Cloud size={34} aria-hidden="true" />
          <span className="eyebrow">YOUR RACING. YOUR BRAND.</span>
          <h2>Professional race graphics, wherever you sign in.</h2>
          <p>One secure account. One permanent driver identity. Any device.</p>
        </div>
      </div>
      <div className="auth-form-panel">{children}</div>
    </div>
  );
}
