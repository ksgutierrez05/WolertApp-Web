
import { useCallback, useEffect, useState } from 'react';

import {
  ObtenerDatosPatrullero
} from '../Services/PoliciaService';

export default function usePatrullero() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Función para actualizar los datos manualmente
  const recargar = useCallback(async () => {
    setCargando(true);
    setError('');

    try {
      const resultado = await ObtenerDatosPatrullero();
      setDatos(resultado);
      return resultado;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  // Carga inicial de los datos
  useEffect(() => {
    let activo = true;

    ObtenerDatosPatrullero()
      .then(resultado => {
        if (activo) {
          setDatos(resultado);
        }
      })
      .catch(err => {
        if (activo) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  return {
    datos,
    cargando,
    error,
    recargar
  };
}
