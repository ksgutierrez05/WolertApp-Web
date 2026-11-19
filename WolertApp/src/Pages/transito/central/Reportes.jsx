
import { useEffect, useMemo, useState } from "react";
import Layout from "../../../Components/transito/Layout";

import {
  listarAtencionesCentral,
  listarAgentesCentral,
  listarAlertasCentral,
  finalizadaCentral,
  fechaCentral,
  fechaRegistroCentral,
  tipoCentral,
  lugarCentral,
  idAtencionCentral,
  idAgenteCentral,
  idAlertaCentral,
  nombreAgenteCentral,
} from "../../../Services/centralTransitoService";

function obtenerInforme(atencion) {
  return (
    atencion.informe ||
    atencion.descripcionFinal ||
    atencion.observacionesFinales ||
    atencion.descripcion ||
    ""
  );
}

function fechaCierre(atencion) {
  return (
    atencion.fechaFinalizacion ||
    atencion.fechaCierre ||
    atencion.fechaFin ||
    atencion.fechaAtencion ||
    fechaRegistroCentral(atencion)
  );
}

function esHoy(valor) {
  if (!valor) return false;

  const fecha = new Date(valor);

  return (
    !Number.isNaN(fecha.getTime()) &&
    fecha.toDateString() === new Date().toDateString()
  );
}

