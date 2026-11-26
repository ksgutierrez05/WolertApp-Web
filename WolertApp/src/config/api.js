const DEFAULT_API_URL = "https://localhost:7138";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
).replace(/\/+$/, "");

// Alias sencillos para mantener legibles los nombres usados por los servicios.
export const API = API_BASE_URL;
export const API_URL = API_BASE_URL;
