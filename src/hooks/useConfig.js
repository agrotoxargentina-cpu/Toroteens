import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const CONFIG_DEFAULT = {
  edadMinima: 13,
  edadMaxima: 17,
  umbralNaranja: 4,
  nombreEvento: 'ToroTEENS',
};

export function useConfig() {
  const [config, setConfig] = useState(CONFIG_DEFAULT);
  const [loading, setLoading] = useState(true);

  const cargarConfig = useCallback(async () => {
    const { data, error } = await supabase
      .from('config')
      .select('*')
      .eq('id', 1)
      .single();

    if (!error && data) {
      setConfig({
        edadMinima: data.edad_minima,
        edadMaxima: data.edad_maxima,
        umbralNaranja: data.umbral_naranja_meses,
        nombreEvento: data.nombre_evento,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    cargarConfig();

    const channel = supabase
      .channel('config-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'config' },
        (payload) => {
          const d = payload.new;
          setConfig({
            edadMinima: d.edad_minima,
            edadMaxima: d.edad_maxima,
            umbralNaranja: d.umbral_naranja_meses,
            nombreEvento: d.nombre_evento,
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [cargarConfig]);

  const guardarConfig = async (nueva, guardaNombre) => {
    const { error } = await supabase
      .from('config')
      .update({
        edad_minima: nueva.edadMinima,
        edad_maxima: nueva.edadMaxima,
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
