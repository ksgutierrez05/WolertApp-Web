
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "../../css/Policia/administrador-policia/css/mapa-unidades-policiales.css";

/* ==========================================
   CONFIGURACIÓN MAPBOX
========================================== */

const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_TOKEN?.trim() || "";

const CENTRO_VALLEDUPAR = [10.4795, -73.2536];

const ESTILOS_MAPBOX = {
  calles: "mapbox/streets-v12",
  satelite: "mapbox/satellite-streets-v12",
  oscuro: "mapbox/dark-v11",
};

function obtenerUrlMapbox(estilo) {
  return (
    `https://api.mapbox.com/styles/v1/${estilo}` +
    `/tiles/{z}/{x}/{y}` +
    `?access_token=${MAPBOX_TOKEN}`
  );
}

/* ==========================================
   ICONOS
   Solo se muestran dentro del mapa
========================================== */


const ICONO_UNIDAD = L.icon({
  iconUrl: "../../../public/img/CAIMAPA.png",
  iconSize: [78, 102],
  iconAnchor: [39, 101],
  popupAnchor: [0, -96],
  className: "unidad-marcador-policia",
});

const ICONO_SELECCION = L.icon({
  iconUrl: "../../../public/img/CAIMAPA.png",
  iconSize: [90, 118],
  iconAnchor: [45, 117],
  popupAnchor: [0, -110],
  className: "unidad-marcador-seleccionado",
});


/* ==========================================
   FUNCIONES AUXILIARES
========================================== */

