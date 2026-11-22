import { useEffect, useMemo, useState } from "react";
import Layout from "../../Components/transito/Layout";
import KpiCard from "../../Components/transito/KpiCard";
import {
  listarAgentesCentral,
  listarUnidadesCentral,
  listarAtencionesCentral,
  prepararAgentesCentral,
  normalizarCentral,
} from "../../Services/centralTransitoService";
import "../../css/transito/central-transito/panel-atencion-transito.css";
const ESTADOS = {
  disponible: { texto: "Disponible", color: "green", avatar: "green" },
  atencion: { texto: "En atención", color: "amber", avatar: "amber" },
  "no-disponible": { texto: "No disponible", color: "red", avatar: "blue" },
  desconocido: { texto: "No informado", color: "blue", avatar: "blue" },
};
const FILTROS = [
  ["todos", "Todos"],
  ["disponible", "Disponibles"],
  ["atencion", "En atención"],
  ["no-disponible", "No disponibles"],
  ["desconocido", "Sin estado"],
];
const lista = (valor) => (Array.isArray(valor) ? valor : []);
export default function Agentes() {
  const [agentes, setAgentes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [buscar, setBuscar] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState([]);
  useEffect(() => {
    let activo = true;
    async function cargar() {
      const [a, u, t] = await Promise.allSettled([
        listarAgentesCentral(),
        listarUnidadesCentral(),
        listarAtencionesCentral(),
      ]);
      if (!activo) return;
      const mensajes = [];
      if (a.status === "fulfilled") setAgentes(lista(a.value));
      else mensajes.push("No se pudieron cargar los agentes.");
      if (u.status === "fulfilled") setUnidades(lista(u.value));
      else mensajes.push("No se pudieron cargar las unidades.");
      if (t.status === "fulfilled") setAtenciones(lista(t.value));
      else mensajes.push("No se pudieron cargar las atenciones.");
      setErrores(mensajes);
      setCargando(false);
    }
    cargar();
    return () => {
      activo = false;
    };
  }, []);
  const datos = useMemo(
    () => lista(prepararAgentesCentral(agentes, unidades, atenciones)),
    [agentes, unidades, atenciones]
  );
  const contar = (estado) =>
    datos.filter((agente) => agente.estado === estado).length;
  const filtrados = useMemo(() => {
    const busqueda = normalizarCentral(buscar);
    return datos.filter((agente) => {
      if (filtro !== "todos" && agente.estado !== filtro) return false;
      const contenido = normalizarCentral(
        [
          agente.nombre,
          agente.cedula,
          agente.zona,
          agente.grupo,
          agente.casoActual,
        ].join(" ")
      );
      return contenido.includes(busqueda);
    });
  }, [datos, filtro, buscar]);
  return (
    <Layout
      rol="central"
      titulo="Agentes"
      activo="agentes"
      busqueda={{
        placeholder: "Buscar por agente o barrio...",
        valor: buscar,
        onChange: setBuscar,
      }}
    >
      <header className="st-header mb-4">
        <div>
          <span className="st-eyebrow">CENTRAL DE TRÁNSITO</span>
          <h1>Agentes</h1>
          <p>Consulta el estado y la disponibilidad de los agentes de tránsito.</p>
        </div>
      </header>
      {cargando && <div className="alert alert-info">Cargando agentes...</div>}
      {errores.length > 0 && (
        <div className="alert alert-warning">{errores.join(" ")}</div>
      )}
      <div className="row g-3 mb-5">
        <KpiCard color="blue" valor={datos.length} label="Agentes totales" icono="bi-people" />
        <KpiCard color="green" valor={contar("disponible")} label="Disponibles ahora" icono="bi-person-check" />
        <KpiCard color="amber" valor={contar("atencion")} label="En atención" icono="bi-cone-striped" />
        <KpiCard color="red" valor={contar("no-disponible")} label="No disponibles" icono="bi-person-dash" />
      </div>
      <div className="table-card-dash">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div className="d-flex gap-2 tabs-dash flex-wrap">
            {FILTROS.map(([id, etiqueta]) => (
              <button
                key={id}
                type="button"
                className={`tab-dash ${filtro === id ? "active-dash" : ""}`}
                onClick={() => setFiltro(id)}
              >
                {etiqueta} ({id === "todos" ? datos.length : contar(id)})
              </button>
            ))}
          </div>
          <div className="input-group search-panel-dash">
            <span className="input-group-text bg-white border-0">
              <i className="bi bi-search" />
            </span>
            <input
              type="search"
              className="form-control border-0"
              placeholder="Buscar agente, cédula o zona..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Agente</th>
                <th>Zona</th>
                <th>Estado</th>
                <th>Caso actual</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((agente, indice) => {
                const estado = ESTADOS[agente.estado] || ESTADOS.desconocido;
                return (
                  <tr key={agente.id ?? indice}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className={`avatar-icon-dash avatar-${estado.avatar}-dash`}>
                          {agente.iniciales}
                        </span>
                        <div>
                          <div className="info-title-dash">{agente.nombre}</div>
                          <div className="info-sub-dash">{agente.cedula}</div>
                        </div>
                      </div>
                    </td>
                    <td>{agente.zona}</td>
                    <td>
                      <span className={`badge-dash badge-${estado.color}-dash`}>
                        {estado.texto}
                      </span>
                    </td>
                    <td>{agente.casoActual}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="link-detalle-dash border-0 bg-transparent"
                        onClick={() => setSeleccionado(agente)}
                      >
                        Ver perfil
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!cargando && filtrados.length === 0 && (
          <p className="text-center text-muted py-4 mb-0">No se encontraron agentes.</p>
        )}
        <div className="d-flex justify-content-between align-items-center pt-3 paginacion-dash">
          <span className="text-muted small">
            Mostrando {filtrados.length} de {datos.length} agentes
          </span>
        </div>
      </div>
      {seleccionado && (
        <div
          className="modal fade show"
          id="modalPerfil"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tituloPerfilCentral"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,.5)" }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSeleccionado(null);
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-dash">
              <div className="modal-header border-0 pb-0">
                <h5 id="tituloPerfilCentral" className="panel-title-dash mb-0">
                  Perfil del agente
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setSeleccionado(null)}
                />
              </div>
              <div className="modal-body">
                <div className="perfil-header-dash">
                  <span className="avatar-icon-dash avatar-blue-dash avatar-grande-dash">
                    {seleccionado.iniciales}
                  </span>
                  <div>
                    <div className="perfil-nombre-dash">{seleccionado.nombre}</div>
                    <div className="perfil-cedula-dash">{seleccionado.cedula}</div>
                  </div>
                </div>
                <div className="perfil-datos-dash">
                  {[
                    ["Zona", seleccionado.zona],
                    ["Grupo", seleccionado.grupo],
                    ["Estado", ESTADOS[seleccionado.estado]?.texto || "No informado"],
                    ["Caso actual", seleccionado.casoActual],
                    ["Atenciones registradas", seleccionado.totalAtenciones],
                    ["Canal de radio", seleccionado.canal],
                  ].map(([etiqueta, valor]) => (
                    <div key={etiqueta} className="perfil-fila-dash">
                      <span className="perfil-label-dash">{etiqueta}</span>
                      <span className="perfil-valor-dash">{valor}</span>
                    </div>
                  ))}
                </div>
                <p className="perfil-nota-dash">
                  La edición de los datos del agente corresponde al Director de Tránsito.
                </p>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setSeleccionado(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}