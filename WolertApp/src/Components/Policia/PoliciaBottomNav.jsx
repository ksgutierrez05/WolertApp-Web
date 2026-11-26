import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../../css/Policia/policia-responsive.css";

const PRINCIPALES = {
    patrullero: ["centro", "alertas", "asignaciones", "unidad"],
    central: ["centro", "mapa", "alertas", "atencion-alertas"],
    administrador: ["centrooperaciones", "alertas", "unidades", "estadisticas"]
};

const ETIQUETAS = {
    centro: "Inicio",
    centrooperaciones: "Inicio",
    alertas: "Alertas",
    asignaciones: "Asignadas",
    unidad: "Unidad",
    unidades: "Unidades",
    mapa: "Mapa",
    "atencion-alertas": "Atencion",
    estadisticas: "Datos"
};

export default function PoliciaBottomNav({
    rol,
    menu,
    cerrarSesion
}) {
    const { pathname } = useLocation();
    const [abierto, setAbierto] = useState(false);

    const items = menu.flatMap(seccion => seccion.items);

    const principales = PRINCIPALES[rol]
        .map(id => items.find(item => item.id === id))
        .filter(Boolean);

    const secundarios = items.filter(
        item => !PRINCIPALES[rol].includes(item.id)
    );

    const masActivo = secundarios.some(
        item => item.to.toLowerCase() === pathname.toLowerCase()
    );

    useEffect(() => {
        function cerrar(evento) {
            if (evento.key === "Escape") setAbierto(false);
        }

        document.addEventListener("keydown", cerrar);

        return () => {
            document.removeEventListener("keydown", cerrar);
        };
    }, []);

    return (
        <div className="policia-mobile-navigation">

            {abierto && (
                <>
                    <button
                        type="button"
                        className="policia-mobile-overlay"
                        aria-label="Cerrar menu"
                        onClick={() => setAbierto(false)}
                    />

                    <section className="policia-mobile-sheet">
                        <div className="policia-mobile-handle" />

                        <header>
                            <div>
                                <strong>WolertApp</strong>
                                <small>Menu de operaciones</small>
                            </div>

                            <button
                                type="button"
                                aria-label="Cerrar menu"
                                onClick={() => setAbierto(false)}
                            >
                                <i className="bi bi-x-lg" />
                            </button>
                        </header>

                        <div className="policia-mobile-grid">
                            {secundarios.map(item => (
                                <NavLink
                                    key={item.id}
                                    to={item.to}
                                    end
                                    onClick={() => setAbierto(false)}
                                >
                                    <i className={`bi ${item.icon}`} />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="policia-mobile-logout"
                            onClick={evento => {
                                setAbierto(false);
                                cerrarSesion(evento);
                            }}
                        >
                            <i className="bi bi-box-arrow-right" />
                            Cerrar sesi&oacute;n
                        </button>
                    </section>
                </>
            )}

            <nav
                className="policia-bottom-nav"
                aria-label="Navegacion de Policia"
            >
                {principales.map(item => (
                    <NavLink
                        key={item.id}
                        to={item.to}
                        end
                        onClick={() => setAbierto(false)}
                        className={({ isActive }) =>
                            `policia-bottom-item${isActive ? " active" : ""}`
                        }
                    >
                        <i className={`bi ${item.icon}`} />
                        <span>{ETIQUETAS[item.id] || item.label}</span>
                    </NavLink>
                ))}

                <button
                    type="button"
                    aria-expanded={abierto}
                    className={`policia-bottom-item${abierto || masActivo ? " active" : ""}`}
                    onClick={() => setAbierto(valor => !valor)}
                >
                    <i className="bi bi-grid" />
                    <span>M&aacute;s</span>
                </button>
            </nav>
        </div>
    );
}