function coordenadasValidas(latitud, longitud) {
  if (
    latitud === null ||
    latitud === undefined ||
    latitud === "" ||
    longitud === null ||
    longitud === undefined ||
    longitud === ""
  ) {
    return false;
  }

  const lat = Number(latitud);
  const lng = Number(longitud);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function obtenerPosicion(unidad) {
  if (
    !coordenadasValidas(
      unidad?.latitud,
      unidad?.longitud
    )
  ) {
    return null;
  }

  return [
    Number(unidad.latitud),
    Number(unidad.longitud),
  ];
}

function estadoUnidad(unidad) {
  return String(unidad?.estado || "SIN ESTADO")
    .trim()
    .toUpperCase();
}

/* ==========================================
   SELECCIONAR UBICACIÓN
========================================== */

function SeleccionarUbicacion({ onSeleccionar }) {
  useMapEvents({
    click(evento) {
      const { lat, lng } = evento.latlng;

      onSeleccionar?.({
        latitud: lat.toFixed(6),
        longitud: lng.toFixed(6),
      });
    },
  });

  return null;
}

/* ==========================================
   CENTRAR MAPA
========================================== */

function CentrarUbicacion({ posicion }) {
  const mapa = useMap();
  const anterior = useRef(null);

  useEffect(() => {
    if (!posicion) return;

    const clave = posicion.join(",");

    if (anterior.current === clave) return;

    anterior.current = clave;

    mapa.flyTo(
      posicion,
      Math.max(mapa.getZoom(), 15),
      {
        animate: true,
        duration: 0.6,
      }
    );
  }, [mapa, posicion]);

  return null;
}

/* ==========================================
   AJUSTAR TAMAÑO DEL MAPA
========================================== */

function AjustarMapa() {
  const mapa = useMap();

  useEffect(() => {
    const ajustar = () => mapa.invalidateSize();

    const frame = requestAnimationFrame(ajustar);

    const contenedor = mapa.getContainer();

    const observador =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(ajustar)
        : null;

    observador?.observe(contenedor);

    return () => {
      cancelAnimationFrame(frame);
      observador?.disconnect();
    };
  }, [mapa]);

  return null;
}

/* ==========================================
   COMPONENTE PRINCIPAL
========================================== */

export default function MapaUnidadesPoliciales({
  unidades = [],
  seleccion = null,
  onSeleccionar,
}) {
  const [mostrarUnidades, setMostrarUnidades] =
    useState(true);

  const posicionSeleccionada = useMemo(
    () => obtenerPosicion(seleccion),
    [seleccion?.latitud, seleccion?.longitud]
  );

  const unidadesUbicadas = useMemo(() => {
    return (Array.isArray(unidades) ? unidades : [])
      .filter((unidad) =>
        coordenadasValidas(
          unidad.latitud,
          unidad.longitud
        )
      );
  }, [unidades]);

  const centroInicial = useMemo(() => {
    if (posicionSeleccionada) {
      return posicionSeleccionada;
    }

    const primeraUnidad = unidadesUbicadas[0];

    return primeraUnidad
      ? obtenerPosicion(primeraUnidad)
      : CENTRO_VALLEDUPAR;
  }, []);

  return (
    <div className="mapa-unidades-contenedor">
      <MapContainer
        center={centroInicial}
        zoom={14}
        minZoom={5}
        maxZoom={19}
        scrollWheelZoom
        zoomControl
        className="mapa-unidades-leaflet"
      >
        {/* CAPAS DEL MAPA */}

        <LayersControl
          position="topright"
          collapsed
        >
          {MAPBOX_TOKEN ? (
            <>
              <LayersControl.BaseLayer
                checked
                name="Calles"
              >
                <TileLayer
                  url={obtenerUrlMapbox(
                    ESTILOS_MAPBOX.calles
                  )}
                  attribution="&copy; Mapbox &copy; OpenStreetMap"
                  tileSize={512}
                  zoomOffset={-1}
                  maxZoom={19}
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer
                name="Satélite"
              >
                <TileLayer
                  url={obtenerUrlMapbox(
                    ESTILOS_MAPBOX.satelite
                  )}
                  attribution="&copy; Mapbox &copy; OpenStreetMap"
                  tileSize={512}
                  zoomOffset={-1}
                  maxZoom={19}
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer
                name="Oscuro"
              >
                <TileLayer
                  url={obtenerUrlMapbox(
                    ESTILOS_MAPBOX.oscuro
                  )}
                  attribution="&copy; Mapbox &copy; OpenStreetMap"
                  tileSize={512}
                  zoomOffset={-1}
                  maxZoom={19}
                />
              </LayersControl.BaseLayer>
            </>
          ) : (
            <LayersControl.BaseLayer
              checked
              name="OpenStreetMap"
            >
              <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
                maxZoom={19}
              />
            </LayersControl.BaseLayer>
          )}
        </LayersControl>

        <SeleccionarUbicacion
          onSeleccionar={onSeleccionar}
        />

        <AjustarMapa />

        <CentrarUbicacion
          posicion={posicionSeleccionada}
        />

        {/* UNIDADES REGISTRADAS */}

        {mostrarUnidades &&
          unidadesUbicadas.map((unidad) => {
            const posicion = obtenerPosicion(unidad);

            const esUnidadEditada =
              seleccion?.idUnidad != null &&
              String(seleccion.idUnidad) ===
                String(unidad.idUnidad);

            if (!posicion || esUnidadEditada) {
              return null;
            }

            return (
              <Marker
                key={unidad.idUnidad}
                position={posicion}
                icon={ICONO_UNIDAD}
              >
                <Popup
                  className="unidad-popup-leaflet"
                  maxWidth={260}
                >
                  <div className="unidad-popup">
                    <div className="unidad-popup-encabezado">
                      <div className="unidad-popup-simbolo">
                        <i className="bi bi-shield-check" />
                      </div>

                      <div>
                        <strong>
                          {unidad.nombre ||
                            "Unidad policial"}
                        </strong>

                        <span>
                          Unidad #{unidad.idUnidad}
                        </span>
                      </div>
                    </div>

                    <div className="unidad-popup-contenido">
                      <div>
                        <span>Estado</span>

                        <strong
                          className={`unidad-popup-${estadoUnidad(
                            unidad
                          ).toLowerCase()}`}
                        >
                          {estadoUnidad(unidad)}
                        </strong>
                      </div>

                      <div>
                        <span>Latitud</span>
                        <strong>
                          {Number(
                            unidad.latitud
                          ).toFixed(6)}
                        </strong>
                      </div>

                      <div>
                        <span>Longitud</span>
                        <strong>
                          {Number(
                            unidad.longitud
                          ).toFixed(6)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* MARCADOR SELECCIONADO */}

        {posicionSeleccionada && (
          <Marker
            position={posicionSeleccionada}
            icon={ICONO_SELECCION}
            draggable
            zIndexOffset={1000}
            eventHandlers={{
              dragend(evento) {
                const posicion =
                  evento.target.getLatLng();

                onSeleccionar?.({
                  latitud:
                    posicion.lat.toFixed(6),
                  longitud:
                    posicion.lng.toFixed(6),
                });
              },
            }}
          >
            <Popup className="unidad-popup-leaflet">
              <div className="unidad-popup-seleccion">
                <div className="unidad-popup-seleccion-icono">
                  <i className="bi bi-geo-alt-fill" />
                </div>

                <strong>
                  Ubicación seleccionada
                </strong>

                <p>
                  Arrastra el marcador para
                  ajustar la ubicación.
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

    

      {/* MOSTRAR UNIDADES */}

      <label className="mapa-unidades-mostrar">
        <input
          type="checkbox"
          checked={mostrarUnidades}
          onChange={(e) =>
            setMostrarUnidades(e.target.checked)
          }
        />
        <span>Mostrar unidades</span>
      </label>

      {/* LEYENDA */}

      <div className="mapa-unidades-leyenda">
        <span className="mapa-unidades-punto" />
        Unidades policiales

        {posicionSeleccionada && (
          <>
            <span className="mapa-unidades-separador" />
            <span className="mapa-unidades-punto seleccionado" />
            Seleccionada
          </>
        )}
      </div>

      {/* INSTRUCCIONES */}

      <div className="mapa-unidades-instruccion">
        <i className="bi bi-cursor-fill" />

        <span>
          {posicionSeleccionada
            ? "Arrastra el marcador para ajustar la ubicación."
            : "Haz clic en el mapa para ubicar la unidad."}
        </span>
      </div>
    </div>
  );
}
