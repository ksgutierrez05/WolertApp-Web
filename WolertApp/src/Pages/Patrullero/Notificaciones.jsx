
import { useEffect, useState } from "react";
import PageHeader from "../../Components/Patrullero/Pageheader";
import {
  ListarMisNotificaciones,
  FormatearFecha,
} from "../../Services/PoliciaService";
import {
  leerIdsLeidos,
  guardarIdsLeidos,
} from "../../Services/notificacionesEstado";

import "../../css/Policia/Patrullero/css/notificaciones.css";

export default function Notificaciones() {
  const [filtro, setFiltro] = useState("todas");
  const [notificaciones, setNotificaciones] = useState([]);
  const [leidas, setLeidas] = useState(leerIdsLeidos);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const resultado = await ListarMisNotificaciones();

        if (!activo) return;

        setNotificaciones(
          Array.isArray(resultado) ? resultado : []
        );
        setLeidas(leerIdsLeidos());
        setError("");
      } catch (err) {
        if (activo) {
          setError(
            err.message ||
              "No se pudieron cargar las notificaciones."
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();

    const intervalo = window.setInterval(cargar, 30000);

    const sincronizar = () => {
      setLeidas(leerIdsLeidos());
    };

    window.addEventListener(
      "wolertapp:notificaciones",
      sincronizar
    );
    window.addEventListener("storage", sincronizar);

    return () => {
      activo = false;
      window.clearInterval(intervalo);

      window.removeEventListener(
        "wolertapp:notificaciones",
        sincronizar
      );
      window.removeEventListener("storage", sincronizar);
    };
  }, []);

  const estaLeida = (notificacion) =>
    leidas.includes(String(notificacion.idNotificacion));

  const marcarLeida = (id) => {
    setLeidas(guardarIdsLeidos([...leidas, id]));
  };

  const marcarTodas = () => {
    setLeidas(
      guardarIdsLeidos([
        ...leidas,
        ...notificaciones.map((n) => n.idNotificacion),
      ])
    );
  };

  const pendientes = notificaciones.filter(
    (n) => !estaLeida(n)
  ).length;

  const filtradas = [...notificaciones]
    .sort(
      (a, b) =>
        new Date(b.fecha || 0) - new Date(a.fecha || 0)
    )
    .filter(
      (n) => filtro === "todas" || !estaLeida(n)
    );

  return (
    <div className="container-fluid notificaciones-patrullero">
      <PageHeader
        titulo="Notificaciones"
        descripcion="Comunicaciones recibidas de la Central de Radio y del sistema."
      />

    

      <div className="nt-barra">
        <div className="nt-filterbar">
          <button
            type="button"
            className={`nt-chip ${
              filtro === "todas" ? "active" : ""
            }`}
            onClick={() => setFiltro("todas")}
          >
            Todas
            <span>{notificaciones.length}</span>
          </button>

          <button
            type="button"
            className={`nt-chip ${
              filtro === "no-leidas" ? "active" : ""
            }`}
            onClick={() => setFiltro("no-leidas")}
          >
            No leídas
            <span>{pendientes}</span>
          </button>
        </div>

        <button
          type="button"
          className="nt-marcar-todas"
          onClick={marcarTodas}
          disabled={cargando || pendientes === 0}
        >
          <i className="bi bi-check2-all" />
          Marcar todas como leídas
        </button>
      </div>

      {cargando && (
        <p className="nt-mensaje">
          Cargando notificaciones...
        </p>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <section className="nt-panel">
        {!cargando &&
          !error &&
          (filtradas.length === 0 ? (
            <div className="nt-vacio">
              <span className="nt-vacio-icono">
                <i className="bi bi-bell-slash" />
              </span>

              <h3>
                {filtro === "no-leidas"
                  ? "No tienes notificaciones pendientes"
                  : "No tienes notificaciones"}
              </h3>

              <p>
                Los avisos de la Central de Radio
                aparecerán aquí.
              </p>
            </div>
          ) : (
            filtradas.map((notificacion) => {
              const sinLeer = !estaLeida(notificacion);

              return (
                <article
                  key={notificacion.idNotificacion}
                  className={`nt-item ${
                    sinLeer ? "sin-leer" : ""
                  }`}
                >
                  <div className="nt-item-icon">
                    <i className="bi bi-bell-fill" />
                  </div>

                  <div className="nt-item-body">
                    <div className="nt-item-title">
                      <strong>
                        {notificacion.mensaje ||
                          "Nueva notificación"}
                      </strong>

                      {sinLeer && (
                        <span className="nt-etiqueta">
                          Nueva
                        </span>
                      )}
                    </div>

                    <div className="nt-item-meta">
                      <span>
                        <i className="bi bi-clock" />
                        {FormatearFecha(
                          notificacion.fecha
                        )}
                      </span>

                      {notificacion.idAlerta != null && (
                        <span>
                          <i className="bi bi-geo-alt" />
                          Alerta #
                          {notificacion.idAlerta}
                        </span>
                      )}
                    </div>
                  </div>

                  {sinLeer ? (
                    <button
                      type="button"
                      className="nt-item-action"
                      onClick={() =>
                        marcarLeida(
                          notificacion.idNotificacion
                        )
                      }
                    >
                      <i className="bi bi-check2" />
                      Marcar leída
                    </button>
                  ) : (
                    <span className="nt-item-read">
                      <i className="bi bi-check2-circle" />
                      Leída
                    </span>
                  )}
                </article>
              );
            })
          ))}
      </section>
    </div>
  );
}
