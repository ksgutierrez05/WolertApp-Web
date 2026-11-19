function Producto() {
  return (
    <section id="producto" className="producto">
      <div className="sec-head">
        <span className="kicker">Producto</span>
        <h2>Todo lo que necesitas para mantener tu comunidad segura</h2>
        <p>
          Desde el primer reporte hasta el seguimiento, WolertApp acompaña cada
          paso del proceso.
        </p>
      </div>

      <ul className="features-grid">
        <li className="feature-card">
          <div className="feature-icon">
            <i className="bi bi-bell"></i>
          </div>
          <h3>Alertas en tiempo real</h3>
          <p>
            Recibe notificaciones al instante cuando ocurre un evento importante
            cerca de ti.
          </p>
        </li>

        <li className="feature-card">
          <div className="feature-icon">
            <i className="bi bi-person-badge"></i>
          </div>
          <h3>Asignaciones</h3>
          <p>
            Recibirás un rol al momento de tu registro que te dará acceso a
            ciertas funcionalidades de WolertApp.
          </p>
        </li>

        <li className="feature-card">
          <div className="feature-icon">
            <i className="bi bi-clock-history"></i>
          </div>
          <h3>Historial de alertas</h3>
          <p>
            Consulta los eventos reportados en tu zona y llevá un registro de lo
            que pasó.
          </p>
        </li>
      </ul>
    </section>
  )
}

export default Producto
