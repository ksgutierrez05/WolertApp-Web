import { Link } from 'react-router-dom'

function Hero() {
  return (
    <section id="inicio" className="hero">
      <div className="aurora"></div>

      <div className="hero-inner">
        <div className="hero-texto">
          <h1>Alertas comunitarias en la palma de tu mano</h1>
          <p>
            Gestiona y recibe alertas sobre eventos importantes en tu comunidad
            de manera rápida y sencilla, inicia sesión para acceder a tu rol y
            listo
          </p>
          <Link to="/login" className="btn">Iniciar sesión</Link>
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
