import { useState, type FormEvent } from "react";
import type { Equipo, Prestamo } from "../types";

interface FormularioPrestamoProps {
  equipo: Equipo;
  prestamosActivos: Prestamo[];
  enviando: boolean;
  errorEnvio: string | null;
  onCancelar: () => void;
  onGuardar: (datos: {
    solicitante: string;
    carne: string;
    fechaLimite: string;
  }) => Promise<void>;
}

interface ErroresFormulario {
  solicitante?: string;
  carne?: string;
  fechaLimite?: string;
}

function fechaLocal(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function sumarDias(fecha: Date, dias: number): Date {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

export function FormularioPrestamo({
  equipo,
  prestamosActivos,
  enviando,
  errorEnvio,
  onCancelar,
  onGuardar,
}: FormularioPrestamoProps) {
  const [fechaActual] = useState(() => new Date());
  const hoy = fechaLocal(fechaActual);
  const fechaMaxima = fechaLocal(sumarDias(fechaActual, 3));
  const [solicitante, setSolicitante] = useState("");
  const [carne, setCarne] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [errores, setErrores] = useState<ErroresFormulario>({});

  function validar(): ErroresFormulario {
    const nuevosErrores: ErroresFormulario = {};

    if (solicitante.trim().length < 5) {
      nuevosErrores.solicitante =
        "Escribe el nombre del solicitante (mínimo 5 caracteres).";
    }

    if (!/^\d{4}-\d{2}-\d{5}$/.test(carne.trim())) {
      nuevosErrores.carne = "Usa el formato 0000-00-00000.";
    } else if (
      prestamosActivos.some(
        (prestamo) => prestamo.carne.toLowerCase() === carne.trim().toLowerCase(),
      )
    ) {
      nuevosErrores.carne = "Este carné ya tiene un préstamo activo.";
    }

    if (!fechaLimite) {
      nuevosErrores.fechaLimite = "Selecciona una fecha límite.";
    } else if (fechaLimite < hoy) {
      nuevosErrores.fechaLimite = "La fecha límite no puede ser anterior a hoy.";
    } else if (fechaLimite > fechaMaxima) {
      nuevosErrores.fechaLimite =
        "El préstamo no puede superar el máximo de 3 días.";
    }

    return nuevosErrores;
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const nuevosErrores = validar();
    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) return;

    await onGuardar({
      solicitante: solicitante.trim(),
      carne: carne.trim(),
      fechaLimite,
    });
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget && !enviando) onCancelar();
      }}
    >
      <section
        className="loan-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="loan-title"
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">NUEVO MOVIMIENTO</span>
            <h2 id="loan-title">Registrar préstamo</h2>
            <p>{equipo.nombre}</p>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Cerrar formulario"
            disabled={enviando}
            onClick={onCancelar}
          >
            ×
          </button>
        </div>

        <form className="loan-form" onSubmit={manejarEnvio} noValidate>
          <label className="form-field" htmlFor="solicitante">
            Nombre del solicitante
            <input
              id="solicitante"
              autoFocus
              autoComplete="name"
              value={solicitante}
              onChange={(evento) => setSolicitante(evento.target.value)}
              aria-invalid={Boolean(errores.solicitante)}
              aria-describedby={errores.solicitante ? "error-solicitante" : undefined}
              placeholder="Nombre y apellido"
            />
            {errores.solicitante && (
              <span className="field-error" id="error-solicitante">
                {errores.solicitante}
              </span>
            )}
          </label>

          <label className="form-field" htmlFor="carne">
            Carné universitario
            <input
              id="carne"
              value={carne}
              onChange={(evento) => setCarne(evento.target.value)}
              aria-invalid={Boolean(errores.carne)}
              aria-describedby={errores.carne ? "error-carne" : "carne-help"}
              placeholder="0000-00-00000"
              inputMode="numeric"
            />
            <span
              className={errores.carne ? "field-error" : "field-hint"}
              id={errores.carne ? "error-carne" : "carne-help"}
            >
              {errores.carne ?? "Formato: 0000-00-00000"}
            </span>
          </label>

          <label className="form-field" htmlFor="fecha-limite">
            Fecha límite de devolución
            <input
              id="fecha-limite"
              type="date"
              min={hoy}
              max={fechaMaxima}
              value={fechaLimite}
              onChange={(evento) => setFechaLimite(evento.target.value)}
              aria-invalid={Boolean(errores.fechaLimite)}
              aria-describedby={
                errores.fechaLimite ? "error-fecha" : "fecha-help"
              }
            />
            <span
              className={errores.fechaLimite ? "field-error" : "field-hint"}
              id={errores.fechaLimite ? "error-fecha" : "fecha-help"}
            >
              {errores.fechaLimite ??
                `Máximo 3 días · hasta el ${fechaMaxima}`}
            </span>
          </label>

          {errorEnvio && (
            <div className="inline-error" role="alert">
              {errorEnvio}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="button button-secondary"
              disabled={enviando}
              onClick={onCancelar}
            >
              Cancelar
            </button>
            <button type="submit" className="button button-primary" disabled={enviando}>
              {enviando ? "Guardando..." : "Confirmar préstamo"}
              {!enviando && <span aria-hidden="true">↗</span>}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
