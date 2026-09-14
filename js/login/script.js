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
    document.body.classList.toggle("modo-registro")

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

// --- Registro ---
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

    const usuarios = obtenerUsuariosGuardados();

    // Validar que no exista ya ese username o cédula
    const yaExiste = usuarios.some(
        u => u.username.toLowerCase() === username.toLowerCase() || u.cedula === cedula
    );

    if (yaExiste) {
        registroError.textContent = "Ya existe una cuenta con ese usuario o cédula.";
        registroError.style.display = "block";
        return;
    }

    if (!username || !password || !primerNombre || !primerApellido || !cedula) {
        registroError.textContent = "Completa todos los campos obligatorios.";
        registroError.style.display = "block";
        return;
    }

    registroError.style.display = "none";

    const nombre = [primerNombre, segundoNombre, primerApellido, segundoApellido]
        .filter(Boolean)
        .join(" ");

    usuarios.push({ nombre, username, password, cedula, telefono, correo });
    guardarUsuariosLogin(usuarios);

    alert("Cuenta creada correctamente. Ahora inicia sesión.");
    formRegistro.reset();

    // Regresa automáticamente al panel de login
    authContainer.classList.remove("active");
    document.body.classList.remove("modo-registro");
    btnToggle.textContent = "Registrarse";
});

// --- Login ---
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

    // Guarda quién inició sesión (útil para saludar al usuario en el dashboard, por ejemplo)
    localStorage.setItem("wolertapp_sesion_activa", JSON.stringify(encontrado));

    // Redirige a donde corresponda tras iniciar sesión
    window.location.href = "../landing/index.html"; // 👈 cambia esto por tu ruta real
});