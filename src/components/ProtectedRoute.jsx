import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isFirebaseConfigured } from '../firebase/config';

export default function ProtectedRoute({ children, loginPath = '/speech-training/login' }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (!isFirebaseConfigured) {
    return (
      <div className="speakly-app flex min-h-screen items-center justify-center bg-white p-6 font-speakly text-taskly-ink">
        <div className="max-w-md rounded-3xl border border-taskly-border bg-white p-8 text-center shadow-card">
          <h1 className="text-2xl font-bold">Firebase required</h1>
          <p className="mt-3 text-base text-taskly-muted">
            Speak With Intention needs Firebase configured in your environment. Copy{' '}
            <code className="text-sm">.env.example</code> to <code className="text-sm">.env</code>{' '}
            and add your project credentials.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="speakly-app flex min-h-screen items-center justify-center bg-white font-speakly text-lg text-taskly-muted">
        Checking your account…
      </div>
    );
  }

  if (!user) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return children;
}
