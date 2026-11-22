import { GoogleOAuthProvider } from '@react-oauth/google'
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
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
import './css/transito/central-transito/panel-agentes.css';
import './css/transito/central-transito/panel-historial.css';
import './css/transito/central-transito/panel-reportes.css';
import './css/transito/central-transito/panel-configuracion.css';
import './css/transito/agente-transito/panel-principal.css';
import './css/transito/agente-transito/panel-grupo.css';
import './css/transito/agente-transito/panel-historial.css';

import App from './App';
import { StrictMode } from 'react';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);



