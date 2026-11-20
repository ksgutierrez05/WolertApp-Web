import useReveal, { useSpotlight } from '../../Services/useReveal'

function Seguridad() {
  const ref = useReveal()
  const spotlight = useSpotlight()

  return (
    <section id="seguridad" className="seguridad" aria-labelledby="seguridad-title" ref={ref}>
      <div className="sec-head reveal">
        <span className="kicker">Confianza</span>
        <h2 id="seguridad-title">Seguridad y privacidad</h2>
        <p>
          Diseñamos WolertApp para que puedas alertar a tu comunidad sin
          exponerte.
        </p>
      </div>

      <div className="seguridad-grid">
        <div className="seguridad-item reveal" style={{ '--i': 0 }} onMouseMove={spotlight}>
          <span className="seguridad-icono-wrap">
            <i className="bi bi-incognito seguridad-icono"></i>
          </span>
          <h3>Registros de usuarios</h3>
          <p>
            Los registros de usuarios están protegidos y no se comparten con terceros que no sean vecinos o
            autoridades competentes. 
          </p>
        </div>

        <div className="seguridad-item reveal" style={{ '--i': 1 }} onMouseMove={spotlight}>
          <span className="seguridad-icono-wrap">
            <i className="bi bi-shield-lock seguridad-icono"></i>
          </span>
          <h3>Control de datos</h3>
          <p>
            Cada usuario tiene control sobre sus datos y puede gestionar su privacidad en cualquier momento.
             La información de contacto de los usuarios no es visible para otros.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Seguridad
