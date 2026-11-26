import { desactivarNotificacionesPush } from "./webPushService";
import { obtenerPreferenciasCiudadano } from "./PreferenciasCiudadano";

let cerrando = false;

export async function cerrarSesionCiudadano() {
    if (cerrando) return;
    cerrando = true;

    const preferencias = obtenerPreferenciasCiudadano();
    const idUsuario = localStorage.getItem("idUsuario");
    const idPush = localStorage.getItem("idSuscripcionPush");

    let mantener = false;

    try {
        if (preferencias.mantenerPushAlCerrarSesion && idUsuario && idPush) {
            const registro = await navigator.serviceWorker?.getRegistration();
            const suscripcion = await registro?.pushManager.getSubscription();

            mantener = Boolean(suscripcion);

            if (mantener) {
                localStorage.setItem("wolertPushPersistente", JSON.stringify({
                    idUsuario,
                    idSuscripcion: idPush
                }));
            }
        }

        if (!mantener && idPush) {
            await desactivarNotificacionesPush();
        }
    } catch (error) {
        console.warn("WolertApp Push:", error.message);
    } finally {
        if (!mantener) {
            try {
                const registro = await navigator.serviceWorker?.getRegistration();
                const suscripcion = await registro?.pushManager.getSubscription();

                if (suscripcion) {
                    await suscripcion.unsubscribe();
                }
            } catch (error) {
                console.warn("Error al desvincular Push:", error.message);
            }

            localStorage.removeItem("wolertPushPersistente");
        }

        const claves = [
            "token", "idUsuario", "rol", "role",
            "username", "usuario", "nombre", "correo",
            "idSuscripcionPush", "wolertapp_sesion_activa"
        ];

        claves.forEach(clave => {
            localStorage.removeItem(clave);
            sessionStorage.removeItem(clave);
        });

        document.body.classList.remove("modo-compacto");
        window.location.replace("/login");
    }
}