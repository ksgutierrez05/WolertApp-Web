import { useEffect, useRef, useState } from "react";
import "../../css/Policia/administrador-policia/css/select-bonito.css";

/**
 * Desplegable personalizado reutilizable (mismo estilo que Tipos de Alertas).
 *
 * Props:
 *  - id, ariaLabel
 *  - valor: valor seleccionado ("" = ninguno / "todos")
 *  - onChange(valor)
 *  - opciones: [{ valor, etiqueta, cantidad?, punto? }]
 *      punto: "rojo" | "ambar" | "verde" | "azul" | "gris"  (opcional)
 *  - placeholder: texto cuando no hay valor
 *  - icono: clase bootstrap-icons (ej. "bi-funnel")
 *  - limpiable: muestra la X cuando hay valor
 *  - variante: "filtro" (por defecto, alto 44) | "campo" (para formularios)
 *  - deshabilitado
 */
export default function SelectBonito({
  id,
  ariaLabel,
  valor,
  onChange,
  opciones,
  placeholder = "Seleccionar",
  icono = "bi-funnel",
  limpiable = false,
  variante = "filtro",
  deshabilitado = false,
}) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!abierto) return;

    const fuera = (e) => {
      if (!ref.current?.contains(e.target)) setAbierto(false);
    };
    const escape = (e) => {
      if (e.key === "Escape") setAbierto(false);
    };

    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto]);

  const actual = opciones.find((o) => String(o.valor) === String(valor));
  const tieneValor = valor !== "" && valor != null && Boolean(actual);

  return (
    <div
      ref={ref}
      className={`sb ${variante === "campo" ? "sb-campo" : ""} ${
        tieneValor ? "activo" : ""
      } ${abierto ? "abierto" : ""} ${deshabilitado ? "deshabilitado" : ""}`}
    >
      <button
        id={id}
        type="button"
        className="sb-boton"
        disabled={deshabilitado}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-label={ariaLabel || placeholder}
        onClick={() => setAbierto((v) => !v)}
      >
        {icono && <i className={`bi ${icono} sb-icono`} aria-hidden="true" />}

        {tieneValor && actual?.punto && (
          <span className={`sb-punto sb-p-${actual.punto}`} aria-hidden="true" />
        )}

        <span className={`sb-texto ${tieneValor ? "" : "sin-valor"}`}>
          {tieneValor ? actual.etiqueta : placeholder}
        </span>

        <i className="bi bi-chevron-down sb-flecha" aria-hidden="true" />
      </button>

      {limpiable && tieneValor && !deshabilitado && (
        <button
          type="button"
          className="sb-limpiar"
          aria-label="Quitar filtro"
          title="Quitar filtro"
          onClick={() => {
            onChange("");
            setAbierto(false);
          }}
        >
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>
      )}

      {abierto && (
        <ul className="sb-menu" role="listbox">
          {opciones.map((op) => {
            const seleccionada = String(op.valor) === String(valor);
            return (
              <li key={String(op.valor) || "vacio"} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={seleccionada}
                  className={`sb-opcion ${seleccionada ? "seleccionada" : ""}`}
                  onClick={() => {
                    onChange(op.valor);
                    setAbierto(false);
                  }}
                >
                  <span
                    className={`sb-punto ${
                      op.punto ? `sb-p-${op.punto}` : "sb-p-gris"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="sb-opcion-texto">{op.etiqueta}</span>
                  {op.cantidad != null && (
                    <span className="sb-opcion-cantidad">{op.cantidad}</span>
                  )}
                  <i
                    className={`bi bi-check-lg sb-check ${
                      seleccionada ? "visible" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}