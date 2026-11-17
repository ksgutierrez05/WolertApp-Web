import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.min.css';

import './css/global.css';
import './css/temas.css';

// Tránsito - director
import './css/transito/director-transito/panel-principal.css';
import './css/transito/director-transito/panel-casos.css';
import './css/transito/director-transito/panel-agentes.css';
import './css/transito/director-transito/panel-semaforos.css';
import './css/transito/director-transito/panel-reportes.css';
import './css/transito/director-transito/panel-catalogo.css';
import './css/transito/director-transito/panel-configuracion.css';

// Tránsito - central
import './css/transito/central-transito/panel-principal.css';
import './css/transito/central-transito/panel-casos.css';
import './css/transito/central-transito/panel-agentes.css';
import './css/transito/central-transito/panel-historial.css';
import './css/transito/central-transito/panel-reportes.css';
import './css/transito/central-transito/panel-configuracion.css';

// Tránsito - agente
import './css/transito/agente-transito/panel-principal.css';
import './css/transito/agente-transito/panel-grupo.css';
import './css/transito/agente-transito/panel-historial.css';
import './css/transito/agente-transito/panel-configuracion.css';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
