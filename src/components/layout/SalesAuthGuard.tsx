'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Lock, LogOut, Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';
import { apiFetch } from '@/lib/api-client';

type AccessState = 'checking' | 'allowed' | 'denied';

export function SalesAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, signInWithEmail, signInWithGoogle, logout } = useAuth();
  const [access, setAccess] = useState<AccessState>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  // Ask the backend whether this account is on the sales allowlist.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setAccess('checking');
    apiFetch<{ email: string }>('/api/sales/me')
      .then(() => !cancelled && setAccess('allowed'))
      .catch((err: Error) => {
        if (cancelled) return;
        const forbidden = /forbidden|unauthorized|not authorized/i.test(err.message);
        setAccess(forbidden ? 'denied' : 'allowed');
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading || (user && access === 'checking')) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    const handleEmailSignIn = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError('');
      setSubmitting(true);
      try {
        await signInWithEmail(email, password);
      } catch (err: any) {
        setAuthError(err.message || 'Invalid email or password');
      } finally {
        setSubmitting(false);
      }
    };

    const handleGoogleSignIn = async () => {
      setAuthError('');
      setSubmitting(true);
      try {
        await signInWithGoogle();
      } catch (err: any) {
        if (err.code !== 'auth/popup-closed-by-user') {
          setAuthError(err.message || 'Google sign-in failed');
        }
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="flex-1 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              FITT<span className="text-amber-500">ROCK</span> Sales Cockpit
            </h1>
            <p className="text-xs text-zinc-400">Sign in with your Fittrock sales account.</p>
          </div>

          {authError && (
            <div className="bg-red-950/50 border border-red-800/60 text-red-300 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all disabled:opacity-60"
          >
            Sign In with Google
          </button>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@fittrock.com"
                aria-label="Email"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                aria-label="Password"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black py-3.5 rounded-xl text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Sign In</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (access === 'denied') {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-red-900/50 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <ShieldAlert className="w-10 h-10 text-red-500 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Access Denied</h1>
            <p className="text-sm text-zinc-400">
              <span className="font-mono text-zinc-200 break-all">{user.email}</span> is not on the sales team list.
              Ask an admin to add it.
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3.5 rounded-xl text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign in with another account</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
