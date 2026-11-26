
import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  MapContainer,
  TileLayer,
  LayersControl,
  Marker,
  Circle,
  Popup,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";
import { useFeedback } from "../Feedback/useFeedback";
import "leaflet/dist/leaflet.css";

import {
  crearAlarma,
  modificarAlarma,
  listarBarriosAlarmas,
} from "../../Services/AlarmasAdminService";

import sirena from "../../../public/img/alarma.png";

// IMAGEN PERSONALIZADA PARA DATOS DEL SISTEMA
// Coloca aquí tu imagen y conserva este nombre.
import iconoDatos from "../../../public/img/campana .png";

import "../../css/Policia/administrador-policia/css/registrar-alarma-mapa.css";

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const CENTRO = [10.4795, -73.2536];

const ESTILOS = [
  ["Calles", "streets-v12"],
  ["Claro", "light-v11"],
  ["Oscuro", "dark-v11"],
  ["Satélite", "satellite-streets-v12"],
];

const dato = (obj, ...claves) =>
  claves
    .map((clave) => obj?.[clave])
    .find((valor) => valor != null);

const idDe = (a) =>
  dato(a, "idAlarma", "IdAlarma", "ID_ALARMA");

const idBarrioDe = (b) =>
  dato(b, "idBarrio", "IdBarrio", "ID_BARRIO");

const idComunaDe = (b) =>
  dato(
    b,
    "comunaId",
    "ComunaId",
    "idComuna",
    "ID_COMUNA"
  );

const nombreBarrioDe = (b) =>
  String(
    dato(b, "nombre", "Nombre", "NOMBRE") ?? ""
  );

const iconoSirena = L.icon({
  iconUrl: sirena,
  iconSize: [42, 42],
  iconAnchor: [21, 40],
  popupAnchor: [0, -36],
});

const iconoSeleccionado = L.icon({
  iconUrl: sirena,
  iconSize: [54, 54],
  iconAnchor: [27, 51],
  popupAnchor: [0, -45],
});

function colorEstado(estado) {
  const valor = String(
    estado ?? ""
  ).toUpperCase();

  if (valor === "ACTIVA") {
    return "#16a34a";
  }

  if (valor.includes("MANTENIMIENTO")) {
    return "#eab308";
  }

  return "#94a3b8";
}

function SelectorMapa({ seleccionar }) {
  useMapEvents({
    click(evento) {
      seleccionar({
        lat: evento.latlng.lat,
        lng: evento.latlng.lng,
      });
    },
  });

  return null;
}

