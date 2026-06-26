import React, { useState } from 'react';
import { useAuth } from '../App';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.login(email, password);
      if (res.success) {
        login(res.user, res.token);
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the authentication server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bright px-margin-mobile relative overflow-hidden">
      {/* Decorative luxury abstract lines */}
      <div className="absolute top-0 right-0 w-96 h-96 border border-brand-gold/10 rounded-full translate-x-24 -translate-y-24 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] border border-brand-gold/5 rounded-full -translate-x-48 translate-y-48 pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-outline-variant/30 p-10 relative z-10">
        {/* Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-brand-gold"></div>

        <div className="text-center space-y-3 mb-10">
          <Link to="/" className="inline-block font-headline-sm text-headline-sm text-on-surface hover:text-brand-gold transition-colors duration-300">
            Vivek Jhabak & Associates
          </Link>
          <p className="font-label-sm text-label-sm uppercase tracking-widest text-brand-gold">
            Administrative Login
          </p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container p-4 mb-6 font-body-md text-sm border-l-4 border-error flex items-start gap-2">
            <span className="material-symbols-outlined text-error text-[18px]">error</span>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant block">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@vivekjhabak.com"
              className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-3 focus:ring-0 focus:border-brand-gold transition-colors font-body-md"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-3 focus:ring-0 focus:border-brand-gold transition-colors font-body-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-gold text-white py-4 font-label-md text-label-md uppercase tracking-[0.2em] hover:shadow-xl transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verifying Credentials...
              </>
            ) : (
              'Access Dashboard'
            )}
          </button>
        </form>

        <div className="text-center mt-8">
          <Link to="/" className="text-xs font-label-sm text-on-surface-variant hover:text-brand-gold transition-colors uppercase tracking-wider">
            ← Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
}
