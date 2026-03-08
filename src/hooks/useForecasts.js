import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { sampleForecasts } from '../data/sampleData';

const KEY = 'scrollers_forecasts';

function localLoad() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : sampleForecasts;
  } catch { return sampleForecasts; }
}

function fromDb(row) {
  return {
    id: row.id,
    clientName: row.client_name,
    projectType: row.project_type,
    expectedAmount: row.expected_amount,
    expectedDate: row.expected_date,
    status: row.status,
    notes: row.notes || '',
    forecastType: row.forecast_type || 'bevétel',
    forClient: row.for_client || '',
    vatRate: row.vat_rate || 0,
    netAmount: row.net_amount || null,
  };
}

function toDb(fc) {
  return {
    client_name: fc.clientName,
    project_type: fc.projectType,
    expected_amount: fc.expectedAmount,
    expected_date: fc.expectedDate,
    status: fc.status,
    notes: fc.notes || '',
    forecast_type: fc.forecastType || 'bevétel',
    for_client: fc.forClient || '',
    vat_rate: fc.vatRate || 0,
    net_amount: fc.netAmount || null,
  };
}

export function useForecasts() {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseReady) {
      loadFromSupabase();
    } else {
      setForecasts(localLoad());
      setLoading(false);
    }
  }, []);

  async function loadFromSupabase() {
    const { data } = await supabase
      .from('forecasts')
      .select('*')
      .order('created_at', { ascending: false });

    const fcs = data ? data.map(fromDb) : [];
    setForecasts(fcs);
    setLoading(false);
  }

  useEffect(() => {
    if (!isSupabaseReady && !loading) {
      try { localStorage.setItem(KEY, JSON.stringify(forecasts)); } catch {}
    }
  }, [forecasts, loading]);

  const addForecast = useCallback(async (fc) => {
    const newFc = { ...fc, id: crypto.randomUUID() };
    if (isSupabaseReady) {
      const { data, error } = await supabase
        .from('forecasts')
        .insert([toDb(newFc)])
        .select()
        .single();
      if (!error && data) { setForecasts((prev) => [fromDb(data), ...prev]); return; }
    }
    setForecasts((prev) => [newFc, ...prev]);
  }, []);

  const updateForecastStatus = useCallback(async (id, status) => {
    if (isSupabaseReady) {
      await supabase.from('forecasts').update({ status }).eq('id', id);
    }
    setForecasts((prev) => prev.map((fc) => (fc.id === id ? { ...fc, status } : fc)));
  }, []);

  const deleteForecast = useCallback(async (id) => {
    if (isSupabaseReady) {
      await supabase.from('forecasts').delete().eq('id', id);
    }
    setForecasts((prev) => prev.filter((fc) => fc.id !== id));
  }, []);

  return { forecasts, loading, addForecast, updateForecastStatus, deleteForecast };
}
