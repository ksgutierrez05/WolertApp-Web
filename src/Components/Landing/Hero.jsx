import { Link } from 'react-router-dom'

function Hero() {
  return (
    <section id="inicio" className="hero">
      <div className="aurora"></div>

      <div className="hero-inner">
        <div className="hero-texto">
          <span className="hero-badge">
            <span className="punto-activo"></span>
            Activo en Valledupar
          </span>

          <h1>
            Alertas comunitarias{' '}
            <span className="resaltado">en la palma de tu mano</span>
          </h1>

          <p>
            Gestiona y recibe alertas sobre eventos importantes en tu comunidad
            de manera rápida y sencilla. Inicia sesión para acceder a tu rol y
            listo.
          </p>

          <div className="hero-acciones">
            <Link to="/login" className="btn">Iniciar sesión</Link>
            <a href="#como-funciona" className="btn btn-secundario">
              Ver cómo funciona
            </a>
          </div>

          <ul className="hero-confianza">
            <li><i className="bi bi-incognito"></i> Reportes anónimos</li>
            <li><i className="bi bi-bell"></i> Tiempo real</li>
            <li><i className="bi bi-person-badge"></i> Acceso por rol</li>
          </ul>
        </div>

        <div className="hero-visual">
          <div className="radar-wrap">
            <div className="radar">
              <div className="sweep"></div>
              <span className="blip" style={{ top: 30, left: 50 }}></span>
              <span className="blip" style={{ top: 130, right: 20 }}></span>
              <span className="blip" style={{ bottom: 40, left: 90 }}></span>
            </div>

            <div className="float-card fc1">
              <div className="row">
                <span className="dot"></span>
                <span className="t1">Notifica</span>
              </div>
              <div className="t2">Alertas en tiempo real</div>
            </div>

            <div className="float-card fc2">
              <div className="row">
                <span className="dot dot-verde"></span>
                <span className="t1">Alerta</span>
              </div>
              <div className="t2">Reporte enviado a tu zona</div>
            </div>

            <div className="float-card fc3">
              <div className="row">
                <span className="dot"></span>
                <span className="t1">Gestiona</span>
              </div>
              <div className="t2">Historial y seguimiento</div>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-hint">
        <i className="bi bi-chevron-down"></i>
      </div>
    </section>
  )
}

export default Hero