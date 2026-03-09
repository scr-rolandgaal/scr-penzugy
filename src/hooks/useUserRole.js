import { useState, useEffect } from 'react';
import { supabase, isSupabaseReady } from '../lib/supabase';

export function useUserRole(user) {
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserRole(null);
      setRoleLoading(false);
      return;
    }

    if (!isSupabaseReady) {
      // Dev/demo fallback: full access
      setUserRole('master_admin');
      setRoleLoading(false);
      return;
    }

    async function loadRole() {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setUserRole(data.role);
      } else {
        // Ha nincs sor → master_admin (első bejelentkező)
        setUserRole('master_admin');
      }
      setRoleLoading(false);
    }

    loadRole();
  }, [user]);

  const canEdit = userRole === 'master_admin' || userRole === 'admin' || userRole === 'manager';
  const canManageUsers = userRole === 'master_admin' || userRole === 'admin';
  const canManageCategories = userRole === 'master_admin' || userRole === 'admin';

  return { userRole, roleLoading, canEdit, canManageUsers, canManageCategories };
}
