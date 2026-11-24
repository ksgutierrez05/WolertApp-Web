import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CENTRO = [10.4769, -73.2509];

const icono = L.divIcon({
  className: "ut-mapa-marker",
  html: '<div class="ut-mapa-pin"><i class="bi bi-car-front-fill"></i></div>',
  iconSize: [38, 42],
  iconAnchor: [19, 42],
});

function SelectorPunto({ seleccionar }) {
  useMapEvents({
    click(e) {
      seleccionar([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
}

function AjustarMapa() {
  const mapa = useMap();

  useEffect(() => {
    const tiempo = setTimeout(() => mapa.invalidateSize(), 150);
    return () => clearTimeout(tiempo);
  }, [mapa]);

  return null;
}

export default function SelectorUbicacionUnidad({
  latitud,
  longitud,
  confirmar,
  cerrar,
}) {
  const [posicion, setPosicion] = useState(() => {
    const lat = Number(latitud);
    const lng = Number(longitud);

    return latitud != null &&
      longitud != null &&
      String(latitud).trim() !== "" &&
      String(longitud).trim() !== "" &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180
      ? [lat, lng]
      : null;
  });

  useEffect(() => {
    function teclado(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        cerrar();
      }
    }

    document.addEventListener("keydown", teclado);

    return () =>
      document.removeEventListener("keydown", teclado);
  }, [cerrar]);

  return createPortal(
    <div className="ut-mapa-overlay">
      <div
        className="ut-mapa-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ut-mapa-titulo"
      >
        <header className="ut-mapa-header">
          <span className="ut-mapa-header-icon">
            <i className="bi bi-geo-alt-fill" />
          </span>

          <div className="ut-mapa-header-info">
            <small>DIRECCION DE TRANSITO</small>
            <h2 id="ut-mapa-titulo">
              Ubicación de la unidad
            </h2>
            <p>
              Selecciona el punto donde estará ubicada la unidad.
            </p>
          </div>

          <button
            type="button"
            className="ut-mapa-cerrar"
            aria-label="Cerrar mapa"
            onClick={cerrar}
          >
            <i className="bi bi-x-lg" />
          </button>
        </header>

        <div className="ut-mapa-body">
          <MapContainer
            center={posicion || CENTRO}
            zoom={posicion ? 16 : 14}
            scrollWheelZoom={true}
            className="ut-mapa-leaflet"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            <AjustarMapa />

            <SelectorPunto seleccionar={setPosicion} />

            {posicion && (
              <Marker
                position={posicion}
                icon={icono}
              />
            )}
          </MapContainer>

          <div className="ut-mapa-coordenadas">
            <span className="ut-mapa-coord-icon">
              <i className="bi bi-pin-map-fill" />
            </span>

            <div>
              <small>Ubicación seleccionada</small>
              <strong>
                {posicion
                  ? `${posicion[0].toFixed(6)}, ${posicion[1].toFixed(6)}`
                  : "Haz clic sobre el mapa"}
              </strong>
            </div>
          </div>
        </div>

        <footer className="ut-mapa-footer">
          <button
            type="button"
            className="ut-mapa-cancelar"
            onClick={cerrar}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="ut-mapa-confirmar"
            disabled={!posicion}
            onClick={() =>
              confirmar(
                posicion[0].toFixed(6),
                posicion[1].toFixed(6)
              )
            }
          >
            <i className="bi bi-check2-circle me-2" />
            Confirmar ubicación
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}