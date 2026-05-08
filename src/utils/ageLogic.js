export function calcularEdad(fechaNacimiento) {
  const [day, month, year] = fechaNacimiento.split('/').map(Number);
  const nacimiento = new Date(year, month - 1, day);
  const hoy = new Date();

  let anios = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();

  if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) {
    anios--;
    meses += 12;
  }

  if (hoy.getDate() < nacimiento.getDate()) {
    meses--;
    if (meses < 0) meses += 12;
  }

  const totalMeses = anios * 12 + meses;

  return { anios, meses, totalMeses };
}

export function verificarIngreso(fechaNacimiento, config) {
  const { edadMinima, edadMaxima, umbralNaranja } = config;
  const { anios, meses, totalMeses } = calcularEdad(fechaNacimiento);

  const minMeses = edadMinima * 12;
  const maxMeses = edadMaxima * 12;

  const edadTexto =
    meses > 0
      ? `${anios} años y ${meses} mes${meses > 1 ? 'es' : ''}`
      : `${anios} años`;

  if (totalMeses >= minMeses && totalMeses <= maxMeses) {
    return {
      color: 'green',
      titulo: 'PUEDE PASAR',
      detalle: `Edad dentro del rango permitido`,
      edad: edadTexto,
    };
  }

  if (totalMeses < minMeses) {
    const faltanMeses = minMeses - totalMeses;
    if (faltanMeses <= umbralNaranja) {
      return {
        color: 'orange',
        titulo: 'VERIFICAR',
        detalle: `Le falta${faltanMeses > 1 ? 'n' : ''} ${faltanMeses} mes${faltanMeses > 1 ? 'es' : ''} para la edad mínima`,
        edad: edadTexto,
      };
    }
    return {
      color: 'red',
      titulo: 'NO PUEDE INGRESAR',
      detalle: `Muy joven — le falta${faltanMeses > 1 ? 'n' : ''} ${faltanMeses} mes${faltanMeses > 1 ? 'es' : ''} para la edad mínima`,
      edad: edadTexto,
    };
  }

  if (totalMeses > maxMeses) {
    const superaMeses = totalMeses - maxMeses;
    if (superaMeses <= umbralNaranja) {
      return {
        color: 'orange',
        titulo: 'VERIFICAR',
        detalle: `Supera la edad máxima por ${superaMeses} mes${superaMeses > 1 ? 'es' : ''}`,
        edad: edadTexto,
      };
    }
    return {
      color: 'red',
      titulo: 'NO PUEDE INGRESAR',
      detalle: `Muy grande — supera la edad máxima por ${superaMeses} mes${superaMeses > 1 ? 'es' : ''}`,
      edad: edadTexto,
    };
  }
}
