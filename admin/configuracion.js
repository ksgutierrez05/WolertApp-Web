document.addEventListener("DOMContentLoaded", () => {

    const CLAVE_CONFIG = "wolertapp_config_admin";

    const configPorDefecto = {
        nombre: "ADMIN SISTEMA",
        correo: "admin@wolertapp.com",
        telefono: "3000000000",
        usuario: "admin"
    };

    const form = document.getElementById("form-configuracion");
    const btnCancelar = document.getElementById("btn-cancelar-config");


    // ===== CARGAR CONFIGURACIÓN GUARDADA =====
    function cargarConfiguracion() {
        const guardado = localStorage.getItem(CLAVE_CONFIG);
        const config = guardado ? JSON.parse(guardado) : configPorDefecto;

        document.getElementById("config-nombre").value = config.nombre;
        document.getElementById("config-correo").value = config.correo;
        document.getElementById("config-telefono").value = config.telefono;
        document.getElementById("config-usuario").value = config.usuario;

        document.getElementById("perfil-nombre").textContent = config.nombre;
    }


    // ===== GUARDAR CAMBIOS =====
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const nuevaConfig = {
            nombre: document.getElementById("config-nombre").value,
            correo: document.getElementById("config-correo").value,
            telefono: document.getElementById("config-telefono").value,
            usuario: document.getElementById("config-usuario").value
        };

        localStorage.setItem(CLAVE_CONFIG, JSON.stringify(nuevaConfig));
        document.getElementById("perfil-nombre").textContent = nuevaConfig.nombre;

        alert("Cambios guardados correctamente.");
    });


    // ===== CANCELAR (descarta cambios sin guardar) =====
    btnCancelar.addEventListener("click", () => {
        cargarConfiguracion();
    });


    // ===== INICIALIZACIÓN =====
    cargarConfiguracion();

});