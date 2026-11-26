export async function prepararPushAlIniciarSesion(usuario) {
    const idNuevo = String(usuario.idUsuario);
    const rol = String(usuario.rol).toUpperCase();

    let guardado = null;

    try {
        guardado = JSON.parse(
            localStorage.getItem("wolertPushPersistente") || "null"
        );
    } catch {
        localStorage.removeItem("wolertPushPersistente");
    }

    const idAnterior = localStorage.getItem("idUsuario");
    const idPushAnterior = localStorage.getItem("idSuscripcionPush");

    if (!guardado && idAnterior && idPushAnterior) {
        guardado = {
            idUsuario: idAnterior,
            idSuscripcion: idPushAnterior
        };
    }

    if (!("serviceWorker" in navigator)) {
        localStorage.removeItem("idSuscripcionPush");
        localStorage.removeItem("wolertPushPersistente");
        return;
    }

    const registro = await navigator.serviceWorker.getRegistration();
    const suscripcion = await registro?.pushManager.getSubscription();

    if (
        guardado &&
        suscripcion &&
        String(guardado.idUsuario) === idNuevo &&
        rol === "CIUDADANO"
    ) {
        localStorage.setItem(
            "idSuscripcionPush",
            String(guardado.idSuscripcion)
        );

        localStorage.removeItem("wolertPushPersistente");
        return;
    }

    if (suscripcion) {
        const eliminada = await suscripcion.unsubscribe();

        if (!eliminada && await registro.pushManager.getSubscription()) {
            throw new Error(
                "No se pudo desvincular el dispositivo anterior. Intenta nuevamente."
            );
        }
    }

    localStorage.removeItem("idSuscripcionPush");
    localStorage.removeItem("wolertPushPersistente");
}