self.addEventListener("push", (event) => {
    const datos = event.data ? event.data.json() : {};

    event.waitUntil(
        self.registration.showNotification(
            "WolertApp | Alerta cercana",
            {
                body: datos.body || "Se ha reportado una emergencia cerca de tu ubicaci\u00f3n.",
                icon: "/img/logo.png",
                vibrate: [200, 100, 200],
                timestamp: Date.now(),
                tag: "wolert-" + Date.now(),
                lang: "es-CO",
                data: {
                    url: "/ciudadano"
                },
                actions: [
                    {
                        action: "consultar",
                        title: "Consultar alerta"
                    }
                ]
            }
        )
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow("/ciudadano"));
});
