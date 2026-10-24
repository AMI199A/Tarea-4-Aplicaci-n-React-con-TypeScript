import { useEffect, useMemo, useState } from "react";
import { Encabezado } from "./components/Encabezado";
import { FormularioPrestamo } from "./components/FormularioPrestamo";
import { actualizarEquipo, actualizarPrestamo, obtenerPrestamosActivos, registrarPrestamo } from "./services/api";
import { Inventario } from "./pages/Inventario";
import { PrestamosActivos } from "./pages/PrestamosActivos";
import { useEquipos } from "./hooks/useEquipos";
import type { NuevoPrestamo, Prestamo } from "./types";
import "./App.css";

const TITULO_APP = "Préstamos Lab — 0902-22-11171";

type Vista = "inventario" | "prestamos";

function fechaLocal(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function mensajeDeError(fallo: unknown): string {
  return fallo instanceof Error ? fallo.message : "Error inesperado.";
}

function App() {
  const { equipos, cargando, error, reintentar } = useEquipos();
  const [intentoPrestamos, setIntentoPrestamos] = useState(0);
  const [resultadoPrestamos, setResultadoPrestamos] = useState<{
    intento: number;
    prestamos: Prestamo[];
    error: string | null;
  }>({ intento: -1, prestamos: [], error: null });
  const [vista, setVista] = useState<Vista>("inventario");
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<number | null>(
    null,
  );
  const [enviando, setEnviando] = useState(false);
  const [devolviendoId, setDevolviendoId] = useState<number | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mensajeEsError, setMensajeEsError] = useState(false);
  const [fechaActual] = useState(() => new Date());

  useEffect(() => {
    document.title = TITULO_APP;
  }, []);

  useEffect(() => {
    let vigente = true;

    obtenerPrestamosActivos()
      .then((datos) => {
        if (vigente) {
          setResultadoPrestamos({
            intento: intentoPrestamos,
            prestamos: datos,
            error: null,
          });
        }
      })
      .catch((fallo: Error) => {
        if (vigente) {
          setResultadoPrestamos({
            intento: intentoPrestamos,
            prestamos: [],
            error: fallo.message,
          });
        }
      });

    return () => {
      vigente = false;
    };
  }, [intentoPrestamos]);

  const prestamosActuales = resultadoPrestamos.intento === intentoPrestamos;
  const prestamos = resultadoPrestamos.prestamos;
  const cargandoPrestamos = !prestamosActuales;
  const errorPrestamos = prestamosActuales ? resultadoPrestamos.error : null;
  const equipoParaPrestamo = equipos.find(
    (equipo) => equipo.id === equipoSeleccionado,
  );
  const prestamosVencidos = useMemo(() => {
    const hoy = fechaLocal(fechaActual);
    return prestamos.filter(
      (prestamo) =>
        prestamo.fechaLimite.slice(0, 10) < hoy && !prestamo.devuelto,
    ).length;
  }, [fechaActual, prestamos]);
  const disponibles = equipos.filter((equipo) => equipo.disponible).length;

  function recargarPrestamos() {
    setIntentoPrestamos((actual) => actual + 1);
  }

  async function guardarPrestamo(datos: {
    solicitante: string;
    carne: string;
    fechaLimite: string;
  }) {
    if (!equipoParaPrestamo) return;

    setEnviando(true);
    setErrorEnvio(null);
    setMensaje(null);
    setMensajeEsError(false);

    const nuevoPrestamo: NuevoPrestamo = {
      equipoId: equipoParaPrestamo.id,
      solicitante: datos.solicitante,
      carne: datos.carne,
      fechaPrestamo: new Date().toISOString(),
      fechaLimite: datos.fechaLimite,
      devuelto: false,
    };

    try {
      await actualizarEquipo(equipoParaPrestamo.id, { disponible: false });
      try {
        await registrarPrestamo(nuevoPrestamo);
      } catch (falloRegistro) {
        try {
          await actualizarEquipo(equipoParaPrestamo.id, { disponible: true });
        } catch (falloReversion) {
          throw new Error(
            `No se pudo registrar el préstamo (${mensajeDeError(falloRegistro)}) ni restablecer la disponibilidad (${mensajeDeError(falloReversion)}).`,
          );
        }
        throw falloRegistro;
      }

      setEquipoSeleccionado(null);
      setMensaje(`Préstamo registrado para ${datos.solicitante}.`);
      reintentar();
      recargarPrestamos();
    } catch (fallo) {
      setErrorEnvio(
        `No se pudo registrar el préstamo: ${mensajeDeError(fallo)}`,
      );
    } finally {
      setEnviando(false);
    }
  }

  async function devolverPrestamo(prestamo: Prestamo) {
    const equipo = equipos.find((item) => item.id === prestamo.equipoId);
    if (!equipo) {
      setMensaje("No se encontró el equipo asociado; actualiza los datos e inténtalo de nuevo.");
      setMensajeEsError(true);
      return;
    }

    setDevolviendoId(prestamo.id);
    setMensaje(null);
    setMensajeEsError(false);

    try {
      await actualizarPrestamo(prestamo.id, { devuelto: true });
      try {
        await actualizarEquipo(equipo.id, { disponible: true });
      } catch (falloEquipo) {
        try {
          await actualizarPrestamo(prestamo.id, { devuelto: false });
        } catch (falloReversion) {
          throw new Error(
            `No se pudo liberar el equipo (${mensajeDeError(falloEquipo)}) ni restaurar el préstamo activo (${mensajeDeError(falloReversion)}).`,
          );
        }
        throw falloEquipo;
      }

      setMensaje(`${equipo.nombre} se registró como devuelto.`);
      reintentar();
      recargarPrestamos();
    } catch (fallo) {
      setMensaje(`No se pudo completar la devolución: ${mensajeDeError(fallo)}`);
      setMensajeEsError(true);
    } finally {
      setDevolviendoId(null);
    }
  }

  return (
    <div className="app-shell" id="inicio">
      <Encabezado
        titulo={TITULO_APP}
        disponibles={disponibles}
        total={equipos.length}
        prestamosVencidos={prestamosVencidos}
      />

      <nav className="main-nav" aria-label="Navegación principal">
        <div className="nav-inner">
          <button
            type="button"
            className={`nav-link ${vista === "inventario" ? "nav-link-active" : ""}`}
            aria-current={vista === "inventario" ? "page" : undefined}
            onClick={() => setVista("inventario")}
          >
            <span className="nav-icon" aria-hidden="true">▦</span>
            Inventario
          </button>
          <button
            type="button"
            className={`nav-link ${vista === "prestamos" ? "nav-link-active" : ""}`}
            aria-current={vista === "prestamos" ? "page" : undefined}
            onClick={() => setVista("prestamos")}
          >
            <span className="nav-icon" aria-hidden="true">↗</span>
            Préstamos activos
            {prestamos.length > 0 && (
              <span className="nav-count">{prestamos.length}</span>
            )}
          </button>
          <span className="nav-spacer" />
          <span className="nav-note">
            <span className="availability-dot" /> Sistema operativo
          </span>
        </div>
      </nav>

      {mensaje && (
        <div
          className={`toast-message ${mensajeEsError ? "toast-message-error" : ""}`}
          role={mensajeEsError ? "alert" : "status"}
        >
          <span aria-hidden="true">✓</span>
          {mensaje}
          <button
            type="button"
            aria-label="Cerrar mensaje"
            onClick={() => setMensaje(null)}
          >
            ×
          </button>
        </div>
      )}

      {vista === "inventario" ? (
        <Inventario
          equipos={equipos}
          cargando={cargando}
          error={error}
          onPrestar={(id) => {
            if (cargandoPrestamos || errorPrestamos) {
              setMensajeEsError(true);
              setMensaje(
                "No se puede verificar si el carné ya tiene un préstamo activo. Reintenta la carga de préstamos.",
              );
              recargarPrestamos();
              return;
            }
            setErrorEnvio(null);
            setEquipoSeleccionado(id);
          }}
          onReintentar={reintentar}
        />
      ) : (
        <PrestamosActivos
          prestamos={prestamos}
          equipos={equipos}
          cargando={cargandoPrestamos}
          error={errorPrestamos}
          devolviendoId={devolviendoId}
          onDevolver={devolverPrestamo}
          onReintentar={recargarPrestamos}
        />
      )}

      <footer className="app-footer">
        <span><strong>LAB / CONTROL</strong> · Gestión de equipo</span>
        <span>Variante 0–1 · Préstamo máximo de 3 días</span>
      </footer>

      {equipoParaPrestamo && (
        <FormularioPrestamo
          key={equipoParaPrestamo.id}
          equipo={equipoParaPrestamo}
          prestamosActivos={prestamos}
          enviando={enviando}
          errorEnvio={errorEnvio}
          onCancelar={() => {
            if (!enviando) setEquipoSeleccionado(null);
          }}
          onGuardar={guardarPrestamo}
        />
      )}
    </div>
  );
}

export default App;
