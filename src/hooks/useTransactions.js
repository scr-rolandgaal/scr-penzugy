import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { sampleTransactions, INCOME_CATEGORIES_DEFAULT, EXPENSE_CATEGORIES } from '../data/sampleData';

const TX_KEY = 'scrollers_transactions';
const CAT_KEY = 'scrollers_income_categories';
const EXPENSE_CAT_KEY = 'scrollers_expense_categories';

function localLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function localSave(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// snake_case (Supabase) → camelCase (app)
function fromDb(row) {
  return {
    id: row.id,
    date: row.date,
    type: row.type,
    category: row.category,
    partner: row.partner || '',
    amount: row.amount,
    vatRate: row.vat_rate,
    netAmount: row.net_amount,
    status: row.status,
    notes: row.notes || '',
    projectType: row.project_type || null,
  };
}

// camelCase → snake_case
function toDb(tx) {
  return {
    date: tx.date,
    type: tx.type,
    category: tx.category,
    partner: tx.partner || '',
    amount: tx.amount,
    vat_rate: tx.vatRate,
    net_amount: tx.netAmount,
    status: tx.status,
    notes: tx.notes || '',
    project_type: tx.projectType || null,
  };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState(INCOME_CATEGORIES_DEFAULT);
  const [expenseCategories, setExpenseCategories] = useState(EXPENSE_CATEGORIES);
  const [loading, setLoading] = useState(true);

  // ── Betöltés ────────────────────────────────────────────────
  useEffect(() => {
    if (isSupabaseReady) {
      loadFromSupabase();
    } else {
      console.warn('[useTransactions] OFFLINE MÓD — Supabase nincs konfigurálva, LocalStorage-ból tölt');
      setTransactions(localLoad(TX_KEY, sampleTransactions));
      setIncomeCategories(localLoad(CAT_KEY, INCOME_CATEGORIES_DEFAULT));
      setExpenseCategories(localLoad(EXPENSE_CAT_KEY, EXPENSE_CATEGORIES));
      setLoading(false);
    }
  }, []);

  async function loadFromSupabase() {
    setLoading(true);
    const [txRes, catRes, expCatRes] = await Promise.all([
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('income_categories').select('name'),
      supabase.from('expense_categories').select('name'),
    ]);

    if (txRes.error) console.error('[useTransactions] load error:', txRes.error);
    if (txRes.data) {
      const txs = txRes.data.length > 0
        ? txRes.data.map(fromDb)
        : localLoad(TX_KEY, []);
      setTransactions(txs);
    }

    if (catRes.data && catRes.data.length > 0) {
      setIncomeCategories(catRes.data.map((r) => r.name));
    }

    if (expCatRes.data && expCatRes.data.length > 0) {
      setExpenseCategories(expCatRes.data.map((r) => r.name));
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!loading) localSave(TX_KEY, transactions);
  }, [transactions, loading]);

  // ── Hozzáadás ───────────────────────────────────────────────
  const addTransaction = useCallback(async (tx) => {
    const netAmount = Math.round(tx.amount / (1 + tx.vatRate / 100));
    const newTx = { ...tx, id: crypto.randomUUID(), netAmount };

    if (isSupabaseReady) {
      const { data, error } = await supabase
        .from('transactions')
        .insert([toDb(newTx)])
        .select()
        .single();
      if (error) {
        console.error('[useTransactions] insert error:', error);
        throw new Error(error.message);
      }
      setTransactions((prev) => [fromDb(data), ...prev]);
      return;
    }
    setTransactions((prev) => [newTx, ...prev]);
  }, []);

  // ── Tömeges hozzáadás (import) ──────────────────────────────
  const addTransactions = useCallback(async (txList) => {
    const withIds = txList.map((tx) => {
      const netAmount = Math.round(tx.amount / (1 + tx.vatRate / 100));
      return { ...tx, id: crypto.randomUUID(), netAmount };
    });

    if (isSupabaseReady) {
      const { data, error } = await supabase
        .from('transactions')
        .insert(withIds.map(toDb))
        .select();
      if (error) {
        console.error('[useTransactions] bulk insert error:', error);
        throw new Error(error.message);
      }
      setTransactions((prev) => [...data.map(fromDb), ...prev]);
      return;
    }
    setTransactions((prev) => [...withIds, ...prev]);
  }, []);

  // ── Törlés ──────────────────────────────────────────────────
  const deleteTransaction = useCallback(async (id) => {
    if (isSupabaseReady) {
      await supabase.from('transactions').delete().eq('id', id);
    }
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }, []);

  const deleteTransactions = useCallback(async (ids) => {
    if (isSupabaseReady) {
      await supabase.from('transactions').delete().in('id', ids);
    }
    const set = new Set(ids);
    setTransactions((prev) => prev.filter((tx) => !set.has(tx.id)));
  }, []);

  // ── Szerkesztés ─────────────────────────────────────────────
  const updateTransaction = useCallback(async (id, updates) => {
    setTransactions((prev) => {
      const tx = prev.find((t) => t.id === id);
      if (!tx) return prev;
      const netAmount = Math.round(Number(updates.amount) / (1 + Number(updates.vatRate) / 100));
      const updated = { ...tx, ...updates, netAmount };
      if (isSupabaseReady) {
        supabase.from('transactions').update(toDb(updated)).eq('id', id);
      }
      return prev.map((t) => t.id === id ? updated : t);
    });
  }, []);

  // ── Státusz váltás ──────────────────────────────────────────
  const toggleStatus = useCallback(async (id) => {
    setTransactions((prev) => {
      const updated = prev.map((tx) =>
        tx.id === id
          ? { ...tx, status: tx.status === 'fizetve' ? 'kifizetetlen' : 'fizetve' }
          : tx
      );
      if (isSupabaseReady) {
        const tx = updated.find((t) => t.id === id);
        supabase.from('transactions').update({ status: tx.status }).eq('id', id);
      }
      return updated;
    });
  }, []);

  // ── Bevételi kategória hozzáadás ────────────────────────────
  const addIncomeCategory = useCallback(async (name) => {
    const trimmed = name.trim();
    if (!trimmed || incomeCategories.includes(trimmed)) return;

    if (isSupabaseReady) {
      await supabase.from('income_categories').insert([{ name: trimmed }]);
    }
    setIncomeCategories((prev) => {
      const next = [...prev, trimmed];
      if (!isSupabaseReady) localSave(CAT_KEY, next);
      return next;
    });
  }, [incomeCategories]);

  // ── Kiadási kategória hozzáadás ─────────────────────────────
  const addExpenseCategory = useCallback(async (name) => {
    const trimmed = name.trim();
    if (!trimmed || expenseCategories.includes(trimmed)) return;

    if (isSupabaseReady) {
      await supabase.from('expense_categories').insert([{ name: trimmed }]);
    }
    setExpenseCategories((prev) => {
      const next = [...prev, trimmed];
      if (!isSupabaseReady) localSave(EXPENSE_CAT_KEY, next);
      return next;
    });
  }, [expenseCategories]);

  const resetDemo = useCallback(() => {
    if (!isSupabaseReady) {
      localStorage.removeItem(TX_KEY);
      localStorage.removeItem(CAT_KEY);
      setTransactions(sampleTransactions);
      setIncomeCategories(INCOME_CATEGORIES_DEFAULT);
    }
  }, []);

  return {
    transactions,
    incomeCategories,
    expenseCategories,
    loading,
    addTransaction,
    addTransactions,
    updateTransaction,
    deleteTransaction,
    deleteTransactions,
    toggleStatus,
    addIncomeCategory,
    addExpenseCategory,
    resetDemo,
  };
}
