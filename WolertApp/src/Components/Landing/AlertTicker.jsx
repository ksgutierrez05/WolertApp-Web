// Franja animada con el tipo de eventos que una comunidad puede alertar.
// Ajusta la lista a los tipos de alerta reales de la app.
const EVENTOS = [
  { icono: 'bi-bell-fill', texto: 'Alarma comunitaria' },
  { icono: 'bi-exclamation-triangle-fill', texto: 'Actividad sospechosa' },
  { icono: 'bi-fire', texto: 'Incendio' },
  { icono: 'bi-heart-pulse-fill', texto: 'Emergencia médica' },
  { icono: 'bi-lightning-charge-fill', texto: 'Riesgo en la vía' },
  { icono: 'bi-people-fill', texto: 'Aviso a los vecinos' },
  { icono: 'bi-shield-check', texto: 'Situación atendida' },
]

function Lista({ oculta = false }) {
  return (
    <ul className="ticker-lista" aria-hidden={oculta || undefined}>
      {EVENTOS.map((e) => (
        <li key={e.texto} className="ticker-item">
          <i className={`bi ${e.icono}`}></i>
          {e.texto}
        </li>
      ))}
    </ul>
  )
}

function AlertTicker() {
  return (
    <div className="ticker" aria-label="Eventos que tu comunidad puede alertar">
      <div className="ticker-track">
        <Lista />
        <Lista oculta />
      </div>
    </div>
  )
}

export default AlertTicker
