import { useEffect, useMemo, useState } from 'react';
import type { Container, Theme } from './settings/types';
import { GoYanaApp } from './components/generated/GoYanaApp';
import { GoYanaDriverApp } from './components/generated/GoYanaDriverApp';
import { GoYanaAdminApp } from './components/generated/GoYanaAdminApp';

// ✅ CHANGE THIS IMPORT PATH IF YOUR FILE IS SOMEWHERE ELSE
import { supabase } from './lib/supabaseClient';

let theme: Theme = 'light';
let container: Container = 'none';

type Role = 'customer' | 'driver' | 'admin';

function setTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export default function App() {
  // Auth state
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Login UI state
  const [selectedRole, setSelectedRole] = useState<Role>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  // Apply theme once
  useEffect(() => {
    setTheme(theme);
  }, []);

  // Load session + watch auth changes
  useEffect(() => {
    let mounted = true;

    async function init() {
      setLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) {
        setAuthError(error.message);
        setLoading(false);
        return;
      }

      const session = data.session;
      if (!session?.user) {
        setUserId(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUserId(session.user.id);

      // fetch role from profiles
      await loadOrCreateProfileRole(session.user.id);
      setLoading(false);
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      setLoading(true);
      setAuthError(null);

      if (!session?.user) {
        setUserId(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUserId(session.user.id);
      await loadOrCreateProfileRole(session.user.id);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loads role from profiles table.
  // If profile is missing, create it using selectedRole.
  async function loadOrCreateProfileRole(uid: string) {
    // Try fetch
    const { data: profile, error: fetchErr } = await supabase
      .from('profiles')
      .select('id, role, name')
      .eq('id', uid)
      .maybeSingle();

    // If table/permission issue, show error
    if (fetchErr) {
      setAuthError(fetchErr.message);
      setRole(null);
      return;
    }

    // If no profile row yet, create one
    if (!profile) {
      const { error: insertErr } = await supabase.from('profiles').insert({
        id: uid,
        role: selectedRole, // ✅ role chosen on login screen
        name: email ? email.split('@')[0] : null,
      });

      if (insertErr) {
        setAuthError(insertErr.message);
        setRole(null);
        return;
      }

      setRole(selectedRole);
      return;
    }

    // If exists but role missing, set it
    if (!profile.role) {
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ role: selectedRole })
        .eq('id', uid);

      if (updateErr) {
        setAuthError(updateErr.message);
        setRole(null);
        return;
      }

      setRole(selectedRole);
      return;
    }

    // Normal case
    setRole(profile.role as Role);
  }

  async function handleLogin() {
    setAuthBusy(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      const uid = data.user?.id;
      if (!uid) {
        setAuthError('Login succeeded but no user returned.');
        return;
      }

      setUserId(uid);
      await loadOrCreateProfileRole(uid);
    } finally {
      setAuthBusy(false);
      setLoading(false);
    }
  }

  async function handleSignUp() {
    setAuthBusy(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      const uid = data.user?.id;
      // Depending on your Supabase settings, the user may need email confirmation.
      // If confirmation is ON, there may be no session yet.
      if (!uid) {
        setAuthError('Signup created. Check your email to confirm, then login.');
        return;
      }

      setUserId(uid);
      await loadOrCreateProfileRole(uid);
    } finally {
      setAuthBusy(false);
      setLoading(false);
    }
  }

  async function handleLogout() {
    setAuthBusy(true);
    setAuthError(null);
    await supabase.auth.signOut();
    setAuthBusy(false);
    setRole(null);
    setUserId(null);
  }

  const generatedComponent = useMemo(() => {
    if (loading) return <div className="p-6">Loading...</div>;

    if (!userId) {
      // ✅ Role-based login screen (no top switch in the app UI)
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <h1 className="text-2xl font-bold mb-2">Log in to GoYana</h1>
            <p className="text-sm text-gray-600 mb-6">
              Choose a role and log in. Your role is saved in <code>profiles</code>.
            </p>

            <label className="block text-sm font-semibold mb-2">Role</label>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSelectedRole('customer')}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold border ${
                  selectedRole === 'customer'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('driver')}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold border ${
                  selectedRole === 'driver'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                Driver
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold border ${
                  selectedRole === 'admin'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                Admin
              </button>
            </div>

            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded-xl border border-gray-200"
              placeholder="you@email.com"
              autoComplete="email"
            />

            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded-xl border border-gray-200"
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
            />

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
                {authError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleLogin}
                disabled={authBusy || !email || !password}
                className="flex-1 px-4 py-2 rounded-xl bg-green-600 text-white font-bold disabled:opacity-60"
              >
                {authBusy ? 'Working…' : 'Log In'}
              </button>

              <button
                type="button"
                onClick={handleSignUp}
                disabled={authBusy || !email || !password}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-900 text-white font-bold disabled:opacity-60"
              >
                {authBusy ? 'Working…' : 'Sign Up'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!role) return <div className="p-6">Loading role…</div>;

    if (role === 'customer') return <GoYanaApp />;
    if (role === 'driver') return <GoYanaDriverApp />;
    if (role === 'admin') return <GoYanaAdminApp />;

    return <div className="p-6">Invalid role</div>;
  }, [loading, role, userId, authError, authBusy, email, password, selectedRole]);

  // Container wrapper (keep your existing behavior)
  if (container === 'centered') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        {generatedComponent}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Optional: quick logout button during testing */}
      {userId && (
        <button
          onClick={handleLogout}
          className="fixed bottom-4 right-4 z-[200] px-4 py-2 rounded-xl bg-black text-white text-sm font-bold shadow-lg"
        >
          Log Out
        </button>
      )}
      {generatedComponent}
    </div>
  );
}