export default function RegistrarAlarmaMapa({
  alarmas = [],
  alarmaEditar = null,
  onClose,
  onGuardada,
}) {
  const { confirm, toast } = useFeedback();
  const editando = Boolean(alarmaEditar);
  const idEditar = idDe(alarmaEditar);

  const buscadorRef = useRef(null);

  // ========================================
  // ESTADOS DEL FORMULARIO
  // ========================================

  const [nombre, setNombre] = useState(
    String(
      dato(
        alarmaEditar,
        "nombre",
        "Nombre",
        "NOMBRE"
      ) ?? ""
    )
  );

  const [barrios, setBarrios] = useState([]);

  const [comuna, setComuna] = useState("");

  const [barrio, setBarrio] = useState(
    String(
      dato(
        alarmaEditar,
        "idBarrio",
        "IdBarrio",
        "ID_BARRIO"
      ) ?? ""
    )
  );

  const estadoOriginal = String(
    dato(
      alarmaEditar,
      "estado",
      "Estado",
      "ESTADO"
    ) ?? "INACTIVA"
  ).toUpperCase();

  const [estado, setEstado] = useState(
    ["ACTIVA", "INACTIVA"].includes(
      estadoOriginal
    )
      ? estadoOriginal
      : "INACTIVA"
  );

  const [radio, setRadio] = useState(
    Number(
      dato(
        alarmaEditar,
        "radioCobertura",
        "RadioCobertura",
        "RADIO_COBERTURA"
      ) ?? 500
    )
  );

  const latInicial = dato(
    alarmaEditar,
    "latitud",
    "Latitud",
    "LATITUD"
  );

  const lngInicial = dato(
    alarmaEditar,
    "longitud",
    "Longitud",
    "LONGITUD"
  );

  const posicionInicial =
    latInicial != null &&
    lngInicial != null &&
    Number.isFinite(Number(latInicial)) &&
    Number.isFinite(Number(lngInicial)) &&
    Math.abs(Number(latInicial)) <= 90 &&
    Math.abs(Number(lngInicial)) <= 180
      ? {
          lat: Number(latInicial),
          lng: Number(lngInicial),
        }
      : null;

  const [posicion, setPosicion] = useState(
    posicionInicial
  );

  const [
    busquedaBarrio,
    setBusquedaBarrio,
  ] = useState("");

  const [
    mostrarBarrios,
    setMostrarBarrios,
  ] = useState(false);

  const [
    cargandoBarrios,
    setCargandoBarrios,
  ] = useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (error) toast.error(error, "Revisa los datos de la alarma");
  }, [error, toast]);

  // ========================================
  // CARGAR BARRIOS
  // ========================================

  useEffect(() => {
    let activo = true;

    async function cargarBarrios() {
      try {
        const lista =
          await listarBarriosAlarmas();

        if (!activo) return;

        setBarrios(lista);

        if (editando) {
          const actual = lista.find(
            (b) =>
              String(idBarrioDe(b)) ===
              String(barrio)
          );

          if (actual) {
            setComuna(
              String(
                idComunaDe(actual) ?? ""
              )
            );

            setBusquedaBarrio(
              nombreBarrioDe(actual)
            );
          }
        }
      } catch (e) {
        if (activo) {
          setError(
            e.message ||
              "No se pudieron cargar los barrios."
          );
        }
      } finally {
        if (activo) {
          setCargandoBarrios(false);
        }
      }
    }

    cargarBarrios();

    return () => {
      activo = false;
    };
  }, []);

  // ========================================
  // CERRAR BUSCADOR AL HACER CLIC FUERA
  // ========================================

  useEffect(() => {
    function cerrarBuscador(evento) {
      if (
        buscadorRef.current &&
        !buscadorRef.current.contains(
          evento.target
        )
      ) {
        setMostrarBarrios(false);
      }
    }

    document.addEventListener(
      "pointerdown",
      cerrarBuscador
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        cerrarBuscador
      );
    };
  }, []);

  // ========================================
  // COMUNAS
  // ========================================

  const comunas = useMemo(() => {
    const mapa = new Map();

    barrios.forEach((b) => {
      const id = idComunaDe(b);

      if (id == null) return;

      mapa.set(String(id), {
        id: String(id),

        nombre:
          dato(
            b,
            "comunaNombre",
            "ComunaNombre",
            "nombreComuna",
            "NOMBRE_COMUNA"
          ) ?? `Comuna ${id}`,
      });
    });

    return [...mapa.values()].sort(
      (a, b) =>
        String(a.nombre).localeCompare(
          String(b.nombre),
          "es"
        )
    );
  }, [barrios]);

  // ========================================
  // FILTRAR BARRIOS POR COMUNA
  // ========================================

  const barriosFiltrados = useMemo(
    () =>
      barrios.filter(
        (b) =>
          String(idComunaDe(b)) ===
          comuna
      ),
    [barrios, comuna]
  );

  const opcionesBarrio = useMemo(
    () =>
      barriosFiltrados.filter((b) =>
        nombreBarrioDe(b)
          .toLowerCase()
          .includes(
            busquedaBarrio
              .toLowerCase()
              .trim()
          )
      ),
    [
      barriosFiltrados,
      busquedaBarrio,
    ]
  );

  // ========================================
  // CAMBIAR COMUNA
  // ========================================

  function seleccionarComuna(valor) {
    setComuna(valor);
    setBarrio("");
    setBusquedaBarrio("");
    setMostrarBarrios(false);
  }

  // ========================================
  // LIMPIAR FORMULARIO
  // ========================================

  function limpiar() {
    setNombre("");
    setComuna("");
    setBarrio("");
    setBusquedaBarrio("");
    setMostrarBarrios(false);
    setRadio(500);
    setEstado("INACTIVA");
    setPosicion(null);
    setError("");
  }

  // ========================================
  // GUARDAR ALARMA
  // ========================================

  async function persistirAlarma(datos) {
    setGuardando(true);
    try {
      if (editando) {
        await modificarAlarma(
          idEditar,
          datos
        );
      } else {
        await crearAlarma(datos);
      }

      onGuardada?.();
    } catch (e) {
      setError(
        e.message ||
          "No se pudo guardar la alarma."
      );
    } finally {
      setGuardando(false);
    }
  }

  function guardar(evento) {
    evento.preventDefault();
    setMostrarBarrios(false);
    setError("");

    if (!nombre.trim()) {
      setError("Escribe el nombre de la alarma.");
      return;
    }
    if (!comuna || !barrio) {
      setError("Selecciona una comuna y un barrio.");
      return;
    }
    if (!posicion) {
      setError("Selecciona la ubicación en el mapa.");
      return;
    }
    if (editando && idEditar == null) {
      setError("No se encontró el identificador de la alarma.");
      return;
    }

    const datos = {
      nombre: nombre.trim(),
      idBarrio: Number(barrio),
      latitud: posicion.lat,
      longitud: posicion.lng,
      radioCobertura: Number(radio),
      estado,
    };

    if (editando && estado !== estadoOriginal) {
      const activando = estado === "ACTIVA";
      confirm({
        title: activando ? "¿Activar alarma?" : "¿Desactivar alarma?",
        description: `Confirma que deseas ${activando ? "activar" : "desactivar"} ${nombre.trim()}.`,
        confirmLabel: activando ? "Activar" : "Desactivar",
        tone: activando ? "confirm" : "warning",
        failureMessage: "No se pudo actualizar la alarma.",
        onConfirm: () => persistirAlarma(datos),
      });
      return;
    }

    persistirAlarma(datos);
  }

  // ========================================
  // INTERFAZ
  // ========================================

  return (
    <div
      className="registro-alarma-fondo"
      onMouseDown={(evento) => {
        if (
          evento.target ===
            evento.currentTarget &&
          !guardando
        ) {
          onClose?.();
        }
      }}
    >
      <section
        className="registro-alarma-modal"
        role="dialog"
        aria-modal="true"
        aria-label={
          editando
            ? "Modificar alarma"
            : "Registrar alarma"
        }
      >
        {/* ENCABEZADO PRINCIPAL */}

        <header className="registro-alarma-cabecera">
          <div className="registro-alarma-titulo">
            <div className="registro-alarma-titulo-icono">
              <img
                src={sirena}
                alt=""
              />
            </div>

            <div>
              <h2>
                {editando
                  ? "Modificar alarma"
                  : "Registrar alarma"}
              </h2>

              <p>
                Completa los datos y
                selecciona la ubicación en
                el mapa.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="registro-alarma-cerrar"
            onClick={() =>
              onClose?.()
            }
            disabled={guardando}
            aria-label="Cerrar"
          >
            <i className="bi bi-x-lg" />
          </button>
        </header>

        {/* CONTENIDO */}

        <div className="registro-alarma-contenido">
          {/* MAPA */}

          <div className="registro-alarma-mapa">
            {TOKEN ? (
              <MapContainer
                center={
                  posicion
                    ? [
                        posicion.lat,
                        posicion.lng,
                      ]
                    : CENTRO
                }
                zoom={
                  posicion ? 15 : 13
                }
                scrollWheelZoom
                style={{
                  width: "100%",
                  height: "100%",
                }}
              >
                <LayersControl position="topright">
                  {ESTILOS.map(
                    ([titulo, estilo], i) => (
                      <LayersControl.BaseLayer
                        key={estilo}
                        name={titulo}
                        checked={i === 0}
                      >
                        <TileLayer
                          url={`https://api.mapbox.com/styles/v1/mapbox/${estilo}/tiles/{z}/{x}/{y}?access_token=${TOKEN}`}
                          tileSize={512}
                          zoomOffset={-1}
                          maxZoom={19}
                          attribution="&copy; Mapbox &copy; OpenStreetMap contributors"
                        />
                      </LayersControl.BaseLayer>
                    )
                  )}
                </LayersControl>

                <SelectorMapa
                  seleccionar={
                    setPosicion
                  }
                />

                {/* ALARMAS REGISTRADAS */}

                {alarmas.map((a, i) => {
                  const id = idDe(a);

                  if (
                    editando &&
                    String(id) ===
                      String(idEditar)
                  ) {
                    return null;
                  }

                  const la = Number(
                    dato(
                      a,
                      "latitud",
                      "Latitud",
                      "LATITUD"
                    )
                  );

                  const lo = Number(
                    dato(
                      a,
                      "longitud",
                      "Longitud",
                      "LONGITUD"
                    )
                  );

                  const r = Number(
                    dato(
                      a,
                      "radioCobertura",
                      "RadioCobertura",
                      "RADIO_COBERTURA"
                    )
                  );

                  const est = String(
                    dato(
                      a,
                      "estado",
                      "Estado",
                      "ESTADO"
                    ) ?? ""
                  ).toUpperCase();

                  if (
                    !Number.isFinite(la) ||
                    !Number.isFinite(lo) ||
                    Math.abs(la) > 90 ||
                    Math.abs(lo) > 180
                  ) {
                    return null;
                  }

                  return (
                    <Fragment
                      key={id ?? i}
                    >
                      <Circle
                        center={[la, lo]}
                        radius={
                          r > 0 ? r : 1
                        }
                        pathOptions={{
                          color:
                            colorEstado(est),
                          fillColor:
                            colorEstado(est),
                          fillOpacity: 0.13,
                          weight: 2,
                        }}
                      />

                      <Marker
                        position={[
                          la,
                          lo,
                        ]}
                        icon={
                          iconoSirena
                        }
                      >
                        <Popup>
                          <strong>
                            {dato(
                              a,
                              "nombre",
                              "Nombre",
                              "NOMBRE"
                            )}
                          </strong>

                          <p>
                            Estado: {est}
                          </p>

                          <p>
                            Radio: {r} m
                          </p>
                        </Popup>
                      </Marker>
                    </Fragment>
                  );
                })}

                {/* UBICACIÓN SELECCIONADA */}

                {posicion && (
                  <>
                    <Circle
                      center={[
                        posicion.lat,
                        posicion.lng,
                      ]}
                      radius={radio}
                      pathOptions={{
                        color:
                          "#0b4a3f",
                        fillColor:
                          "#16a34a",
                        fillOpacity: 0.16,
                        dashArray:
                          "8 6",
                        weight: 3,
                      }}
                    />

                    <Marker
                      position={[
                        posicion.lat,
                        posicion.lng,
                      ]}
                      icon={
                        iconoSeleccionado
                      }
                    >
                      <Popup>
                        {editando
                          ? "Ubicación de la alarma"
                          : "Nueva alarma"}
                      </Popup>
                    </Marker>
                  </>
                )}
              </MapContainer>
            ) : (
              <div className="registro-alarma-sin-mapa">
                <i className="bi bi-exclamation-triangle" />

                <span>
                  No se encontró
                  VITE_MAPBOX_TOKEN.
                  Configúralo en el
                  archivo .env.
                </span>
              </div>
            )}

            {/* LEYENDA */}

            <div className="registro-alarma-leyenda">
              <span>
                <i className="leyenda-punto activa" />
                Activa
              </span>

              <span>
                <i className="leyenda-punto inactiva" />
                Inactiva
              </span>

              <span>
                <i className="leyenda-punto mantenimiento" />
                Mantenimiento
              </span>

              <span>
                <i className="leyenda-punto nueva" />
                Seleccionada
              </span>
            </div>
          </div>

          {/* FORMULARIO */}

          <form
            className="registro-alarma-form"
            onSubmit={guardar}
            onInvalid={(evento) => {
              evento.preventDefault();
              toast.warning(evento.target.validationMessage || "Completa los campos requeridos.", "Datos incompletos");
            }}
          >
            {/* DATOS DEL SISTEMA
                IMAGEN PERSONALIZADA */}

            <div className="registro-alarma-form-titulo">
              <div className="registro-alarma-form-icono">
                <img
                  src={iconoDatos}
                  alt=""
                  className="registro-alarma-imagen-personalizada"
                />
              </div>

              <div className="registro-alarma-form-info">
                <h3>
                  Datos del sistema
                </h3>

                <p>
                  Configuración de la
                  alarma
                </p>
              </div>
            </div>

            {/* NOMBRE */}

            <label>
              Nombre de la alarma

              <input
                required
                type="text"
                maxLength={30}
                value={nombre}
                placeholder="Ej. Alarma Sector Norte"
                onChange={(e) =>
                  setNombre(
                    e.target.value
                  )
                }
              />
            </label>

            {/* COMUNA */}

            <label>
              Comuna

              <select
                required
                value={comuna}
                disabled={
                  cargandoBarrios
                }
                onChange={(e) =>
                  seleccionarComuna(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Selecciona una comuna
                </option>

                {comunas.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                  >
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>

            {/* BARRIO */}

            <div className="registro-alarma-campo-barrio">
              <label htmlFor="buscar-barrio-alarma">
                Barrio
              </label>

              <div
                className="registro-alarma-barrio-contenedor"
                ref={buscadorRef}
              >
                <div className="registro-alarma-barrio-input">
                  <i className="bi bi-search" />

                  <input
                    id="buscar-barrio-alarma"
                    type="text"
                    value={
                      busquedaBarrio
                    }
                    disabled={
                      !comuna
                    }
                    placeholder={
                      comuna
                        ? "Buscar barrio..."
                        : "Selecciona una comuna"
                    }
                    autoComplete="off"
                    onFocus={() =>
                      setMostrarBarrios(
                        true
                      )
                    }
                    onChange={(e) => {
                      setBusquedaBarrio(
                        e.target.value
                      );

                      setBarrio("");

                      setMostrarBarrios(
                        true
                      );
                    }}
                  />

                  {busquedaBarrio && (
                    <button
                      type="button"
                      className="registro-alarma-barrio-limpiar"
                      aria-label="Limpiar barrio"
                      onClick={() => {
                        setBusquedaBarrio(
                          ""
                        );

                        setBarrio("");

                        setMostrarBarrios(
                          true
                        );
                      }}
                    >
                      <i className="bi bi-x" />
                    </button>
                  )}
                </div>

                {mostrarBarrios &&
                  comuna && (
                    <div className="registro-alarma-barrio-lista">
                      {opcionesBarrio.map(
                        (b) => (
                          <button
                            type="button"
                            key={
                              idBarrioDe(
                                b
                              )
                            }
                            className={`registro-alarma-barrio-opcion ${
                              String(
                                barrio
                              ) ===
                              String(
                                idBarrioDe(
                                  b
                                )
                              )
                                ? "seleccionado"
                                : ""
                            }`}
                            onClick={() => {
                              setBarrio(
                                String(
                                  idBarrioDe(
                                    b
                                  )
                                )
                              );

                              setBusquedaBarrio(
                                nombreBarrioDe(
                                  b
                                )
                              );

                              setMostrarBarrios(
                                false
                              );
                            }}
                          >
                            <i className="bi bi-geo-alt" />

                            <span>
                              {nombreBarrioDe(
                                b
                              )}
                            </span>
                          </button>
                        )
                      )}

                      {opcionesBarrio.length ===
                        0 && (
                        <div className="registro-alarma-barrio-vacio">
                          No se
                          encontraron
                          barrios.
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>

            {/* RADIO */}

            <label className="registro-alarma-radio-label">
              <span>
                Radio de cobertura (m)

                <strong>
                  {radio} m
                </strong>
              </span>

              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={radio}
                onChange={(e) =>
                  setRadio(
                    Number(
                      e.target.value
                    )
                  )
                }
              />

              <div className="registro-alarma-radio-limites">
                <span>50 m</span>
                <span>2000 m</span>
              </div>
            </label>

            {/* ESTADO */}

            <label>
              Estado

              <select
                value={estado}
                onChange={(e) =>
                  setEstado(
                    e.target.value
                  )
                }
              >
                <option value="INACTIVA">
                  Inactiva
                </option>

                <option value="ACTIVA">
                  Activa
                </option>
              </select>
            </label>

            {/* COORDENADAS */}

            <div className="registro-alarma-coordenadas">
              <i className="bi bi-geo-alt-fill" />

              <div>
                <strong>
                  Ubicación seleccionada
                </strong>

                <span>
                  {posicion
                    ? `${posicion.lat.toFixed(6)}, ${posicion.lng.toFixed(6)}`
                    : "Selecciona un punto en el mapa"}
                </span>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <p
                className="registro-alarma-error"
                role="alert"
              >
                <i className="bi bi-exclamation-triangle" />

                {error}
              </p>
            )}

            {/* BOTONES */}

            <div className="registro-alarma-botones">
              <button
                type="submit"
                className="alarma-btn alarma-btn-principal"
                disabled={
                  guardando ||
                  !posicion ||
                  !TOKEN
                }
              >
                <i className="bi bi-floppy" />

                {guardando
                  ? "Guardando..."
                  : editando
                    ? "Guardar cambios"
                    : "Guardar alarma"}
              </button>

              <button
                type="button"
                className="alarma-btn alarma-btn-secundario"
                disabled={guardando}
                onClick={
                  editando
                    ? () =>
                        onClose?.()
                    : limpiar
                }
              >
                <i
                  className={`bi ${
                    editando
                      ? "bi-x-circle"
                      : "bi-arrow-counterclockwise"
                  }`}
                />

                {editando
                  ? "Cancelar"
                  : "Limpiar"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
