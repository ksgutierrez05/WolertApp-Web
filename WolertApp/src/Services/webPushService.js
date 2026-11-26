const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function obtenerHeaders() {
    const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

    if (!token) {
        throw new Error("No hay una sesion activa.");
    }

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
    };
}

function convertirClave(clave) {
    const base64 = clave
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    return Uint8Array.from(
        atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")),
        c => c.charCodeAt(0)
    );
}

function obtenerUbicacion() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            posicion => resolve({
                latitud: posicion.coords.latitude,
                longitud: posicion.coords.longitude
            }),
            () => reject(new Error("Debes permitir el acceso a tu ubicacion.")),
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    });
}

export async function activarNotificacionesPush(radioMetros = 500) {
    if (!("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window) ||
        !("geolocation" in navigator)) {
        throw new Error("Tu navegador no admite esta funcionalidad.");
    }

    const headers = obtenerHeaders();

    const permiso = await Notification.requestPermission();

    if (permiso !== "granted") {
        throw new Error("Debes permitir las notificaciones.");
    }

    const ubicacion = await obtenerUbicacion();

    const respuestaClave = await fetch(
        `${API_URL}/api/WebPush/clave-publica`
    );

    if (!respuestaClave.ok) {
        throw new Error("No se pudo obtener la clave publica.");
    }

    const { publicKey } = await respuestaClave.json();

    await navigator.serviceWorker.register("/push-sw.js");

    const registro = await navigator.serviceWorker.ready;

    let suscripcion = await registro.pushManager.getSubscription();

    if (!suscripcion) {
        suscripcion = await registro.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertirClave(publicKey)
        });
    }

    const datos = suscripcion.toJSON();

    const respuesta = await fetch(
        `${API_URL}/api/SuscripcionesPush/registrar`,
        {
            method: "POST",
            headers,
            body: JSON.stringify({
                endpoint: datos.endpoint,
                p256dh: datos.keys.p256dh,
                auth: datos.keys.auth,
                latitud: ubicacion.latitud,
                longitud: ubicacion.longitud,
                radioMetros
            })
        }
    );

    if (!respuesta.ok) {
        throw new Error(await respuesta.text() ||
            "No se pudo registrar el dispositivo.");
    }

    const resultado = await respuesta.json();

    localStorage.setItem(
        "idSuscripcionPush",
        String(resultado.idSuscripcion)
    );

    return resultado;
}

export async function desactivarNotificacionesPush() {
    const id = localStorage.getItem("idSuscripcionPush");

    if (!id) {
        throw new Error("No se encontro la suscripcion del dispositivo.");
    }

    const respuesta = await fetch(
        `${API_URL}/api/SuscripcionesPush/${id}`,
        {
            method: "DELETE",
            headers: obtenerHeaders()
        }
    );

    if (!respuesta.ok) {
        throw new Error("No se pudo desactivar la suscripcion.");
    }

    const registro = await navigator.serviceWorker.getRegistration();

    if (registro) {
        const suscripcion = await registro.pushManager.getSubscription();

        if (suscripcion) {
            await suscripcion.unsubscribe();
        }
    }

    localStorage.removeItem("idSuscripcionPush");

    return true;
}

export async function obtenerSuscripcionesPush() {
    const respuesta = await fetch(
        `${API_URL}/api/SuscripcionesPush/mis-suscripciones`,
        {
            headers: obtenerHeaders()
        }
    );

    if (!respuesta.ok) {
        throw new Error("No se pudieron consultar las suscripciones.");
    }

    return await respuesta.json();
}

export async function actualizarUbicacionPush() {
    if (!("serviceWorker" in navigator) ||
        !("Notification" in window) ||
        !("geolocation" in navigator)) {
        return false;
    }

    if (Notification.permission !== "granted") {
        return false;
    }

    const id = localStorage.getItem("idSuscripcionPush");

    if (!id) return false;

    const datos = await obtenerSuscripcionesPush();

    const activa = datos.find(s =>
        String(s.idSuscripcionPush) === id &&
        s.estado === "ACTIVA"
    );

    if (!activa) return false;

    const registro = await navigator.serviceWorker.getRegistration();

    if (!registro) return false;

    const suscripcion = await registro.pushManager.getSubscription();

    if (!suscripcion) return false;

    const permiso = await navigator.permissions.query({
        name: "geolocation"
    });

    if (permiso.state !== "granted") return false;

    const headers = obtenerHeaders();
    const ubicacion = await obtenerUbicacion();
    const push = suscripcion.toJSON();

    if (localStorage.getItem("idSuscripcionPush") !== id ||
        obtenerHeaders().Authorization !== headers.Authorization) {
        return false;
    }

    const respuesta = await fetch(
        `${API_URL}/api/SuscripcionesPush/registrar`,
        {
            method: "POST",
            headers,
            body: JSON.stringify({
                endpoint: push.endpoint,
                p256dh: push.keys.p256dh,
                auth: push.keys.auth,
                latitud: ubicacion.latitud,
                longitud: ubicacion.longitud,
                radioMetros: activa.radioMetros
            })
        }
    );

    if (!respuesta.ok) {
        throw new Error("No se pudo actualizar la ubicacion.");
    }

    console.info("WolertApp: ubicacion Push actualizada.");

    return true;
}