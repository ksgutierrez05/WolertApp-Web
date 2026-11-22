import { Routes, Route, Navigate } from "react-router-dom";

import Panel from "../director-transito/PanelPrincipal";
import Casos from "../director-transito/Casos";
import Agentes from "../director-transito/Agentes";
import Semaforos from "../director-transito/Semaforos";
import Reportes from "../director-transito/Reportes";
import Catalogo from "../director-transito/Catalogo";
import Configuracion from "../director-transito/Configuracion";
import Unidades from "../director-transito/Unidades";

export default function Director() {
  return (
    <Routes>
      <Route index element={<Navigate to="panel" replace />} />
      <Route path="panel" element={<Panel />} />
      <Route path="casos" element={<Casos />} />
      <Route path="agentes" element={<Agentes />} />
      <Route path="unidades" element={<Unidades />} />
      <Route path="semaforos" element={<Semaforos />} />
      <Route path="reportes" element={<Reportes />} />
      <Route path="catalogo" element={<Catalogo />} />
      <Route path="configuracion" element={<Configuracion />} />
    </Routes>
  );
}
