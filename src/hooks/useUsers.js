import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseReady } from '../lib/supabase';

const ROLES_ORDER = { master_admin: 0, admin: 1, manager: 2, reporter: 3 };

const ROLE_LABELS = {
  master_admin: 'Master Admin',
  admin: 'Admin',
  manager: 'Kezelő',
  reporter: 'Riport Felhasználó',
};

export { ROLE_LABELS };

export function useUsers(currentUserRole) {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!isSupabaseReady) { setUsersLoading(false); return; }
    setUsersLoading(true);

    // user_roles táblából + auth.users email-je Edge Function-ön keresztül
    const { data, error: err } = await supabase
      .from('user_roles')
      .select('id, user_id, role, created_at')
      .order('created_at', { ascending: true });

    if (err) { setError(err.message); setUsersLoading(false); return; }
    setUsers(data || []);
    setUsersLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const inviteUser = useCallback(async (email, role) => {
    if (!isSupabaseReady) return { error: 'Supabase nem elérhető' };

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'invite', email, role }),
    });

    const json = await res.json();
    if (!res.ok) return { error: json.error || 'Ismeretlen hiba' };
    await load();
    return { error: null };
  }, [load]);

  const updateRole = useCallback(async (userId, newRole) => {
    if (!isSupabaseReady) return;

    // Admin csak Kezelőt/Riport Usert kezelhet
    if (currentUserRole === 'admin' && (newRole === 'master_admin' || newRole === 'admin')) return;

    await supabase.from('user_roles').update({ role: newRole }).eq('user_id', userId);
    setUsers((prev) => prev.map((u) => u.user_id === userId ? { ...u, role: newRole } : u));
  }, [currentUserRole]);

  const removeUser = useCallback(async (userId) => {
    if (!isSupabaseReady) return { error: 'Supabase nem elérhető' };

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'remove', userId }),
    });

    const json = await res.json();
    if (!res.ok) return { error: json.error || 'Ismeretlen hiba' };
    setUsers((prev) => prev.filter((u) => u.user_id !== userId));
    return { error: null };
  }, []);

  return { users, usersLoading, error, inviteUser, updateRole, removeUser, reload: load, ROLE_LABELS };
}
