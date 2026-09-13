//resaltar link activo del sidebar
    const linksMenu = document.querySelectorAll(".menu-dash a");

    linksMenu.forEach((link) => {
        link.addEventListener("click", () => {
            linksMenu.forEach((otroLink) => {
                otroLink.classList.remove("active");
            });
            link.classList.add("active");
        });
    });
//

//hora dinamica
    const fechaSpan = document.getElementById("fecha-actual");
    const horaSpan = document.getElementById("hora-actual");

    function actualizarFechaHora() {
        const ahora = new Date();

        const opcionesFecha = { day: 'numeric', month: 'long', year: 'numeric' };
        const fechaTexto = ahora.toLocaleDateString('es-ES', opcionesFecha);

        const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const horaTexto = ahora.toLocaleTimeString('es-ES', opcionesHora);

        fechaSpan.textContent = fechaTexto;
        horaSpan.textContent = horaTexto;
    }

    //funciona para reptetir acciones en itervalos de tiempo en milisegundos
    actualizarFechaHora(actualizarFechaHora,1000);
//
