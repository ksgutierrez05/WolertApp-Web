// ===== ANIMACIÓN DE PASOS AL HACER SCROLL =====
const pasos = document.querySelectorAll(".paso");

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
        }
    });
});

pasos.forEach((paso) => observer.observe(paso));


// ===== ANIMACIÓN PANEL LOGIN/REGISTRO =====
const authContainer = document.getElementById("auth-container");
const btnToggle = document.getElementById("btn-toggle");

btnToggle.addEventListener("click", () => {
    authContainer.classList.toggle("active");
    document.body.classList.toggle("modo-registro");

    if (authContainer.classList.contains("active")) {
        btnToggle.textContent = "Iniciar sesión";
    } else {
        btnToggle.textContent = "Registrarse";
    }
});


// ============================================================
// AUTENTICACIÓN CON LOCALSTORAGE
// ============================================================

const USERS_KEY = "wolertapp_login_usuarios";

function obtenerUsuariosGuardados() {
    const guardado = localStorage.getItem(USERS_KEY);
    return guardado ? JSON.parse(guardado) : [];
}

function guardarUsuariosLogin(lista) {
    localStorage.setItem(USERS_KEY, JSON.stringify(lista));
}


// ===== REGISTRO =====
const formRegistro = document.getElementById("form-registro");
const registroError = document.getElementById("registro-error");

formRegistro.addEventListener("submit", (e) => {
    e.preventDefault();

    const primerNombre = document.getElementById("reg-primer-nombre").value.trim();
    const segundoNombre = document.getElementById("reg-segundo-nombre").value.trim();
    const primerApellido = document.getElementById("reg-primer-apellido").value.trim();
    const segundoApellido = document.getElementById("reg-segundo-apellido").value.trim();
    const cedula = document.getElementById("reg-cedula").value.trim();
    const telefono = document.getElementById("reg-telefono").value.trim();
    const correo = document.getElementById("reg-correo").value.trim();
    const username = document.getElementById("reg-username").value.trim();
    const password = document.getElementById("reg-password").value;
    const rol = document.getElementById("reg-rol").value;

    const usuarios = obtenerUsuariosGuardados();

    const yaExiste = usuarios.some(
        u => u.username.toLowerCase() === username.toLowerCase() || u.cedula === cedula
    );

    if (yaExiste) {
        registroError.textContent = "Ya existe una cuenta con ese usuario o cédula.";
        registroError.style.display = "block";
        return;
    }

    if (!username || !password || !primerNombre || !primerApellido || !cedula || !rol) {
        registroError.textContent = "Completa todos los campos obligatorios.";
        registroError.style.display = "block";
        return;
    }

    registroError.style.display = "none";

    const nombre = [primerNombre, segundoNombre, primerApellido, segundoApellido]
        .filter(Boolean)
        .join(" ");

    usuarios.push({ nombre, username, password, cedula, telefono, correo, rol });
    guardarUsuariosLogin(usuarios);

    alert("Cuenta creada correctamente. Ahora inicia sesión.");
    formRegistro.reset();

    authContainer.classList.remove("active");
    document.body.classList.remove("modo-registro");
    btnToggle.textContent = "Registrarse";
});


// ===== LOGIN =====
const formLogin = document.getElementById("form-login");
const loginError = document.getElementById("login-error");

formLogin.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const usuarios = obtenerUsuariosGuardados();

    const encontrado = usuarios.find(
        u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!encontrado) {
        loginError.textContent = "Usuario o contraseña incorrectos.";
        loginError.style.display = "block";
        return;
    }

    loginError.style.display = "none";

    localStorage.setItem("wolertapp_sesion_activa", JSON.stringify(encontrado));

    // ===== REDIRECCIÓN SEGÚN ROL =====
    switch (encontrado.rol) {
        case "admin":
            window.location.href = "../admin/index.html";//sirve
            break;

        case "policia":
            window.location.href = "../Policia/Central/centro-operaciones/centro-operaciones.html";//sirve
            break;

        case "central":
            window.location.href = "../Policia/Central/centro-operaciones/centro-operaciones.html";//sirve
            break;

        case "admin-policia":
            window.location.href = "../Policia/AdminitradorPolicia/centro-operaciones/centro-operaciones.html";//sirve
            break;

        case "ciudadano":
            window.location.href = "../ciudadano/pagina-principal.html";//sirve
            break;

        default:
            window.location.href = "../landing/index.html";
    }
});