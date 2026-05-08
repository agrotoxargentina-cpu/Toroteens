import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const CONFIG_DEFAULT = {
  anioNacDesde: 2007,
  anioNacHasta: 2013,
  umbralNaranja: 4,
  nombreEvento: 'ToroTEENS',
};

function mapear(data) {
  return {
    anioNacDesde: data.anio_nac_desde,
    anioNacHasta: data.anio_nac_hasta,
    umbralNaranja: data.umbral_naranja_meses,
    nombreEvento: data.nombre_evento,
  };
}

export function useConfig() {
  const [config, setConfig] = useState(CONFIG_DEFAULT);
  const [loading, setLoading] = useState(true);

  const cargarConfig = useCallback(async () => {
    const { data, error } = await supabase
      .from('config')
      .select('*')
      .eq('id', 1)
      .single();
    if (!error && data) setConfig(mapear(data));
    setLoading(false);
  }, []);

  useEffect(() => {
    cargarConfig();

    const channel = supabase
      .channel('config-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'config' }, (payload) => {
        setConfig(mapear(payload.new));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [cargarConfig]);

  const guardarConfig = async (nueva, guardaNombre) => {
    const { error } = await supabase
      .from('config')
      .update({
        anio_nac_desde: nueva.anioNacDesde,
        anio_nac_hasta: nueva.anioNacHasta,
        umbral_naranja_meses: nueva.umbralNaranja,
        nombre_evento: nueva.nombreEvento,
        actualizado_por: guardaNombre,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    if (!error) setConfig(nueva);
    return !error;
  };

  return { config, loading, guardarConfig };
}
