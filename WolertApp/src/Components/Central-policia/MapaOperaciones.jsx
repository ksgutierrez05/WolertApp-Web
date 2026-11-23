import { useEffect, useMemo, useRef, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { normalizarMapa } from "../../Services/mapaCentralService";

const COLORES = {
  alarmas: "#ffb74d", // Naranja suave (Amber/Orange 300)

  unidades: "#64b5f6", // Azul suave (Blue 300)

  alertas: "#e57373", // Rojo coral suave (Red 300)
};

const ETIQUETAS = {
  alarmas: "Alarmas",

  unidades: "Unidades",

  alertas: "Alertas",
};

const COLORES_PRIORIDAD = {
  ALTA: "#dc2626",
  MEDIA: "#f59e0b",
  BAJA: "#16a34a",
};

const crearIconoAlerta = (prioridad) => {
  const nivel = String(prioridad ?? "")
    .trim()
    .toUpperCase();
  const color = COLORES_PRIORIDAD[nivel] ?? "#64748b";

  return L.divIcon({
    className: "mapa-central-pin-contenedor",
    html: `
      <div class="mapa-central-pin-alerta" style="--color-prioridad: ${color}">
        <div class="mapa-central-pin-alerta-circulo"></div>
      </div>
    `,
    iconSize: [46, 60],
    iconAnchor: [23, 58],
    popupAnchor: [0, -52],
  });
};

const ICONOS = {
  alarmas: L.icon({
    iconUrl: "../../../public/img/alarma.png",

    iconSize: [52, 60],

    iconAnchor: [26, 59],

    popupAnchor: [0, -52],
  }),

  unidades: L.icon({
    iconUrl: "../../../public/img/CAIMAPA.png",

    iconSize: [58, 70],

    iconAnchor: [29, 69],

    popupAnchor: [0, -62],
  }),
};

function AjustarVista({ puntos, seleccionado }) {
  const map = useMap();

  const ajustado = useRef(false);

  useEffect(() => {
    const actualizarTamano = () => {
      map.invalidateSize();
    };

    const elemento = map.getContainer();

    const observador = new ResizeObserver(actualizarTamano);

    observador.observe(elemento);

    actualizarTamano();

    return () => observador.disconnect();
  }, [map]);

  useEffect(() => {
    if (seleccionado?.posicion) {
      map.flyTo(
        seleccionado.posicion,

        Math.max(map.getZoom(), 15),

        { duration: 0.6 },
      );

      return;
    }

    if (!ajustado.current && puntos.length > 0) {
      ajustado.current = true;

      map.fitBounds(
        L.latLngBounds(puntos.map((punto) => punto.posicion)),

        { padding: [55, 55], maxZoom: 14 },
      );
    }
  }, [map, puntos, seleccionado]);

  return null;
}

function Marcador({ punto, onSeleccionar }) {
  return (
    <>
      {punto.tipo === "alarmas" && punto.radio > 0 && (
        <Circle
          center={punto.posicion}
          radius={punto.radio}
          pathOptions={{
            color: COLORES.alarmas,

            fillColor: COLORES.alarmas,

            fillOpacity: 0.09,

            weight: 1.5,

            dashArray: "6 5",
          }}
        />
      )}

      <Marker
        position={punto.posicion}
        icon={
          punto.tipo === "alertas"
            ? crearIconoAlerta(punto.prioridad)
            : ICONOS[punto.tipo]
        }
        eventHandlers={{
          click: () => onSeleccionar(punto),
        }}
      >
        <Popup>
          <div className="mapa-central-popup">
            <strong>{punto.nombre}</strong>

            <span>{ETIQUETAS[punto.tipo]}</span>

            <p>
              <b>Estado:</b> {punto.estado.replaceAll("_", " ")}
              <br />
              <b>Barrio:</b> {punto.barrio}
              {punto.prioridad && (
                <>
                  <br />
                  <b>Prioridad:</b> {punto.prioridad}
                </>
              )}
              {punto.tipo === "alarmas" && (
                <>
                  <br />
                  <b>Radio:</b> {punto.radio} m
                </>
              )}
            </p>
          </div>
        </Popup>
      </Marker>
    </>
  );
}

function GrupoLista({
  tipo,

  puntos,

  abierto,

  onAlternar,

  seleccionado,

  onSeleccionar,
}) {
  return (
    <section className="mapa-central-grupo">
      <button
        type="button"
        className="mapa-central-acordeon"
        onClick={onAlternar}
        aria-expanded={abierto}
      >
        <span>
          <i style={{ background: COLORES[tipo] }} />
          {ETIQUETAS[tipo]} ({puntos.length})
        </span>

        <i
          className={`bi bi-chevron-${abierto ? "up" : "down"}`}
          aria-hidden="true"
        />
      </button>

      {abierto && (
        <div className="mapa-central-elementos">
          {puntos.length === 0 ? (
            <p className="mapa-central-sin-datos">
              No hay elementos con estos filtros.
            </p>
          ) : (
            puntos.map((punto) => (
              <button
                type="button"
                key={punto.key}
                className={`mapa-central-elemento ${
                  seleccionado?.key === punto.key ? "seleccionado" : ""
                }`}
                onClick={() => onSeleccionar(punto)}
                disabled={!punto.posicion}
              >
                <span className="mapa-central-elemento-info">
                  <strong>{punto.nombre}</strong>

                  <small>
                    <i className="bi bi-geo-alt" />

                    {punto.barrio}
                  </small>
                </span>

                <span
                  className={`mapa-central-estado ${
                    punto.estado === "ACTIVA" || punto.estado === "OPERATIVA"
                      ? "activo"
                      : ""
                  }`}
                >
                  {punto.estado.replaceAll("_", " ")}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </section>
  );
}

export default function MapaOperaciones({
  datos,

  busqueda = "",

  cargando = false,

  onActualizar,
}) {
  const [capas, setCapas] = useState({
    alarmas: true,

    unidades: true,

    alertas: true,
  });

  const [estados, setEstados] = useState({
    alarmas: "TODOS",

    unidades: "TODOS",

    alertas: "TODOS",
  });

  const [abierto, setAbierto] = useState({
    alarmas: true,

    unidades: true,

    alertas: true,
  });

  const [seleccionado, setSeleccionado] = useState(null);

  const puntos = useMemo(() => normalizarMapa(datos), [datos]);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es");

    return puntos.filter((punto) => {
      if (!capas[punto.tipo]) return false;

      if (
        estados[punto.tipo] !== "TODOS" &&
        punto.estado !== estados[punto.tipo]
      ) {
        return false;
      }

      if (!texto) return true;

      return [
        punto.nombre,

        punto.barrio,

        punto.estado,

        punto.id,

        punto.prioridad,
      ]

        .filter((valor) => valor !== undefined && valor !== null)

        .some((valor) => String(valor).toLocaleLowerCase("es").includes(texto));
    });
  }, [puntos, capas, estados, busqueda]);

  const puntosMapa = useMemo(
    () => visibles.filter((punto) => punto.posicion),

    [visibles],
  );

  const seleccionVisible =
    seleccionado && visibles.some((punto) => punto.key === seleccionado.key)
      ? seleccionado
      : null;

  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  const usarMapbox = typeof token === "string" && token.startsWith("pk.");

  const tilesUrl = usarMapbox
    ? `https\://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}?access_token=${encodeURIComponent(token)}`
    : "https\://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className="mapa-central-layout">
      <div className="mapa-central-superficie">
        <MapContainer
          center={[10.4795, -73.2536]}
          zoom={13}
          scrollWheelZoom
          zoomControl
          className="mapa-central-leaflet"
        >
          <TileLayer
            url={tilesUrl}
            attribution={
              usarMapbox
                ? "© Mapbox © OpenStreetMap"
                : "© OpenStreetMap contributors"
            }
          />

          <AjustarVista puntos={puntosMapa} seleccionado={seleccionVisible} />

          {puntosMapa.map((punto) => (
            <Marcador
              key={punto.key}
              punto={punto}
              onSeleccionar={setSeleccionado}
            />
          ))}
        </MapContainer>

        <div className="mapa-central-contador">
          {puntosMapa.length} puntos en el mapa
        </div>

        <div className="mapa-central-leyenda">
          {Object.entries(ETIQUETAS).map(([tipo, nombre]) => (
            <span key={tipo}>
              <i style={{ background: COLORES[tipo] }} />

              {nombre}
            </span>
          ))}
        </div>
      </div>

      <aside className="mapa-central-panel">
        <div className="mapa-central-panel-titulo">
          <div className="mapa-central-panel-icono">
            <i className="bi bi-layers" />
          </div>

          <div className="mapa-central-panel-texto">
            <strong>Operaciones</strong>

            <small>Capas y elementos registrados</small>
          </div>

          <button
            type="button"
            className="mapa-central-actualizar"
            onClick={onActualizar}
            disabled={cargando}
          >
            <i className="bi bi-arrow-clockwise" />

            <span>{cargando ? "Cargando..." : "Actualizar mapa"}</span>
          </button>
        </div>

        <div className="mapa-central-filtros">
          <strong>Mostrar capas</strong>

          <div className="mapa-central-chips">
            {Object.entries(ETIQUETAS).map(([tipo, nombre]) => (
              <button
                type="button"
                key={tipo}
                className={`mapa-central-chip ${capas[tipo] ? "activo" : ""}`}
                style={{ "--capa-color": COLORES[tipo] }}
                onClick={() =>
                  setCapas((anterior) => ({
                    ...anterior,

                    [tipo]: !anterior[tipo],
                  }))
                }
                aria-pressed={capas[tipo]}
              >
                <i
                  className={`bi ${
                    capas[tipo] ? "bi-check-square-fill" : "bi-square"
                  }`}
                />

                {nombre}
              </button>
            ))}
          </div>

          {Object.entries(ETIQUETAS).map(([tipo, nombre]) => {
            const opciones = [
              ...new Set(
                puntos

                  .filter((punto) => punto.tipo === tipo)

                  .map((punto) => punto.estado),
              ),
            ].sort();

            return (
              <label key={tipo} className="mapa-central-filtro">
                <span>Estado de {nombre.toLowerCase()}</span>

                <select
                  value={estados[tipo]}
                  onChange={(evento) =>
                    setEstados((anterior) => ({
                      ...anterior,

                      [tipo]: evento.target.value,
                    }))
                  }
                >
                  <option value="TODOS">Todos</option>

                  {opciones.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
        </div>

        <div className="mapa-central-listas">
          {Object.keys(ETIQUETAS).map((tipo) => (
            <GrupoLista
              key={tipo}
              tipo={tipo}
              puntos={visibles.filter((punto) => punto.tipo === tipo)}
              abierto={abierto[tipo]}
              onAlternar={() =>
                setAbierto((anterior) => ({
                  ...anterior,

                  [tipo]: !anterior[tipo],
                }))
              }
              seleccionado={seleccionVisible}
              onSeleccionar={setSeleccionado}
            />
          ))}
        </div>

        {seleccionVisible && (
          <div className="mapa-central-detalle">
            <button
              type="button"
              className="mapa-central-cerrar"
              onClick={() => setSeleccionado(null)}
              aria-label="Cerrar detalles"
            >
              <i className="bi bi-x-lg" />
            </button>

            <strong>{seleccionVisible.nombre}</strong>

            <span>{ETIQUETAS[seleccionVisible.tipo]}</span>

            <p>
              <b>Estado:</b> {seleccionVisible.estado}
              <br />
              <b>Barrio:</b> {seleccionVisible.barrio}
              {seleccionVisible.prioridad && (
                <>
                  <br />
                  <b>Prioridad:</b> {seleccionVisible.prioridad}
                </>
              )}
              {seleccionVisible.tipo === "alarmas" && (
                <>
                  <br />
                  <b>Radio:</b> {seleccionVisible.radio} m
                </>
              )}
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
