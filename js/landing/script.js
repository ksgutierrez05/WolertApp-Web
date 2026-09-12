const pasos = document.querySelectorAll(".paso");

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
        }
    });
});

pasos.forEach((paso) => observer.observe(paso));

console.log("Script cargado correctamente");