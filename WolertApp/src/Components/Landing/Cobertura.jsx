import useReveal from '../../Services/useReveal'

const CIUDADES = [
  { nombre: 'Valledupar', activa: true },
  { nombre: 'Bogotá', activa: false },
  { nombre: 'Barranquilla', activa: false },
]

function Cobertura() {
  const ref = useReveal()

  return (
    <section id="cobertura" className="cobertura" aria-labelledby="cobertura-title" ref={ref}>
      <div className="sec-head reveal">
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
        <div className="cobertura-panel reveal" style={{ '--i': 0 }}>
          <span className="mapa-leyenda cobertura-leyenda">
            <span className="punto-activo"></span> Zona de cobertura activa
          </span>
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
            {CIUDADES.map((c) => (
              <li key={c.nombre} className={`roadmap-item ${c.activa ? 'is-activo' : ''}`}>
                <span className="roadmap-dot"></span>
                <span className="roadmap-ciudad">{c.nombre}</span>
                <span className="roadmap-estado">{c.activa ? 'Activo' : 'Próximamente'}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="cobertura-mapa-wrap reveal reveal-scale" style={{ '--i': 1 }}>
          <img
            src="/img/MapaValledupar.png"
            alt="Mapa de cobertura de WolertApp en Valledupar"
            className="cobertura-mapa"
          />
          {/* Ajusta --pin-x / --pin-y para ubicar el pin sobre tu imagen */}
          <span className="mapa-pin" style={{ '--pin-x': '50%', '--pin-y': '50%' }}>
            <span className="mapa-pin-pulso"></span>
            <span className="mapa-pin-pulso mapa-pin-pulso-2"></span>
            <span className="mapa-pin-punto"></span>
            <span className="mapa-etiqueta">Valledupar</span>
          </span>

        </div>
      </div>
    </section>
  )
}

export default Cobertura