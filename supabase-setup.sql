-- Tabla de configuración compartida (una sola fila, id = 1)
CREATE TABLE IF NOT EXISTS config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  nombre_evento TEXT NOT NULL DEFAULT 'ToroTEENS',
  edad_minima INTEGER NOT NULL DEFAULT 13,
  edad_maxima INTEGER NOT NULL DEFAULT 17,
  umbral_naranja_meses INTEGER NOT NULL DEFAULT 4,
  actualizado_por TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT solo_una_fila CHECK (id = 1)
);

INSERT INTO config (id, nombre_evento, edad_minima, edad_maxima, umbral_naranja_meses)
VALUES (1, 'ToroTEENS', 13, 17, 4)
ON CONFLICT (id) DO NOTHING;

-- Tabla de escaneos
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guard_name TEXT NOT NULL,
  person_name TEXT,
  person_dni TEXT,
  person_birthdate TEXT,
  result_color TEXT NOT NULL CHECK (result_color IN ('green', 'orange', 'red')),
  result_message TEXT,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS y permitir acceso sin autenticación (la app no usa auth)
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acceso_publico_config" ON config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_publico_scans" ON scans FOR ALL USING (true) WITH CHECK (true);

-- Habilitar Realtime para sincronización de config
ALTER PUBLICATION supabase_realtime ADD TABLE config;
