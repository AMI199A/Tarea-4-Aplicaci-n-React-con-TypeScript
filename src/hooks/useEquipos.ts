import { useCallback, useEffect, useState } from "react";
import { obtenerEquipos } from "../services/api";
import type { Equipo } from "../types";

interface UseEquiposResult {
  equipos: Equipo[];
  cargando: boolean;
  error: string | null;
  reintentar: () => void;
}

export function useEquipos(): UseEquiposResult {
  const [intento, setIntento] = useState(0);
  const [resultado, setResultado] = useState<{
    intento: number;
    equipos: Equipo[];
    error: string | null;
  }>({ intento: -1, equipos: [], error: null });

  const reintentar = useCallback(() => {
    setIntento((actual) => actual + 1);
  }, []);

  useEffect(() => {
    let vigente = true;

    obtenerEquipos()
      .then((datos) => {
        if (vigente) setResultado({ intento, equipos: datos, error: null });
      })
      .catch((fallo: Error) => {
        if (vigente) setResultado({ intento, equipos: [], error: fallo.message });
      });

    return () => {
      vigente = false;
    };
  }, [intento]);

  const resultadoActual = resultado.intento === intento;

  return {
    equipos: resultado.equipos,
    cargando: !resultadoActual,
    error: resultadoActual ? resultado.error : null,
    reintentar,
  };
}
