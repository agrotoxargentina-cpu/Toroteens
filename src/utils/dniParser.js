// Argentine DNI QR/PDF417 format: @APELLIDO@NOMBRE@SEXO@DNI@TRAMITE@FECHA_NAC@FECHA_VTO@CUIL@
export function parseDNI(raw) {
  const data = raw.trim();

  if (!data.includes('@')) {
    throw new Error('QR no corresponde a un DNI argentino');
  }

  const parts = data.split('@').filter((p) => p.trim() !== '');

  if (parts.length < 6) {
    throw new Error('Formato de DNI no reconocido');
  }

  const fechaNacimiento = parts[5];

  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fechaNacimiento)) {
    throw new Error('Fecha de nacimiento inválida en el DNI');
  }

  return {
    apellido: parts[0],
    nombre: parts[1],
    sexo: parts[2],
    dni: parts[3],
    fechaNacimiento,
    nombreCompleto: `${parts[1]} ${parts[0]}`,
  };
}
