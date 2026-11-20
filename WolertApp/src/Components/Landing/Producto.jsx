import useReveal, { useSpotlight } from '../../Services/useReveal'

function Producto() {
  const ref = useReveal()
  const spotlight = useSpotlight()

  return (
    <section id="producto" className="producto" ref={ref}>
      <div className="sec-head reveal">
        <span className="kicker">Producto</span>
        <h2>Todo lo que necesitas para mantener tu comunidad segura</h2>
        <p>
          Desde el primer reporte hasta el seguimiento, WolertApp acompaña cada
          paso del proceso.
        </p>
      </div>

      <ul className="features-grid">
        {/* 1 · Alertas en tiempo real */}
        <li className="feature-card fc-ancha reveal" style={{ '--i': 0 }} onMouseMove={spotlight}>
          <div className="feature-icon"><i className="bi bi-bell"></i></div>
          <h3>Alertas en tiempo real</h3>
          <p>
            Recibe notificaciones al instante cuando ocurre un evento importante
            cerca de ti.
          </p>

          <ul className="mini-feed" aria-hidden="true">
            <li style={{ '--k': 0 }}>
              <i className="bi bi-bell-fill"></i>
              <span><b>Alarma comunitaria</b><small>Tu zona · ahora</small></span>
              <em>Nueva</em>
            </li>
            <li style={{ '--k': 1 }}>
              <i className="bi bi-exclamation-triangle-fill"></i>
              <span><b>Actividad sospechosa</b><small>Cerca de ti · hace 2 min</small></span>
            </li>
            <li style={{ '--k': 2 }}>
              <i className="bi bi-shield-check"></i>
              <span><b>Situación atendida</b><small>Reporte cerrado · hace 8 min</small></span>
            </li>
          </ul>
        </li>

        {/* 2 · Reportes anónimos */}
        <li className="feature-card fc-estrecha reveal" style={{ '--i': 1 }} onMouseMove={spotlight}>
          <div className="feature-icon"><i className="bi bi-incognito"></i></div>
          <h3>Privacidad de datos</h3>
          <p>
            Tus datos están protegidos y no se compartirán con terceros externos a la plataforma.
          </p>

          <div className="mini-anon" aria-hidden="true">
            <span className="mini-anon-linea">Reporte · Tu zona</span>
            <span className="mini-anon-autor">
              <i className="bi bi-lock-fill"></i> Enviado por <span className="mini-anon-barra"></span>
            </span>
          </div>
        </li>

        {/* 3 · Asignaciones */}
        <li className="feature-card fc-estrecha reveal" style={{ '--i': 2 }} onMouseMove={spotlight}>
          <div className="feature-icon"><i className="bi bi-person-badge"></i></div>
          <h3>Asignaciones</h3>
          <p>
            Usuarios con roles específicos pueden acceder a funcionalidades avanzadas de la plataforma.
          </p>

          <div className="mini-roles" aria-hidden="true">
            <span>Ciudadano</span>
            <span>Administrador</span>
            <span>Policiaco</span>
          </div>
        </li>

        {/* 4 · Historial */}
        <li className="feature-card fc-ancha reveal" style={{ '--i': 3 }} onMouseMove={spotlight}>
          <div className="feature-icon"><i className="bi bi-clock-history"></i></div>
          <h3>Historial de alertas</h3>
          <p>
            Consulta los eventos reportados en tu zona y lleva un registro de lo
            que pasó.
          </p>

          <ol className="mini-hist" aria-hidden="true">
            <li style={{ '--k': 0 }}><span></span>Alerta recibida</li>
            <li style={{ '--k': 1 }}><span></span>Comunidad notificada</li>
            <li style={{ '--k': 2 }}><span></span>Situación atendida</li>
            <li style={{ '--k': 3 }}><span></span>Registro guardado</li>
          </ol>
        </li>

        {/* 5 · Mapa de alertas */}
        <li className="feature-card fc-ancha reveal" style={{ '--i': 4 }} onMouseMove={spotlight}>
          <div className="feature-icon"><i className="bi bi-map"></i></div>
          <h3>Mapa de alertas</h3>
          <p>
            Visualiza dónde ocurren los eventos y sigue la zona afectada en
            tiempo real, desde tu barrio hasta el mapa completo de la ciudad.
          </p>

          <ul className="mini-mapa" aria-hidden="true">
            <li className="mini-mapa-bloque"></li>
            <li className="mini-mapa-bloque mini-mapa-bloque--centro"></li>
            <li className="mini-mapa-bloque"></li>
            <li className="mini-mapa-bloque"></li>
            <li className="mini-mapa-bloque"></li>
            <li className="mini-mapa-bloque"></li>
          </ul>
        </li>

        {/* 6 · Alertas por barrio */}
        <li className="feature-card fc-estrecha reveal" style={{ '--i': 5 }} onMouseMove={spotlight}>
          <div className="feature-icon"><i className="bi bi-geo-alt"></i></div>
          <h3>Alertas por barrio</h3>
          <p>
            Mira cómo se distribuyen las alarmas entre barrios y actúa antes
            de que el evento se propague.
          </p>

          <ul className="mini-barrios" aria-hidden="true">
            <li className="barrio-fila barrio-fila--ok">
              <span className="barrio-estado"></span>El Parque · activo
            </li>
            <li className="barrio-fila barrio-fila--cuidado">
              <span className="barrio-estado"></span>Los Cipreses · con atención
            </li>
            <li className="barrio-fila">
              <span className="barrio-estado"></span>Valle Verde · seguro
            </li>
          </ul>
        </li>
      </ul>
    </section>
  )
}

export default Producto