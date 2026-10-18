function Cobertura() {
  return (
    <section id="cobertura" className="cobertura" aria-labelledby="cobertura-title">
      <div className="sec-head">
        <span className="cobertura-badge">
          <span className="punto-activo"></span>
          Cobertura activa
        </span>
        <h2 id="cobertura-title">Dónde ya está activo WolertApp</h2>
        <p>
          Por ahora WolertApp funciona en Valledupar, con planes de expandirse
          a más ciudades próximamente.
        </p>
      </div>

      <div className="cobertura-grid">
        <div className="cobertura-panel">
          <ul className="cobertura-stats">
            <li>
              <span className="stat-num">1</span>
              <span className="stat-label">ciudad activa</span>
            </li>
            <li>
              <span className="stat-num">24/7</span>
              <span className="stat-label">monitoreo comunitario</span>
            </li>
          </ul>

          <ul className="cobertura-roadmap">
            <li className="roadmap-item is-activo">
              <span className="roadmap-dot"></span>
              <span className="roadmap-ciudad">Valledupar</span>
              <span className="roadmap-estado">Activo</span>
            </li>
            <li className="roadmap-item">
              <span className="roadmap-dot"></span>
              <span className="roadmap-ciudad">Bogotá</span>
              <span className="roadmap-estado">Próximamente</span>
            </li>
            <li className="roadmap-item">
              <span className="roadmap-dot"></span>
              <span className="roadmap-ciudad">Barranquilla</span>
              <span className="roadmap-estado">Próximamente</span>
            </li>
          </ul>
        </div>

        <div className="cobertura-mapa-wrap">
          <img
            src="/img/mapa-valledupar.png"
            alt="Mapa de cobertura de WolertApp en Valledupar"
            className="cobertura-mapa"
          />
          <span className="mapa-pin">
            <span className="mapa-pin-pulso"></span>
            <span className="mapa-pin-punto"></span>
          </span>
          <span className="mapa-etiqueta">Valledupar</span>
        </div>
      </div>
    </section>
  )
}

export default Cobertura
