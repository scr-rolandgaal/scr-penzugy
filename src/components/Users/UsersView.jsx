import { useState } from 'react';
import { useUsers, ROLE_LABELS } from '../../hooks/useUsers';

const ROLE_OPTIONS = ['master_admin', 'admin', 'manager', 'reporter'];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' });
}

function InviteModal({ onClose, onInvite, currentUserRole }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('manager');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const allowedRoles = currentUserRole === 'master_admin'
    ? ROLE_OPTIONS
    : ['manager', 'reporter']; // Admin csak ezeket hívhatja

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await onInvite(email.trim(), role);
    setLoading(false);
    if (error) { setErr(error); return; }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Felhasználó meghívása</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Email cím</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pelda@ceg.hu"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Szerepkör</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {allowedRoles.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
          {err && <p className="text-sm text-red-500">{err}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100">
              Mégse
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm text-white font-semibold disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #7B5CF6, #5A3FD6)' }}
            >
              {loading ? 'Küldés...' : 'Meghívó küldése'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const ROLE_BADGE_COLORS = {
  master_admin: { bg: '#FAF5FF', border: '#DDD6FE', text: '#6C3FC5' },
  admin: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
  manager: { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D' },
  reporter: { bg: '#F9FAFB', border: '#E5E7EB', text: '#6B7280' },
};

export default function UsersView({ userRole }) {
  const { users, usersLoading, error, inviteUser, updateRole, removeUser } = useUsers(userRole);
  const [showInvite, setShowInvite] = useState(false);

  const canEditRole = (targetRole) => {
    if (userRole === 'master_admin') return true;
    if (userRole === 'admin') return targetRole !== 'master_admin' && targetRole !== 'admin';
    return false;
  };

  async function handleRemove(userId, targetRole) {
    if (!canEditRole(targetRole)) return;
    if (!window.confirm('Biztosan törlöd ezt a felhasználót?')) return;
    const { error: err } = await removeUser(userId);
    if (err) alert(err);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Felhasználók</h2>
        <button
          onClick={() => setShowInvite(true)}
          className="btn-primary text-sm"
        >
          + Felhasználó meghívása
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">{error}</div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {['User ID', 'Szerepkör', 'Létrehozva', ''].map((h) => (
                <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usersLoading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-400 text-sm">Betöltés...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-400 text-sm">
                  Nincsenek felhasználók a user_roles táblában.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const colors = ROLE_BADGE_COLORS[u.role] || ROLE_BADGE_COLORS.reporter;
                const editable = canEditRole(u.role);
                return (
                  <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-xs text-gray-400 font-mono">{u.user_id.slice(0, 8)}…</td>
                    <td className="py-3 px-4">
                      {editable ? (
                        <select
                          value={u.role}
                          onChange={(e) => updateRole(u.user_id, e.target.value)}
                          className="text-xs px-2 py-1 rounded-lg border font-semibold focus:outline-none"
                          style={{ background: colors.bg, borderColor: colors.border, color: colors.text }}
                        >
                          {(userRole === 'master_admin' ? ROLE_OPTIONS : ['manager', 'reporter']).map((r) => (
                            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="text-xs px-2 py-1 rounded-lg border font-semibold"
                          style={{ background: colors.bg, borderColor: colors.border, color: colors.text }}
                        >
                          {ROLE_LABELS[u.role]}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{formatDate(u.created_at)}</td>
                    <td className="py-3 px-4 text-right">
                      {editable && (
                        <button
                          onClick={() => handleRemove(u.user_id, u.role)}
                          className="text-xs text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer"
                        >
                          Törlés
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onInvite={inviteUser}
          currentUserRole={userRole}
        />
      )}
    </div>
  );
}
