const pasos = document.querySelectorAll(".paso");

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
        }
    });
});

pasos.forEach((paso) => observer.observe(paso));

const authContainer = document.getElementById("auth-container");
const btnToggle = document.getElementById("btn-toggle");

console.log("btnToggle es:", btnToggle);

btnToggle.addEventListener("click", () => {
    authContainer.classList.toggle("active");

    // Cambia el texto del botón según el estado actual
    if (authContainer.classList.contains("active")) {
        btnToggle.textContent = "Iniciar sesión";
    } else {
        btnToggle.textContent = "Registrarse";
    }
});

console.log("Script cargado correctamente");