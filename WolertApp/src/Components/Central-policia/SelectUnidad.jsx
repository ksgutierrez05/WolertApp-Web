import { useEffect, useMemo, useRef, useState } from "react";

const UMBRAL_BUSQUEDA = 8;

export default function SelectUnidad({
  id,
  valor,
  opciones,
  onChange,
  deshabilitado = false,
}) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [activo, setActivo] = useState(0);
  const ref = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const buscar = opciones.length > UMBRAL_BUSQUEDA;
  const actual = opciones.find((opcion) => String(opcion.valor) === String(valor));
  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es");
    return opciones.filter((opcion) => opcion.etiqueta.toLocaleLowerCase("es").includes(termino));
  }, [opciones, busqueda]);

  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (evento) => {
      if (!ref.current?.contains(evento.target)) setAbierto(false);
    };
    const escape = (evento) => {
      if (evento.key === "Escape") {
        setAbierto(false);
        setBusqueda("");
      }
    };
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto]);

  useEffect(() => {
    if (abierto && buscar) searchRef.current?.focus();
  }, [abierto, buscar]);

  function abrir() {
    if (deshabilitado || !opciones.length) return;
    const seleccion = filtradas.findIndex((opcion) => String(opcion.valor) === String(valor));
    setActivo(Math.max(0, seleccion));
    setAbierto(true);
  }

  function seleccionar(opcion) {
    onChange(opcion.valor);
    setAbierto(false);
    setBusqueda("");
    triggerRef.current?.focus();
  }

  function manejarTeclado(evento) {
    if (!abierto) {
      if (["Enter", " ", "ArrowDown"].includes(evento.key)) {
        evento.preventDefault();
        abrir();
      }
      return;
    }
    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      setActivo((indice) => Math.min(indice + 1, filtradas.length - 1));
    } else if (evento.key === "ArrowUp") {
      evento.preventDefault();
      setActivo((indice) => Math.max(indice - 1, 0));
    } else if (evento.key === "Enter" && filtradas[activo]) {
      evento.preventDefault();
      seleccionar(filtradas[activo]);
    } else if (evento.key === "Tab") {
      setAbierto(false);
      setBusqueda("");
    }
  }

  return (
    <div ref={ref} className={`asig-unit-select ${abierto ? "is-open" : ""}`}>
      {opciones.length ? (
        <>
          <button
            ref={triggerRef}
            id={id}
            type="button"
            className="asig-unit-trigger"
            aria-label="Seleccionar unidad policial"
            aria-haspopup="listbox"
            aria-expanded={abierto}
            aria-controls={`${id}-opciones`}
            disabled={deshabilitado}
            onClick={() => abierto ? setAbierto(false) : abrir()}
            onKeyDown={manejarTeclado}
          >
            <i className="bi bi-truck asig-unit-vehicle" aria-hidden="true" />
            <span className={!actual ? "is-placeholder" : ""}>
              {actual?.etiqueta || "Selecciona una unidad"}
            </span>
            <i className="bi bi-chevron-down asig-unit-chevron" aria-hidden="true" />
          </button>
          {abierto && (
            <div className="asig-unit-menu" id={`${id}-opciones`} role="listbox" aria-label="Unidades disponibles">
              {buscar && (
                <div className="asig-unit-search">
                  <i className="bi bi-search" aria-hidden="true" />
                  <input
                    ref={searchRef}
                    type="search"
                    value={busqueda}
                    placeholder="Buscar unidad..."
                    aria-label="Buscar unidad disponible"
                    onChange={(evento) => { setBusqueda(evento.target.value); setActivo(0); }}
                    onKeyDown={manejarTeclado}
                  />
                </div>
              )}
              {filtradas.length ? filtradas.map((opcion, indice) => {
                const seleccionada = String(opcion.valor) === String(valor);
                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={seleccionada}
                    className={`asig-unit-option ${seleccionada ? "is-selected" : ""} ${activo === indice ? "is-active" : ""}`}
                    key={String(opcion.valor)}
                    onKeyDown={(evento) => {
                      if (evento.key === "Tab") setAbierto(false);
                    }}
                    onMouseEnter={() => setActivo(indice)}
                    onClick={() => seleccionar(opcion)}
                  >
                    <i className="bi bi-truck" aria-hidden="true" />
                    <span>{opcion.etiqueta}</span>
                    <i className={`bi bi-check-lg asig-unit-check ${seleccionada ? "is-visible" : ""}`} aria-hidden="true" />
                  </button>
                );
              }) : (
                <p className="asig-unit-no-results">No hay unidades que coincidan.</p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="asig-unit-empty" aria-live="polite">
          <i className="bi bi-truck" aria-hidden="true" />
          <span>No hay unidades disponibles</span>
        </div>
      )}
    </div>
  );
}
