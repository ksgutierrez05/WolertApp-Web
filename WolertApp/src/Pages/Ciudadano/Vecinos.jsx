import { useEffect, useMemo, useState } from "react";
import "../../css/global.css";
import "../../css/temas.css";
import "../../css/ciudadano/vistas-bandeja.css";
import { listarVecinos, obtenerUsuarioPorId } from "../../Services/UsuariosAPI.js";
import { ListarBarrios } from "../../Services/BarriosApi.js";

function barrioIdDe(usuario) {
  const valor = usuario?.barrioId
    ?? usuario?.idBarrio
    ?? usuario?.BarrioId
    ?? usuario?.IdBarrio
    ?? usuario?.barrio?.barrioId
    ?? usuario?.barrio?.idBarrio
    ?? usuario?.Barrio?.IdBarrio;

  if (valor === null || valor === undefined || String(valor).trim() === "") return null;
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function barrioNombreDe(usuario) {
  return usuario?.barrioNombre
    ?? usuario?.BarrioNombre
    ?? usuario?.barrio?.nombre
    ?? usuario?.Barrio?.Nombre
    ?? "";
}

function normalizarNombreBarrio(nombre) {
  return String(nombre ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("es-CO");
}

function resolverBarrioId(usuario, barrios) {
  const idDirecto = barrioIdDe(usuario);
  if (idDirecto !== null) return idDirecto;

  const nombre = normalizarNombreBarrio(barrioNombreDe(usuario));
  if (!nombre) return null;

  const barrio = barrios.find(
    (item) => normalizarNombreBarrio(item.nombre ?? item.Nombre) === nombre,
  );

  return barrioIdDe(barrio);
}

function nombreUsuario(usuario) {
  const nombre = usuario.nombre
    ?? usuario.Nombre
    ?? [
      usuario.primerNombre ?? usuario.PrimerNombre,
      usuario.primerApellido ?? usuario.PrimerApellido,
    ].filter(Boolean).join(" ");

  return String(nombre ?? "").trim() || "Usuario";
}

export default function Vecinos() {
  const [usuarios, setUsuarios] = useState([]);
  const [barrios, setBarrios] = useState([]);
  const [barrioIdActual, setBarrioIdActual] = useState(null);
  const [barrioNombreActual, setBarrioNombreActual] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    const idUsuario = localStorage.getItem("idUsuario");

    if (!idUsuario) {
      setError("No encontramos el usuario de la sesión. Vuelve a iniciar sesión.");
      setCargando(false);
      return () => {
        activo = false;
      };
    }

    Promise.all([
      obtenerUsuarioPorId(idUsuario),
      listarVecinos(),
      ListarBarrios().catch(() => []),
    ])
      .then(([actual, lista, barriosCargados]) => {
        if (!activo) return;

        const catalogo = Array.isArray(barriosCargados) ? barriosCargados : [];
        setBarrios(catalogo);
        setBarrioIdActual(resolverBarrioId(actual ?? {}, catalogo));
        setBarrioNombreActual(barrioNombreDe(actual));
        setUsuarios((Array.isArray(lista) ? lista : []).map((usuario) => ({
          ...usuario,
          barrioIdResuelto: resolverBarrioId(usuario, catalogo),
        })));
      })
      .catch((err) => {
        if (activo) setError(err.message || "No se pudieron cargar los usuarios del barrio.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const clasificados = useMemo(() => usuarios.map((usuario) => {
    const idBarrio = usuario.barrioIdResuelto ?? resolverBarrioId(usuario, barrios);
    const nombreBarrio = normalizarNombreBarrio(
      barrioNombreDe(usuario)
        || barrios.find((barrio) => barrioIdDe(barrio) === idBarrio)?.nombre,
    );
    const nombreActual = normalizarNombreBarrio(barrioNombreActual);
    const mismoBarrio = barrioIdActual === null
      ? true
      : nombreActual !== "" && nombreBarrio !== "" && nombreBarrio === nombreActual;
    const otroBarrio = barrioIdActual !== null
      && nombreActual !== ""
      && nombreBarrio !== ""
      && nombreBarrio !== nombreActual;

    return {
      ...usuario,
      idBarrioComparado: idBarrio,
      mismoBarrio,
      otroBarrio,
    };
  }), [usuarios, barrioIdActual, barrios, barrioNombreActual]);

  const vecinos = clasificados.filter((usuario) => usuario.mismoBarrio);
  const otrosBarrios = clasificados.filter((usuario) => usuario.otroBarrio);
  const sinBarrio = clasificados.filter(
    (usuario) => usuario.idBarrioComparado === null || barrioIdActual === null,
  );
  const listaVisible = filtro === "vecinos"
    ? vecinos
    : filtro === "otros"
      ? otrosBarrios
      : clasificados;

  return (
    <main className="ciudadano-bandeja ciudadano-vecinos">
      <header className="ciudadano-bandeja__hero">
        <div>
          <span className="ciudadano-bandeja__eyebrow">
            <i className="bi bi-people-fill" /> TU COMUNIDAD
          </span>
          <h1>Mis vecinos</h1>
          <p>Explora las personas registradas en tu barrio y en otros sectores.</p>
        </div>
        {barrioNombreActual && (
          <span className="vecinos-mi-barrio">
            <i className="bi bi-geo-alt-fill" />
            Tu barrio: {barrioNombreActual}
          </span>
        )}
      </header>

      {barrioIdActual === null && !cargando && (
        <div className="ciudadano-bandeja__notice" role="status">
          <i className="bi bi-info-circle-fill" />
          <span>
            No pudimos identificar el barrio de tu perfil, así que no podemos confirmar las coincidencias.
          </span>
        </div>
      )}

      <section className="ciudadano-bandeja__summary" aria-label="Resumen de vecinos">
        <Metric icon="bi-people" label="Vecinos de tu barrio" value={cargando || barrioIdActual === null ? "—" : vecinos.length} />
        <Metric icon="bi-geo-alt" label="Otros barrios" value={cargando || barrioIdActual === null ? "—" : otrosBarrios.length} tone="amber" />
        <Metric icon="bi-question-circle" label="Sin comparación" value={cargando ? "—" : sinBarrio.length} tone="slate" />
      </section>

      <section className="ciudadano-bandeja__panel" aria-label="Personas de la comunidad">
        <div className="ciudadano-bandeja__toolbar">
          <div className="ciudadano-bandeja__filters" role="group" aria-label="Filtrar personas por barrio">
            <FilterButton active={filtro === "todos"} onClick={() => setFiltro("todos")}>
              Todos ({clasificados.length})
            </FilterButton>
            <FilterButton active={filtro === "vecinos"} onClick={() => setFiltro("vecinos")}>
              Mismo barrio ({vecinos.length})
            </FilterButton>
            <FilterButton active={filtro === "otros"} onClick={() => setFiltro("otros")}>
              Otros barrios ({otrosBarrios.length})
            </FilterButton>
          </div>
        </div>

        {error && (
          <div className="ciudadano-bandeja__error" role="alert">
            <i className="bi bi-exclamation-circle-fill" />
            {error}
          </div>
        )}

        {cargando ? (
          <Empty title="Cargando usuarios..." />
        ) : !error && listaVisible.length === 0 ? (
          <Empty title="No hay usuarios en esta categoría." />
        ) : (
          <div className="ciudadano-bandeja__list">
            {listaVisible.map((usuario, indice) => {
              const barrio = barrioNombreDe(usuario);
              const relacion = usuario.mismoBarrio
                ? "Comparte tu barrio"
                : usuario.otroBarrio
                  ? "Otro barrio"
                  : "Sin ID de barrio";
              const tono = usuario.otroBarrio ? "amber" : usuario.mismoBarrio ? "" : "slate";
              const icono = usuario.mismoBarrio
                ? "bi-people-fill"
                : usuario.otroBarrio
                  ? "bi-geo-alt"
                  : "bi-question-circle";

              return (
                <article
                  className="ciudadano-bandeja__item"
                  key={usuario.idUsuario ?? usuario.IdUsuario ?? indice}
                >
                  <span className="ciudadano-bandeja__item-icon">
                    <i className="bi bi-person-fill" />
                  </span>
                  <div className="ciudadano-bandeja__item-body">
                    <div className="ciudadano-bandeja__item-heading">
                      <h2>{nombreUsuario(usuario)}</h2>
                      <span className={`ciudadano-bandeja__badge ${tono}`}>
                        <i className={`bi ${icono}`} />
                        {relacion}
                      </span>
                    </div>
                    <div className="ciudadano-bandeja__meta">
                      <span>
                        <i className="bi bi-geo-alt" />
                        {barrio || "Barrio no disponible"}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <footer className="ciudadano-bandeja__footer">
          <span>Mostrando {listaVisible.length} de {clasificados.length} personas</span>
          <span>Clasificación por barrio</span>
        </footer>
      </section>
    </main>
  );
}

function Metric({ icon, label, value, tone = "" }) {
  return (
    <div className="ciudadano-bandeja__metric">
      <span className={`ciudadano-bandeja__metric-icon ${tone}`}>
        <i className={`bi ${icon}`} />
      </span>
      <span className="ciudadano-bandeja__metric-copy">
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={active ? "active" : ""}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Empty({ title }) {
  return (
    <div className="ciudadano-bandeja__empty">
      <i className="bi bi-people" />
      <strong>{title}</strong>
    </div>
  );
}
