import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-marca">
          <div className="footer-logo">
            <img src="/img/logo.png" alt="WolertApp" className="footer-logo-img" />
            <span className="footer-logo-texto">WolertApp</span>
          </div>
          <p>
            Alertas comunitarias para mantener a tu ciudad conectada y segura.
          </p>
        </div>

        <div className="footer-col">
          <h3>Producto</h3>
          <a href="#producto">Funcionalidades</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#cobertura">Cobertura</a>
        </div>

        <div className="footer-col">
          <h3>Comunidad</h3>
          <a href="#seguridad">Seguridad y privacidad</a>
          <Link to="/login">Iniciar sesión</Link>
          <a href="#cobertura">Próximas ciudades</a>
        </div>

        <div className="footer-col">
          <h3>Contacto</h3>
          <a href="mailto:contacto@wolertapp.com">contacto@wolertapp.com</a>
          <span className="footer-texto-plano">Valledupar, Cesar</span>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 WolertApp. Todos los derechos reservados.</span>
        <div className="footer-legal">
          <a href="#">Privacidad</a>
          <span className="footer-punto">·</span>
          <a href="#">Términos de uso</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