export default function Informes() {
  const [atenciones, setAtenciones] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [pestania, setPestania] = useState("pendiente");
  const [seleccionado, setSeleccionado] = useState(null);
  const [estado, setEstado] = useState("Resuelta");
  const [texto, setTexto] = useState("");
  const [buscar, setBuscar] = useState("");
  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState([]);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const resultados = await Promise.allSettled([
        listarAtencionesCentral(),
        listarAgentesCentral(),
        listarAlertasCentral(),
      ]);

      if (!activo) return;

      const [rAtenciones, rAgentes, rAlertas] =
        resultados;

      const mensajes = [];

      if (rAtenciones.status === "fulfilled") {
        setAtenciones(rAtenciones.value);
      } else {
        mensajes.push(
          "No se pudieron consultar las atenciones."
        );
      }

      if (rAgentes.status === "fulfilled") {
        setAgentes(rAgentes.value);
      } else {
        mensajes.push(
          "No se pudieron consultar los agentes."
        );
      }

      if (rAlertas.status === "fulfilled") {
        setAlertas(rAlertas.value);
      } else {
        mensajes.push(
          "No se pudieron consultar los datos de las alertas."
        );
      }

      setErrores(mensajes);
      setCargando(false);
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  const casos = useMemo(() => {
    return atenciones
      .filter(finalizadaCentral)
      .map((atencion) => {
        const idAgente =
          atencion.idAgenteTransito ??
          atencion.agenteTransitoId;

        const agente = agentes.find(
          (item) =>
            idAgente != null &&
            String(idAgenteCentral(item)) ===
              String(idAgente)
        );

        const alerta = alertas.find(
          (item) =>
            atencion.idAlerta != null &&
            String(idAlertaCentral(item)) ===
              String(atencion.idAlerta)
        );

        const origen = alerta || atencion;
        const cierre = fechaCierre(atencion);
        const informe = obtenerInforme(atencion);

        const tipo =
          tipoCentral(origen) === "Sin tipo registrado"
            ? tipoCentral(atencion)
            : tipoCentral(origen);

        const barrio = lugarCentral(origen);

        return {
          id: idAtencionCentral(atencion),
          caso: `${tipo} · ${barrio}`,
          barrio,
          agente:
            agente
              ? nombreAgenteCentral(agente)
              : atencion.nombreAgente ||
                "No identificado",
          cierre: fechaCentral(cierre),
          fechaCierre: cierre,
          informe: String(informe).trim(),
          original: atencion,
        };
      });
  }, [atenciones, agentes, alertas]);

  const pendientes = casos.filter(
    (caso) => !caso.informe
  );

  const completadosHoy = casos.filter(
    (caso) =>
      Boolean(caso.informe) &&
      esHoy(caso.fechaCierre)
  );

  const filasBase =
    pestania === "pendiente"
      ? pendientes
      : completadosHoy;

  const filas = filasBase.filter((caso) =>
    [
      caso.caso,
      caso.barrio,
      caso.agente,
      caso.cierre,
      caso.informe,
    ]
      .join(" ")
      .toLocaleLowerCase("es-CO")
      .includes(
        buscar.trim().toLocaleLowerCase("es-CO")
      )
  );

  function abrir(caso) {
    setSeleccionado(caso);
    setEstado("Resuelta");
    setTexto("");
  }

  function cerrar() {
    setSeleccionado(null);
    setTexto("");
  }

  return (
    <Layout
      rol="central"
      titulo="Informes de casos"
      activo="reportes"
      busqueda={{
        placeholder: "Buscar por caso, barrio o agente...",
      }}
    >
      <div className="mb-4">
        <h1 className="section-title-dash">
          Informes de casos
        </h1>

        <p className="section-text-dash mb-0">
          Consulta los casos atendidos y prepara
          lo que el agente reportó por radio.
        </p>
      </div>

      {cargando && (
        <div className="alert alert-info">
          Cargando informes...
        </div>
      )}

      {errores.length > 0 && (
        <div className="alert alert-warning">
          {errores.join(" ")}
        </div>
      )}

      <div className="table-card-dash">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div className="d-flex gap-2 tabs-dash flex-wrap">
            <button
              type="button"
              className={`tab-dash ${
                pestania === "pendiente"
                  ? "active-dash"
                  : ""
              }`}
              onClick={() =>
                setPestania("pendiente")
              }
            >
              Pendientes de informe ({pendientes.length})
            </button>

            <button
              type="button"
              className={`tab-dash ${
                pestania === "completado"
                  ? "active-dash"
                  : ""
              }`}
              onClick={() =>
                setPestania("completado")
              }
            >
              Completados hoy ({completadosHoy.length})
            </button>
          </div>

          <div className="input-group search-panel-dash">
            <span className="input-group-text bg-white border-0">
              <i className="bi bi-search" />
            </span>

            <input
              type="search"
              className="form-control border-0"
              placeholder="Buscar caso, barrio o agente..."
              value={buscar}
              onChange={(e) =>
                setBuscar(e.target.value)
              }
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Caso</th>
                <th>Barrio</th>
                <th>Agente</th>
                <th>Hora de cierre</th>
                <th className="text-end"></th>
              </tr>
            </thead>

            <tbody>
              {filas.map((caso, indice) => (
                <tr key={caso.id ?? indice}>
                  <td>{caso.caso}</td>
                  <td>{caso.barrio}</td>
                  <td>{caso.agente}</td>
                  <td>{caso.cierre}</td>

                  <td className="text-end">
                    {caso.informe ? (
                      <span className="text-muted small">
                        {caso.informe}
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn-asignar-dash"
                        onClick={() => abrir(caso)}
                      >
                        Completar informe
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filas.length === 0 && (
          <p
            className="text-center text-muted small mb-0"
            style={{ padding: 20 }}
          >
            No hay casos en esta pestaña.
          </p>
        )}
      </div>

      {seleccionado && (
        <div className="panel-card-dash mt-4">
          <h2 className="panel-title-dash">
            Completar informe · {seleccionado.caso}
          </h2>

          <div className="row g-3">
            <div className="col-md-6">
              <label
                className="config-field-label-dash"
                htmlFor="agenteInformeCentral"
              >
                Agente que atendió
              </label>

              <input
                id="agenteInformeCentral"
                type="text"
                className="form-control"
                value={seleccionado.agente}
                disabled
                readOnly
              />
            </div>

            <div className="col-md-6">
              <label
                className="config-field-label-dash"
                htmlFor="estadoInformeCentral"
              >
                Estado final del caso
              </label>

              <select
                id="estadoInformeCentral"
                className="form-select"
                value={estado}
                onChange={(e) =>
                  setEstado(e.target.value)
                }
              >
                <option>Resuelta</option>
                <option>Remitida a otra entidad</option>
                <option>Falsa alarma</option>
              </select>
            </div>

            <div className="col-12">
              <label
                className="config-field-label-dash"
                htmlFor="textoInformeCentral"
              >
                Lo reportado por el agente (vía radio)
              </label>

              <textarea
                id="textoInformeCentral"
                className="form-control"
                rows={4}
                value={texto}
                onChange={(e) =>
                  setTexto(e.target.value)
                }
                placeholder="Escribe lo que informó el agente sobre la atención del caso..."
              />
            </div>

            <div className="col-12">
              <div className="alert alert-warning small mb-0">
                Este formulario todavía no guarda
                informes en la API. Necesitamos
                confirmar el endpoint y los campos
                del informe para habilitar el guardado.
              </div>
            </div>

            <div className="col-12 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn-secundario-dash"
                onClick={cerrar}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-asignar-dash"
                disabled
                title="Pendiente de integrar con el backend"
              >
                Guardar informe
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
