import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MapaOperaciones from "../../Components/Central-policia/MapaOperaciones";
import "../../css/Policia/central-policia/css/Mapa.css";

import Topbar from "../../Components/Administrador-policia/Topbar";
import Kpis from "../../Components/Administrador-policia/Kpicard";
import { obtenerCentroOperaciones } from "../../Services/CentroOperacionesAdminService";
import {
  calcularIndicadores,
  obtenerAlertasRecientes,
} from "../../Services/CentroOperacionesAdminService";

import "../../css/Policia/administrador-policia/css/centro-operaciones.css";

function estiloAlerta(tipo) {
  const t = String(tipo ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
  if (/ROBO|HURTO/.test(t)) return ["bi-shield-exclamation", "rojo"];
  if (/ACCIDENTE|TRANSITO/.test(t)) return ["bi-car-front-fill", "ambar"];
  if (/TERREMOTO|SISMO/.test(t)) return ["bi-activity", "morado"];
  if (/MEDIC|SALUD/.test(t)) return ["bi-heart-pulse-fill", "verde"];
  if (/INCENDIO/.test(t)) return ["bi-fire", "naranja"];
  if (/INUNDACION/.test(t)) return ["bi-water", "azul"];
  if (/RIÑA|RINA|VIOLENCIA/.test(t))
    return ["bi-shield-fill-exclamation", "rojo"];
  return ["bi-bell-fill", "azul"];
}

export default function CentroOperaciones() {
  const [datos, setDatos] = useState(null);
  const [errores, setErrores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [expandido, setExpandido] = useState(false);

  useEffect(() => {
    if (!expandido) return;
    const cerrar = (e) => {
      if (e.key === "Escape") setExpandido(false);
    };
    window.addEventListener("keydown", cerrar);
    return () => window.removeEventListener("keydown", cerrar);
  }, [expandido]);

  const actualizar = useCallback(() => {
    setRecarga((v) => v + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    setErrores([]);

    obtenerCentroOperaciones(controller.signal)
      .then((resultado) => {
        if (controller.signal.aborted) return;
        setDatos(resultado.datos);
        setErrores(resultado.errores);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setDatos(null);
        setErrores([error.message]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false);
      });

    return () => controller.abort();
  }, [recarga]);

  const kpis = calcularIndicadores(datos || {});
  const recientes = obtenerAlertasRecientes(datos?.alertas);

  const fecha = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Topbar placeholder="Centro de Operaciones" />

      <section className="hero-dash co-admin-hero mb-4">
        <h1 className="hero-title-dash">Bienvenido, Administrador Policia</h1>
        <p className="hero-text-dash">
          Consulta las alertas, atenciones y recursos policiales registrados en
          el sistema.
        </p>
        <i className="bi bi-shield-fill-check hero-icon-dash" />
      </section>

      {errores.length > 0 && (
        <div className="alert alert-warning" role="alert">
          <strong>Algunas consultas no se completaron:</strong>
          <ul className="mb-0 mt-2">
            {errores.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <Kpis grupo="centro-principal" valores={kpis} cargando={cargando} />

      <div className="row g-3 mb-4 co-admin-grid">
        <section className="col-12 col-xl-6">
          <div className="card-panel-dash co-panel h-100">
            <div className="encabezado-panel-dash">
              <h2 className="section-title-dash">
                <i className="bi bi-bell-fill" />
                Alertas recientes
              </h2>

              <Link
                to="/Administrador-Policia/Alertas"
                className="see-all-dash"
              >
                Ver todas <i className="bi bi-arrow-right" />
              </Link>
            </div>

            {cargando ? (
              <p className="co-mensaje">Cargando alertas...</p>
            ) : !Array.isArray(datos?.alertas) ? (
              <p className="co-mensaje">
                No se pudo consultar la lista de alertas.
              </p>
            ) : recientes.length === 0 ? (
              <p className="co-mensaje">No hay alertas registradas.</p>
            ) : (
              <div className="co-alertas">
                {recientes.map((a) => (
                  <article className="co-alerta" key={a.id}>
                    <span
                      className={`co-alerta-icono co-tipo-${estiloAlerta(a.tipo)[1]}`}
                    >
                      <i className={`bi ${estiloAlerta(a.tipo)[0]}`} />
                    </span>
                    <div className="co-alerta-info">
                      <strong>{a.tipo.replaceAll("_", " ")}</strong>
                      <span>
                        <i className="bi bi-geo-alt me-1" />
                        {a.barrio}
                      </span>
                      <small
                        className={`co-estado co-estado-${a.estado.toLowerCase().replaceAll(" ", "_")}`}
                      >
                        {a.estado.replaceAll("_", " ")}
                      </small>
                    </div>
                    <time>{a.hora}</time>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="col-12 col-xl-6">
          <div
            className={`card-panel-dash co-panel co-admin-mapa ${expandido ? "co-admin-mapa-expandido" : ""}`}
          >
            <div className="encabezado-panel-dash">
              <h2 className="section-title-dash">
                <i className="bi bi-geo-alt-fill" /> Mapa de operaciones
              </h2>
              <button
                type="button"
                className="co-expandir"
                aria-expanded={expandido}
                onClick={() => setExpandido((v) => !v)}
              >
                <i
                  className={`bi ${expandido ? "bi-arrows-angle-contract" : "bi-arrows-angle-expand"}`}
                />
                {expandido ? "Contraer mapa" : "Expandir mapa"}
              </button>
            </div>
            <div className="mapa-central-page co-admin-mapa-contenido">
              <MapaOperaciones
                datos={{
                  alarmas: datos?.alarmas ?? [],
                  unidades: datos?.unidades ?? [],
                  alertas: datos?.alertas ?? [],
                }}
                cargando={cargando}
                onActualizar={actualizar}
              />
            </div>
          </div>
        </section>
      </div>

      <section className="card-panel-dash co-panel mb-4">
        <div className="encabezado-panel-dash">
          <h2 className="section-title-dash">
            <i className="bi bi-activity" />
            Estado operativo
          </h2>
        </div>

        <Kpis grupo="centro-operativo" valores={kpis} cargando={cargando} />
      </section>
    </>
  );
}
