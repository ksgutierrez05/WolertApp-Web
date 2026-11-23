
import { useEffect, useState } from "react";

import MapaOperaciones from "../../Components/Central-policia/MapaOperaciones";
import { cargarMapaCentral } from "../../Services/mapaCentralService";

import "../../css/Policia/central-policia/css/Mapa.css";

const DATOS_VACIOS = {
  alertas: [],
  alarmas: [],
  unidades: [],
};

export default function Mapa() {
  const [datos, setDatos] = useState(DATOS_VACIOS);
  const [errores, setErrores] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    cargarMapaCentral(controller.signal)
      .then((resultado) => {
        if (controller.signal.aborted) return;

        setDatos(resultado.datos);
        setErrores(resultado.errores);
        setError("");
      })
      .catch((err) => {
        if (controller.signal.aborted) return;

        setError(err.message || "No se pudo cargar el mapa.");
        setDatos(DATOS_VACIOS);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      });

    return () => controller.abort();
  }, [recarga]);

  const actualizar = () => {
    if (cargando) return;

    setCargando(true);
    setRecarga((actual) => actual + 1);
  };

  return (
    <div className="mapa-central-page">
      <header className="mapa-central-barra">
        <div className="mapa-central-identidad">
          <div className="mapa-central-titulo-icono">
            <i className="bi bi-map" aria-hidden="true" />
          </div>

          <div className="mapa-central-nombre">
            <h1>Mapa de operaciones</h1>
            <p>Central de Policía · Monitoreo territorial</p>
          </div>
        </div>

        <div className="mapa-central-barra-derecha">
          <label className="mapa-central-buscador">
            <i className="bi bi-search" aria-hidden="true" />

            <input
              type="search"
              placeholder="Buscar alerta, alarma o unidad..."
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </label>

          <span className="mapa-central-avatar">CR</span>
        </div>
      </header>

      {error && (
        <div
          className="mapa-central-mensaje mapa-central-error"
          role="alert"
        >
          <i className="bi bi-exclamation-circle" />
          {error}
        </div>
      )}

      {errores.length > 0 && (
        <div
          className="mapa-central-mensaje mapa-central-aviso"
          role="status"
        >
          <i className="bi bi-info-circle" />
          Algunas capas no se pudieron cargar: {errores.join(" | ")}
        </div>
      )}

      <div className="mapa-central-contenido">
        <MapaOperaciones
          datos={datos}
          busqueda={busqueda}
          cargando={cargando}
          onActualizar={actualizar}
        />
      </div>
    </div>
  );
}
