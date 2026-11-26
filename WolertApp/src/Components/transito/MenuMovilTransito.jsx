import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import "../../css/transito/responsive-gestion-transito.css";

export default function MenuMovilTransito() {
    const [abierto, setAbierto] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setAbierto(false);
    }, [location.pathname]);

    useEffect(() => {
        const cerrar = (evento) => {
            if (evento.key === "Escape") {
                setAbierto(false);
            }
        };

        const seleccionar = (evento) => {
            if (evento.target.closest("#sidebarDash a")) {
                setAbierto(false);
            }
        };

        const media = window.matchMedia("(max-width: 768px)");

        const cambiarPantalla = () => {
            if (!media.matches) {
                setAbierto(false);
            }
        };

        document.addEventListener("keydown", cerrar);
        document.addEventListener("click", seleccionar);
        media.addEventListener("change", cambiarPantalla);

        return () => {
            document.removeEventListener("keydown", cerrar);
            document.removeEventListener("click", seleccionar);
            media.removeEventListener("change", cambiarPantalla);
        };
    }, []);

    return (
        <div className="menu-movil-transito">

            <button
                type="button"
                className="btn-menu-movil-transito"
                aria-label="Abrir menu"
                aria-expanded={abierto}
                aria-controls="sidebarDash"
                onClick={() => setAbierto(true)}
            >
                <i className="bi bi-list"></i>
            </button>

            {createPortal(
                <div className={
                    `transito-menu-capas ${abierto ? "abierto" : ""}`
                }>
                    <button
                        type="button"
                        className="transito-menu-fondo"
                        aria-label="Cerrar menu lateral"
                        tabIndex={abierto ? 0 : -1}
                        onClick={() => setAbierto(false)}
                    />

                    <button
                        type="button"
                        className="transito-menu-cerrar"
                        aria-label="Cerrar menu"
                        tabIndex={abierto ? 0 : -1}
                        onClick={() => setAbierto(false)}
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>,
                document.body
            )}
        </div>
    );
}
