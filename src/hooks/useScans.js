import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useScans() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from('scans')
        .select('*')
        .order('scanned_at', { ascending: false })
        .limit(100);
      if (data) setScans(data);
      setLoading(false);
    };
    cargar();
  }, []);

  const registrarScan = async (scanData) => {
    const { data } = await supabase
      .from('scans')
      .insert(scanData)
      .select()
      .single();

    if (data) setScans((prev) => [data, ...prev]);

    // Log to Google Sheets via Netlify function
    try {
      await fetch('/.netlify/functions/log-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanData),
      });
    } catch {
      // fail silently — scan is already in Supabase
    }
  };

  return { scans, loading, registrarScan };
}
