
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import Topbar from "../../Components/Administrador-policia/Topbar";
import Kpis from "../../Components/Administrador-policia/Kpicard";
import { obtenerCentroOperaciones } from "../../Services/CentroOperacionesAdminService";
import {
  calcularIndicadores,
  obtenerAlertasRecientes
} from "../../Utils/centroOperacionesAdmin";

import "../../css/Policia/administrador-policia/css/centro-operaciones.css";

function MapaPolicial({ unidades, alertas }) {
  const puntos = useMemo(() => {
    const crearPunto = (item, tipo) => ({
      id: `${tipo}-${item.idUnidad ?? item.idAlerta}`,
      nombre: tipo === "unidad"
        ? item.nombre || `Unidad #${item.idUnidad}`
        : item.tipo || `Alerta #${item.idAlerta}`,
      tipo: tipo === "unidad" ? "Unidad policial" : "Alerta",
      lat: Number(item.latitud),
      lng: Number(item.longitud),
      color: tipo === "unidad" ? "#007b60" : "#df4755"
    });

    return [
      ...(unidades || [])
        .filter(u => u.latitud != null && u.longitud != null)
        .map(u => crearPunto(u, "unidad")),
      ...(alertas || [])
        .filter(a => a.latitud != null && a.longitud != null)
        .map(a => crearPunto(a, "alerta"))
    ].filter(p =>
      Number.isFinite(p.lat) &&
      Number.isFinite(p.lng) &&
      Math.abs(p.lat) <= 90 &&
      Math.abs(p.lng) <= 180 &&
      !(p.lat === 0 && p.lng === 0)
    );
  }, [unidades, alertas]);

  if (!puntos.length) {
    return (
      <div className="co-mapa-vacio">
        <i className="bi bi-geo-alt" />
        <strong>Sin ubicaciones disponibles</strong>
        <span>
          Las unidades y alertas con coordenadas aparecerán aquí.
        </span>
      </div>
    );
  }

  return (
    <MapContainer
      center={[puntos[0].lat, puntos[0].lng]}
      zoom={12}
      scrollWheelZoom={false}
      className="co-mapa-real"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {puntos.map(p => (
        <CircleMarker
          key={p.id}
          center={[p.lat, p.lng]}
          radius={8}
          pathOptions={{
            color: p.color,
            fillColor: p.color,
            fillOpacity: 0.85
          }}
        >
          <Popup>
            <strong>{p.nombre}</strong>
            <div>{p.tipo}</div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

export default function CentroOperaciones() {
  const [datos, setDatos] = useState(null);
  const [errores, setErrores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recarga, setRecarga] = useState(0);

  const actualizar = useCallback(() => {
    setRecarga(v => v + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    setErrores([]);

    obtenerCentroOperaciones(controller.signal)
      .then(resultado => {
        if (controller.signal.aborted) return;
        setDatos(resultado.datos);
        setErrores(resultado.errores);
      })
      .catch(error => {
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
    year: "numeric"
  });

  const estadisticas = [
    {
      titulo: "Total de policías",
      valor: kpis.totalPolicias,
      icono: "bi-people-fill",
      tono: "azul"
    },
    {
      titulo: "Total de unidades",
      valor: kpis.totalUnidades,
      icono: "bi-shield-fill-check",
      tono: "verde"
    },
    {
      titulo: "Asignaciones activas",
      valor: kpis.asignacionesActivas,
      icono: "bi-clipboard2-check-fill",
      tono: "ambar"
    }
  ];

  return (
    <>
      <Topbar placeholder="Centro de Operaciones" />

      <section className="hero-dash mb-4">
        <p className="eyebrow-dash">
          <i className="bi bi-shield-check me-2" />
          CENTRO DE OPERACIONES · {fecha}
        </p>
        <h1 className="hero-title-dash">
          Centro de Operaciones
        </h1>
        <p className="hero-text-dash">
          Consulta las alertas, atenciones y recursos
          policiales registrados en el sistema.
        </p>
        <i className="bi bi-shield-fill-check hero-icon-dash" />
      </section>

      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-outline-success"
          type="button"
          onClick={actualizar}
          disabled={cargando}
        >
          <i className="bi bi-arrow-clockwise me-2" />
          {cargando ? "Consultando..." : "Actualizar datos"}
        </button>
      </div>

      {errores.length > 0 && (
        <div className="alert alert-warning" role="alert">
          <strong>Algunas consultas no se completaron:</strong>
          <ul className="mb-0 mt-2">
            {errores.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      <Kpis
        grupo="centro-principal"
        valores={kpis}
        cargando={cargando}
      />

      <div className="row g-3 mb-4">
        <section className="col-lg-6">
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
              <p className="co-mensaje">
                No hay alertas registradas.
              </p>
            ) : (
              <div className="co-alertas">
                {recientes.map(a => (
                  <article className="co-alerta" key={a.id}>
                    <span className="co-alerta-icono">
                      <i className="bi bi-exclamation-triangle" />
                    </span>
                    <div className="co-alerta-info">
                      <strong>{a.tipo.replaceAll("_", " ")}</strong>
                      <span>
                        <i className="bi bi-geo-alt me-1" />
                        {a.barrio}
                      </span>
                      <small>{a.estado.replaceAll("_", " ")}</small>
                    </div>
                    <time>{a.hora}</time>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="col-lg-6">
          <div className="card-panel-dash co-panel h-100">
            <div className="encabezado-panel-dash">
              <h2 className="section-title-dash">
                <i className="bi bi-geo-alt-fill" />
                Mapa policial
              </h2>
              <span className="co-subtitulo">
                Unidades y alertas
              </span>
            </div>

            <div className="map-box-dash">
              <MapaPolicial
                unidades={datos?.unidades}
                alertas={datos?.alertas}
              />
            </div>

            <div className="co-leyenda">
              <span><i className="co-punto co-verde" /> Unidades</span>
              <span><i className="co-punto co-rojo" /> Alertas</span>
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

        <Kpis
          grupo="centro-operativo"
          valores={kpis}
          cargando={cargando}
        />

        <div className="co-estadisticas">
          {estadisticas.map(item => (
            <article
              className={`co-estadistica co-estadistica--${item.tono}`}
              key={item.titulo}
            >
              <span className="co-estadistica-icono">
                <i className={`bi ${item.icono}`} />
              </span>
              <div className="co-estadistica-contenido">
                <span>{item.titulo}</span>
                <strong>
                  {cargando ? "..." : item.valor ?? "—"}
                </strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
