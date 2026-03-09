import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    // Service-role client a user adminhoz
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Caller azonosítása JWT-vel
    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: corsHeaders });
    }

    // Caller szerepkörének ellenőrzése
    const { data: callerRoleRow } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .maybeSingle();

    const callerRole = callerRoleRow?.role ?? 'reporter';
    if (callerRole !== 'master_admin' && callerRole !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: insufficient role' }), { status: 403, headers: corsHeaders });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'invite') {
      const { email, role } = body;
      if (!email || !role) {
        return new Response(JSON.stringify({ error: 'email és role kötelező' }), { status: 400, headers: corsHeaders });
      }

      // Admin csak manager/reporter-t hívhat meg
      if (callerRole === 'admin' && (role === 'master_admin' || role === 'admin')) {
        return new Response(JSON.stringify({ error: 'Admin nem adhat master_admin/admin szerepkört' }), { status: 403, headers: corsHeaders });
      }

      const { data: inviteData, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(email);
      if (inviteErr) {
        return new Response(JSON.stringify({ error: inviteErr.message }), { status: 400, headers: corsHeaders });
      }

      // user_roles sor létrehozása
      await adminClient.from('user_roles').insert({
        user_id: inviteData.user.id,
        role,
        created_by: caller.id,
      });

      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    if (action === 'remove') {
      const { userId } = body;
      if (!userId) {
        return new Response(JSON.stringify({ error: 'userId kötelező' }), { status: 400, headers: corsHeaders });
      }

      // Ellenőrzés: admin nem törölhet admint/master_admint
      if (callerRole === 'admin') {
        const { data: targetRole } = await adminClient
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();
        if (targetRole?.role === 'master_admin' || targetRole?.role === 'admin') {
          return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
        }
      }

      const { error: deleteErr } = await adminClient.auth.admin.deleteUser(userId);
      if (deleteErr) {
        return new Response(JSON.stringify({ error: deleteErr.message }), { status: 400, headers: corsHeaders });
      }

      // user_roles sor CASCADE-del törlődik automatikusan

      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Ismeretlen action' }), { status: 400, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
