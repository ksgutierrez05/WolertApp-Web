function Seguridad() {
  return (
    <section id="seguridad" className="seguridad" aria-labelledby="seguridad-title">
      <div className="sec-head">
        <span className="kicker">Confianza</span>
        <h2 id="seguridad-title">Seguridad y privacidad</h2>
        <p>
          Diseñamos WolertApp para que puedas alertar a tu comunidad sin
          exponerte.
        </p>
      </div>

      <div className="seguridad-grid">
        <div className="seguridad-item">
          <i className="bi bi-incognito seguridad-icono"></i>
          <h3>Tu identidad no queda expuesta</h3>
          <p>Quien recibe una alerta ve el reporte, no quién lo hizo.</p>
        </div>

        <div className="seguridad-divisor"></div>

        <div className="seguridad-item">
          <i className="bi bi-shield-lock seguridad-icono"></i>
          <h3>Tú decides qué compartir</h3>
          <p>
            Un vecino o testigo puede activar una alerta o dejar información
            sin que su identidad quede registrada ni sea visible para nadie más
            que el sistema.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Seguridad
