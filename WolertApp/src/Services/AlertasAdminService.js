
import { apiAdminPolicia } from "./AdminPoliciaApi";

export function listarAlertasAdmin(signal) {
  return apiAdminPolicia(
    "/api/Alertas?alcance=todas",
    {
      method: "GET",
      signal,
    }
  );
}

export function listarTiposAlerta(signal) {
  return apiAdminPolicia(
    "/api/TiposAlerta",
    {
      method: "GET",
      signal,
    }
  );
}
