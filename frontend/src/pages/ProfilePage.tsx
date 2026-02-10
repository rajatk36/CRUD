import { FormEvent, useState } from 'react';
import { useAuth } from '../state/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const ProfilePage = () => {
  const { user, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handlePasswordChangeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/profile/me/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token') ?? ''}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setPasswordError(data.message || 'Failed to update password.');
        return;
      }

      setPasswordSuccess(data.message || 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <h1 className="text-lg font-semibold text-slate-900">Profile</h1>
          <p className="text-xs text-slate-500">
            Manage your basic details and update your password.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <section className="rounded-xl bg-white p-4 shadow-sm border border-slate-100 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Account details</h2>
            <div className="space-y-1 text-xs">
              <div className="flex gap-4">
                <span className="text-slate-500">Name</span>
                <span className="font-medium text-slate-800">{user?.name}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-800 break-all">{user?.email}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
          >
            Logout
          </button>
        </section>

        <section className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Change password</h2>
          {passwordError && (
            <div className="mb-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="mb-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
              {passwordSuccess}
            </div>
          )}
          <form onSubmit={handlePasswordChangeSubmit} className="space-y-2" noValidate>
            <div className="space-y-1">
              <label
                className="block text-[11px] font-medium text-slate-700"
                htmlFor="current-password"
              >
                Current password
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700" htmlFor="new-password">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label
                className="block text-[11px] font-medium text-slate-700"
                htmlFor="confirm-password"
              >
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div className="pt-1">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-slate-800"
              >
                Update password
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;


