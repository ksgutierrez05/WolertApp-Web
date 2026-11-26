const campo = (obj, ...nombres) =>
  nombres.reduce((valor, nombre) => valor ?? obj?.[nombre], null);

export const textoUbicacion = (...valores) => {
  for (const valor of valores) {
    if (typeof valor === "string" || typeof valor === "number") {
      const texto = String(valor).trim();
      if (
        texto &&
        !/^\d+$/.test(texto) &&
        texto !== "[object Object]" &&
        ![
          "no disponible",
          "barrio no disponible",
          "comuna no disponible",
          "sin zona registrada",
          "sin barrio registrado",
          "sin comuna registrada",
          "ubicación no registrada",
          "—",
          "-",
        ].includes(texto.toLowerCase())
      ) {
        return texto;
      }
    } else if (valor && typeof valor === "object") {
      const nombre = textoUbicacion(
        valor.nombre,
        valor.Nombre,
        valor.nombreBarrio,
        valor.NombreBarrio,
        valor.barrioNombre,
        valor.BarrioNombre,
        valor.nombreComuna,
        valor.NombreComuna,
        valor.comunaNombre,
        valor.ComunaNombre
      );
      if (nombre) return nombre;
    }
  }
  return "";
};

export const idBarrioDeCaso = (caso) => {
  const alerta = caso?.alerta || caso || {};
  return campo(
    alerta,
    "idBarrio", "IdBarrio", "ID_BARRIO", "barrioId", "BarrioId"
  ) ?? campo(
    alerta.barrio || alerta.Barrio,
    "idBarrio", "IdBarrio", "ID_BARRIO", "id", "Id"
  );
};

export const zonaDelCaso = (caso, barrios = []) => {
  const alerta = caso?.alerta || {};
  const barrio = textoUbicacion(
    alerta.nombreBarrio,
    alerta.NombreBarrio,
    alerta.barrioNombre,
    alerta.BarrioNombre,
    alerta.barrio?.nombre,
    alerta.barrio?.Nombre,
    alerta.barrio,
    alerta.Barrio?.nombre,
    alerta.Barrio?.Nombre,
    alerta.Barrio
  );

  const comuna = textoUbicacion(
    alerta.nombreComuna,
    alerta.NombreComuna,
    alerta.comunaNombre,
    alerta.ComunaNombre,
    alerta.comuna?.nombre,
    alerta.comuna?.Nombre,
    alerta.comuna,
    alerta.Comuna?.nombre,
    alerta.Comuna?.Nombre,
    alerta.Comuna,
    alerta.barrio?.comuna?.nombre,
    alerta.barrio?.comuna?.Nombre,
    alerta.barrio?.comunaNombre,
    alerta.barrio?.nombreComuna,
    alerta.Barrio?.Comuna?.Nombre
  );

  const idBarrio = idBarrioDeCaso(caso);
  const barrioEncontrado = idBarrio == null
    ? null
    : barrios.find((item) =>
        String(campo(item, "idBarrio", "IdBarrio", "ID_BARRIO", "id", "Id")) === String(idBarrio)
      );
  const nombreBarrioResuelto = textoUbicacion(
    barrio,
    barrioEncontrado?.nombreBarrio,
    barrioEncontrado?.NombreBarrio,
    barrioEncontrado?.barrioNombre,
    barrioEncontrado?.BarrioNombre,
    barrioEncontrado?.nombre,
    barrioEncontrado?.Nombre
  );
  const zona = [nombreBarrioResuelto, comuna].filter(Boolean).join(" · ");
  if (zona) return zona;

  const ubicacion = textoUbicacion(
    alerta.direccion,
    alerta.Direccion,
    alerta.ubicacion,
    alerta.Ubicacion,
    caso?.zona
  );
  return ubicacion || "Ubicación no registrada";
};
