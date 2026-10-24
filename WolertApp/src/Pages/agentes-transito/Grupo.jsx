import { useState } from "react";
import Layout from "../../Components/transito/Layout";

const PASOS = [
  { id: "recibido", label: "Recibido", icono: "bi-check-circle-fill" },
  { id: "camino", label: "En camino", icono: "bi-check-circle-fill" },
  { id: "sitio", label: "En el sitio", icono: "bi-geo-alt-fill" },
  { id: "atendido", label: "Atendido", icono: "bi-flag-fill" },
];

const MIEMBROS = [
  {
    ini: "JR",
    nombre: "Jorge Ramírez (tú)",
    estado: "En atención",
    badge: "estado-atencion-dash",
    avatar: "avatar-amber-dash",
  },
  {
    ini: "CV",
    nombre: "Camilo Vega",
    estado: "En atención",
    badge: "estado-atencion-dash",
    avatar: "avatar-amber-dash",
  },
  {
    ini: "SM",
    nombre: "Sara Molina",
    estado: "Disponible",
    badge: "estado-resuelta-dash",
    avatar: "avatar-green-dash",
  },
];

export default function Grupo() {
  // paso actual del caso (0 = Recibido ... 3 = Atendido)
  const [paso, setPaso] = useState(2);

  return (
    <Layout
      rol="agente"
      titulo="Mi grupo"
      activo="grupo"
      busqueda={{ placeholder: "Buscar..." }}
    >
      <div className="hero-page-dash hero-page-img-dash mb-4">
        <div className="eyebrow-page-img-dash">
          <i className="bi bi-people-fill"></i>
          <span>GRUPO 1 · ZONA NORTE</span>
        </div>
        <h1 className="hero-page-title-dash">
          Buenos días,
          <br />
          Grupo 1
        </h1>
        <p className="hero-page-text-dash mb-0">
          Tienen 1 caso asignado en este momento.
        </p>

        <div className="chips-page-img-dash">
          <span className="chip-page-img-dash">
            <span className="punto-vivo-dash"></span> En servicio
          </span>
          <span className="chip-page-img-dash">
            <i className="bi bi-person-check"></i> 3 integrantes
          </span>
        </div>
      </div>

      <div className="panel-card-dash mb-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <p className="caso-label-dash mb-2">Caso asignado a tu grupo</p>
            <span className="badge-tipo-dash tipo-accidente-dash mb-2 d-inline-block">
              Accidente
            </span>
            <h2 className="caso-titulo-dash">Casimiro Raúl Maestre</h2>
            <p className="config-text-dash mb-0">
              Reportado por Katherine Gutiérrez · 07:47 a.m. · Asignado a las
              07:50 a.m.
            </p>
          </div>
        </div>

        
<div className="progreso-caso-dash">
  <div className="progreso-linea-dash">
    {PASOS.map((p, i) => (
      <button
        key={p.id}
        type="button"
        className={`progreso-paso-dash ${
          i < paso
            ? "paso-completado-dash"
            : i === paso
            ? "paso-actual-dash"
            : "paso-pendiente-dash"
        }`}
        onClick={() => setPaso(i)}
        aria-current={i === paso ? "step" : undefined}
      >
        <span className="progreso-circulo-dash">
          <i
            className={`bi ${
              i < paso
                ? "bi-check-lg"
                : p.icono
            }`}
          />
        </span>

        <span className="progreso-label-dash">
          {p.label}
        </span>
      </button>
    ))}
  </div>

  <div className="progreso-accion-dash">
    <span className="progreso-ayuda-dash">
      {paso === 3
        ? "El caso ha llegado a su última etapa."
        : `Siguiente etapa: ${PASOS[paso + 1].label}`}
    </span>

    <button
      type="button"
      className="btn-progreso-dash"
      onClick={() => setPaso((actual) => Math.min(actual + 1, 3))}
      disabled={paso === 3}
    >
      {paso === 3 ? "Caso finalizado" : "Avanzar estado"}
      {paso !== 3 && (
        <i className="bi bi-arrow-right" />
      )}
    </button>
  </div>
</div>
</div>



      <div className="panel-card-dash">
        <h2 className="panel-title-dash">Mi grupo</h2>
        {MIEMBROS.map((m) => (
          <div key={m.ini} className="miembro-row-dash">
            <div className="d-flex align-items-center gap-2">
              <span className={`avatar-icon-dash ${m.avatar}`}>{m.ini}</span>
              <div className="fw-semibold">{m.nombre}</div>
            </div>
            <span className={`badge-estado-dash ${m.badge}`}>{m.estado}</span>
          </div>
        ))}
      </div>
    </Layout>
  );
}
