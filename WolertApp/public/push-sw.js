self.addEventListener("push", (event) => {
    const datos = event.data ? event.data.json() : {};

    event.waitUntil(
        self.registration.showNotification(
            datos.title || "WolertApp",
            {
                body: datos.body || "Nueva alerta comunitaria",
                icon: "/img/alarma.png",
                vibrate: [200, 100, 200]
            }
        )
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow("/"));
});