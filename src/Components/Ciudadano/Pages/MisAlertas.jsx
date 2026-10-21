import '../../../css/global.css';
import '../../../css/temas.css';
import '../../../css/ciudadano/panel-mis-alertas.css';

export default function MisAlertas() {
  return (
    <div className="container-fluid">
      <h1 className="page-title-dash"><i className="bi bi-exclamation-triangle"></i> Mis Alertas</h1>
      <p className="hero-text-dash" style={{ color: 'var(--muted)' }}>Aquí verás tus alertas reportadas (en migración).</p>
    </div>
  );
}