import { useEffect, useMemo, useState } from "react";
import "../../css/global.css";
import "../../css/temas.css";
import "../../css/ciudadano/listados-unificados.css";
import "../../css/ciudadano/panel-vecinos.css";
import { listarVecinos, obtenerUsuarioPorId } from "../../Services/UsuariosAPI.js";
import { ListarBarrios } from "../../Services/BarriosApi.js";

function barrioIdDe(usuario) {
  const valor = usuario?.barrioId ?? usuario?.idBarrio ?? usuario?.BarrioId ?? usuario?.IdBarrio ??
    usuario?.barrio?.barrioId ?? usuario?.barrio?.idBarrio ?? usuario?.Barrio?.IdBarrio;
  if (valor === null || valor === undefined || String(valor).trim() === "") return null;
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function barrioNombreDe(usuario) {
  return usuario?.barrioNombre ?? usuario?.BarrioNombre ?? usuario?.barrio?.nombre ?? usuario?.Barrio?.Nombre ?? "";
}

function normalizarNombreBarrio(nombre) {
  return String(nombre ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim().toLocaleLowerCase("es-CO");
}

function resolverBarrioId(usuario, barrios) {
  const directo = barrioIdDe(usuario);
  if (directo !== null) return directo;
  const nombre = normalizarNombreBarrio(barrioNombreDe(usuario));
  if (!nombre) return null;
  const barrio = barrios.find((item) => normalizarNombreBarrio(item.nombre ?? item.Nombre) === nombre);
  return barrioIdDe(barrio);
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
      return () => { activo = false; };
    }

    Promise.all([obtenerUsuarioPorId(idUsuario), listarVecinos(), ListarBarrios().catch(() => [])])
      .then(([actual, lista, barrios]) => {
        if (!activo) return;
        const catalogo = Array.isArray(barrios) ? barrios : [];
        setBarrios(catalogo);
        setBarrioIdActual(resolverBarrioId(actual ?? {}, catalogo));
        setBarrioNombreActual(barrioNombreDe(actual));
        setUsuarios((Array.isArray(lista) ? lista : []).map((usuario) => ({
          ...usuario,
          barrioIdResuelto: resolverBarrioId(usuario, catalogo),
        })));
      })
      .catch((err) => { if (activo) setError(err.message || "No se pudieron cargar los usuarios del barrio."); })
      .finally(() => { if (activo) setCargando(false); });

    return () => { activo = false; };
  }, []);

  const clasificados = useMemo(() => usuarios.map((usuario) => {
    const idBarrio = usuario.barrioIdResuelto ?? resolverBarrioId(usuario, barrios);
    const nombreUsuario = normalizarNombreBarrio(barrioNombreDe(usuario) || (barrios.find(b => barrioIdDe(b) === idBarrio)?.nombre));
    const nombreActualNorm = normalizarNombreBarrio(barrioNombreActual);
    const mismoBarrio = barrioIdActual === null
      ? true
      : (nombreActualNorm !== "" && nombreUsuario !== "" && nombreUsuario === nombreActualNorm);
    const otroBarrio = barrioIdActual === null
      ? false
      : (nombreActualNorm !== "" && nombreUsuario !== "" && nombreUsuario !== nombreActualNorm);
    return { ...usuario, idBarrioComparado: idBarrio, mismoBarrio, otroBarrio };
  }), [usuarios, barrioIdActual, barrios, barrioNombreActual]);
  const vecinos = clasificados.filter((usuario) => usuario.mismoBarrio);
  const otrosBarrios = clasificados.filter((usuario) => usuario.otroBarrio);
  const sinBarrio = clasificados.filter((usuario) => usuario.idBarrioComparado === null || barrioIdActual === null);
  const listaVisible = filtro === "vecinos" ? vecinos : filtro === "otros" ? otrosBarrios : clasificados;
  const nombreActual = (usuario) => String(usuario.nombre ?? usuario.Nombre ?? [usuario.primerNombre ?? usuario.PrimerNombre, usuario.primerApellido ?? usuario.PrimerApellido].filter(Boolean).join(" ") ?? "").trim() || "Usuario";

  return <div className="container-fluid ciudadano-listado ciudadano-vecinos">
    <header className="ciudadano-page-heading">
      <div><h1>Mis vecinos</h1><p>Comparamos el ID de barrio de tu cuenta con el de cada usuario para identificar quién vive en tu barrio.</p></div>
      {barrioNombreActual && <span className="vecinos-mi-barrio"><i className="bi bi-geo-alt-fill" /> Tu barrio: {barrioNombreActual}</span>}
    </header>

    {barrioIdActual === null && !cargando && <div className="vecinos-aviso" role="status"><i className="bi bi-info-circle-fill" /> No pudimos identificar el ID de tu barrio desde tu perfil ni desde el catálogo, así que no podemos confirmar coincidencias.</div>}

    <div className="row g-3 mb-4">
      <div className="col-12 col-sm-6 col-lg-4"><div className="kpi-dash kpi-blue-dash"><i className="bi bi-people kpi-icon-dash" /><div className="kpi-num-dash">{cargando || barrioIdActual === null ? "—" : vecinos.length}</div><div className="kpi-label-dash">Vecinos de tu barrio</div><div className="kpi-label-dash ciudadano-kpi-sub">Mismo ID de barrio</div></div></div>
      <div className="col-12 col-sm-6 col-lg-4"><div className="kpi-dash kpi-amber-dash"><i className="bi bi-geo-alt kpi-icon-dash" /><div className="kpi-num-dash">{cargando || barrioIdActual === null ? "—" : otrosBarrios.length}</div><div className="kpi-label-dash">Otros barrios</div><div className="kpi-label-dash ciudadano-kpi-sub">ID diferente al tuyo</div></div></div>
      <div className="col-12 col-sm-6 col-lg-4"><div className="kpi-dash kpi-purple-dash"><i className="bi bi-question-circle kpi-icon-dash" /><div className="kpi-num-dash">{cargando ? "—" : sinBarrio.length}</div><div className="kpi-label-dash">Sin comparación</div><div className="kpi-label-dash ciudadano-kpi-sub">Falta el ID de barrio</div></div></div>
    </div>

    <div className="card-panel-dash ciudadano-table-panel p-0">
      <div className="vecinos-filtros" role="group" aria-label="Filtrar usuarios por barrio">
        <button type="button" className={filtro === "todos" ? "activo" : ""} onClick={() => setFiltro("todos")}>Todos ({clasificados.length})</button>
        <button type="button" className={filtro === "vecinos" ? "activo" : ""} onClick={() => setFiltro("vecinos")}>Mismo barrio ({vecinos.length})</button>
        <button type="button" className={filtro === "otros" ? "activo" : ""} onClick={() => setFiltro("otros")}>Otros barrios ({otrosBarrios.length})</button>
      </div>
      <div id="listaVecinos">
        {cargando && <p className="text-center text-muted small m-4">Cargando usuarios...</p>}
        {!cargando && error && <p className="text-center small m-4" role="alert" style={{ color: "#b42318" }}>{error}</p>}
        {!cargando && !error && listaVisible.length === 0 && <p className="text-center text-muted small m-4">No hay usuarios en esta categoría.</p>}
        {!cargando && !error && listaVisible.map((usuario, index) => <div key={usuario.idUsuario ?? usuario.IdUsuario ?? index} className="vecino-row-usu p-3 border-bottom d-flex justify-content-between align-items-center">
          <div className="vecino-info-usu"><span className="nombre-usu">{nombreActual(usuario)}</span>{(usuario.barrioNombre ?? usuario.barrio?.nombre) && <span className="distancia-usu ms-2"><i className="bi bi-geo-alt" /> {usuario.barrioNombre ?? usuario.barrio?.nombre}</span>}</div>
          <span className={`vecino-relacion ${usuario.mismoBarrio ? "es-vecino" : usuario.otroBarrio ? "otro-barrio" : "sin-comparacion"}`}><i className={`bi ${usuario.mismoBarrio ? "bi-people-fill" : usuario.otroBarrio ? "bi-geo-alt" : "bi-question-circle"}`} />{usuario.mismoBarrio ? "Comparte tu barrio" : usuario.otroBarrio ? "Otro barrio" : "Sin ID de barrio"}</span>
        </div>)}
      </div>
    </div>
  </div>;
}
