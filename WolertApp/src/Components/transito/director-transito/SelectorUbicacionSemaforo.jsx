import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
const CENTRO = [10.4769, -73.2509];
const icono = L.divIcon({
  className: "sem-marker",
  html: '<div class="sem-pin">🚦</div>',
  iconSize: [38, 45],
  iconAnchor: [19, 43],
});
function Seleccion({ onSeleccionar }) {
  useMapEvents({
    click(e) {
      onSeleccionar({
        latitud: e.latlng.lat.toFixed(6),
        longitud: e.latlng.lng.toFixed(6),
      });
    },
  });
  return null;
}
function Enfocar({ p }) {
  const map = useMap();
  useEffect(() => {
    if (p) map.setView(p, 16);
  }, [map, p?.[0], p?.[1]]);
  return null;
}
export default function SelectorUbicacionSemaforo({
  latitud,
  longitud,
  onSeleccionar,
}) {
  const lat = Number(latitud),
    lng = Number(longitud);
  const posicion =
    latitud !== "" &&
    longitud !== "" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
      ? [lat, lng]
      : null;
  return (
    <div className="sem-selector">
      <div className="sem-selector-label">
        <strong>Selecciona la ubicación</strong>
        <small>Haz clic en el mapa para indicar las coordenadas</small>
      </div>
      <MapContainer
        center={posicion || CENTRO}
        zoom={14}
        className="sem-selector-leaflet"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Seleccion onSeleccionar={onSeleccionar} />
        <Enfocar p={posicion} />
        {posicion && <Marker position={posicion} icon={icono} />}
      </MapContainer>
      <div className="sem-selector-coords">
        {posicion ? `${latitud}, ${longitud}` : "Sin ubicación seleccionada"}
      </div>
    </div>
  );
}
