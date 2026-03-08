import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { sampleTransactions, INCOME_CATEGORIES_DEFAULT } from '../data/sampleData';

const TX_KEY = 'scrollers_transactions';
const CAT_KEY = 'scrollers_income_categories';

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
  };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState(INCOME_CATEGORIES_DEFAULT);
  const [loading, setLoading] = useState(true);

  // ── Betöltés ────────────────────────────────────────────────
  useEffect(() => {
    if (isSupabaseReady) {
      loadFromSupabase();
    } else {
      setTransactions(localLoad(TX_KEY, sampleTransactions));
      setIncomeCategories(localLoad(CAT_KEY, INCOME_CATEGORIES_DEFAULT));
      setLoading(false);
    }
  }, []);

  async function loadFromSupabase() {
    setLoading(true);
    const [txRes, catRes] = await Promise.all([
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('income_categories').select('name'),
    ]);

    if (txRes.data) {
      const txs = txRes.data.length > 0 ? txRes.data.map(fromDb) : sampleTransactions;
      setTransactions(txs);
      localSave(TX_KEY, txs); // offline cache
    }

    if (catRes.data && catRes.data.length > 0) {
      setIncomeCategories(catRes.data.map((r) => r.name));
    }
    setLoading(false);
  }

  // Helyi mentés (csak localStorage módban)
  useEffect(() => {
    if (!isSupabaseReady && !loading) localSave(TX_KEY, transactions);
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
      if (!error && data) {
        setTransactions((prev) => [fromDb(data), ...prev]);
        return;
      }
    }
    setTransactions((prev) => [newTx, ...prev]);
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

  // ── Kategória hozzáadás ─────────────────────────────────────
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

  return {
    transactions,
    incomeCategories,
    loading,
    addTransaction,
    deleteTransaction,
    deleteTransactions,
    toggleStatus,
    addIncomeCategory,
  };
}
