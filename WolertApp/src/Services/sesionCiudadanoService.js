import { desactivarNotificacionesPush } from "./webPushService";

let cerrando = false;

export async function cerrarSesionCiudadano() {
    if (cerrando) return;

    cerrando = true;

    try {
        const id = localStorage.getItem("idSuscripcionPush");

        if (id) {
            await desactivarNotificacionesPush();
        }
    } catch (error) {
        console.warn("No se pudo desactivar Push en el servidor:", error.message);
    } finally {
        try {
            if ("serviceWorker" in navigator) {
                const registro = await navigator.serviceWorker.getRegistration();
                const suscripcion = await registro?.pushManager.getSubscription();

                if (suscripcion) {
                    await suscripcion.unsubscribe();
                }
            }
        } catch (error) {
            console.warn("Error al desvincular dispositivo:", error.message);
        }

        const claves = [
            "token",
            "idUsuario",
            "rol",
            "role",
            "username",
            "usuario",
            "idSuscripcionPush",
            "wolertapp_sesion_activa"
        ];

        claves.forEach(clave => {
            localStorage.removeItem(clave);
            sessionStorage.removeItem(clave);
        });

        document.body.classList.remove("modo-compacto");

        window.location.replace("/login");
    }
}