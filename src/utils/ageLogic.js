function diffMeses(anterior, posterior) {
  let m =
    (posterior.getFullYear() - anterior.getFullYear()) * 12 +
    (posterior.getMonth() - anterior.getMonth());
  if (posterior.getDate() < anterior.getDate()) m--;
  return Math.max(0, m);
}

function edadTexto(fechaNacimiento) {
  const [day, month, year] = fechaNacimiento.split('/').map(Number);
  const nac = new Date(year, month - 1, day);
  const hoy = new Date();
  let anios = hoy.getFullYear() - nac.getFullYear();
  let meses = hoy.getMonth() - nac.getMonth();
  if (meses < 0 || (meses === 0 && hoy.getDate() < day)) { anios--; meses += 12; }
  if (hoy.getDate() < day) { meses--; if (meses < 0) meses += 12; }
  return meses > 0
    ? `${anios} años y ${meses} mes${meses !== 1 ? 'es' : ''}`
    : `${anios} años`;
}

export function verificarIngreso(fechaNacimiento, config) {
  const { anioNacDesde, anioNacHasta, umbralNaranja } = config;
  const [day, month, year] = fechaNacimiento.split('/').map(Number);
  const nacimiento = new Date(year, month - 1, day);

  const limiteDesde = new Date(anioNacDesde, 0, 1);   // 1 ene del año mínimo
  const limiteHasta = new Date(anioNacHasta, 11, 31);  // 31 dic del año máximo
  const edad = edadTexto(fechaNacimiento);

  if (nacimiento >= limiteDesde && nacimiento <= limiteHasta) {
    return {
      color: 'green',
      titulo: 'PUEDE PASAR',
      detalle: `Nació en ${year} — dentro del rango permitido`,
      edad,
    };
  }

  if (nacimiento < limiteDesde) {
    const mesesFuera = diffMeses(nacimiento, limiteDesde);
    const detalle = `Nació en ${year} — ${mesesFuera} mes${mesesFuera !== 1 ? 'es' : ''} antes del límite (${anioNacDesde})`;
    if (mesesFuera <= umbralNaranja) {
      return { color: 'orange', titulo: 'VERIFICAR', detalle, edad };
    }
    return { color: 'red', titulo: 'NO PUEDE INGRESAR', detalle: `Nació en ${year} — demasiado grande, ${mesesFuera} mes${mesesFuera !== 1 ? 'es' : ''} fuera del rango`, edad };
  }

  const mesesFuera = diffMeses(limiteHasta, nacimiento);
  const detalle = `Nació en ${year} — ${mesesFuera} mes${mesesFuera !== 1 ? 'es' : ''} después del límite (${anioNacHasta})`;
  if (mesesFuera <= umbralNaranja) {
    return { color: 'orange', titulo: 'VERIFICAR', detalle, edad };
  }
  return { color: 'red', titulo: 'NO PUEDE INGRESAR', detalle: `Nació en ${year} — demasiado joven, ${mesesFuera} mes${mesesFuera !== 1 ? 'es' : ''} fuera del rango`, edad };
}
