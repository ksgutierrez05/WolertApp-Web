import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
// Mismos CSS de siempre (ajusta la ruta a donde los dejes dentro de src/ o public/)
import './css/global.css';
import './css/temas.css';
import './css/transito/director-transito/panel-principal.css';
import './css/transito/director-transito/panel-casos.css';
import './css/transito/director-transito/panel-agentes.css';
import './css/transito/director-transito/panel-semaforos.css';
import './css/transito/director-transito/panel-reportes.css';
import './css/transito/director-transito/panel-catalogo.css';
import './css/transito/director-transito/panel-configuracion.css';
import './css/transito/agente-transito/panel-configuracion.css';
import './css/transito/central-transito/panel-principal.css';
import './css/transito/central-transito/panel-casos.css';
import App from './App';

createRoot(document.getElementById('root')).render(<App />);