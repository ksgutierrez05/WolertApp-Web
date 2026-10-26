import { useState } from 'react';
import FormLogin from '../../Components/Login/FormLogin';
import FormRegistro from '../../Components/Login/FormRegistro';
import { guardarSesionActiva } from '../../utils/utils';
import '../../css/login/styles.css';

function Login() {
    const [esRegistro, setRegistro] = useState(false);

    function toggleFormulario(){
        setRegistro(!esRegistro); 
    }

    function handleLoginSuccess(usuario) {
        guardarSesionActiva(usuario);
         
        const rutas = {
          'admin': '/admin',
          'policia': '/policia/centro-operaciones',
          'central': '/policia/central/centro-operaciones',
          'admin-policia': '/policia/admin/centro-operaciones',
          'ciudadano': '/ciudadano',
          'Agente-transito': '/transito/agente',
          'Central-transito': '/transito/central',
          'Director-transito': '/transito/director'
        }

        const ruta = rutas[usuario.rol] || '/';
        window.location.href = ruta;
    }

    function handleRegistroSuccess() {
        setRegistro(false);
    }

    return (
    <div className={`auth-container ${esRegistro ? 'active' : ''}`}>
      <a href="/" className="btn-volver">
        <i className="bi bi-arrow-left"></i>
        Volver
      </a>

      <FormLogin onLoginSuccess={handleLoginSuccess} />

      <div className="panel-deslizante">
        <img src="/img/logo.png" alt="WolertApp" className="login-logo" />
        <h1>WolertApp</h1>
        <p>Sistema de alertas comunitarias</p>
        <p className="login-tagline">
          Seguridad para tu barrio<br />y notificaciones en tiempo real
        </p>
        <button type="button" className="btn-registrarse" onClick={toggleFormulario}>
          {esRegistro ? 'Iniciar sesión' : 'Registrarse'}
        </button>
      </div>

      <FormRegistro onRegistroSuccess={handleRegistroSuccess} />
    </div>
    );
};

export default Login;
