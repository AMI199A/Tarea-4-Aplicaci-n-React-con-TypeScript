import { useState } from "react";
import type { Equipo, Prestamo } from "../types";

interface PrestamosActivosProps {
  prestamos: Prestamo[];
  equipos: Equipo[];
  cargando: boolean;
  error: string | null;
  devolviendoId: number | null;
  onDevolver: (prestamo: Prestamo) => void;
  onReintentar: () => void;
}

function fechaLocal(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function mostrarFecha(fecha: string): string {
  const valor = fecha.slice(0, 10);
  const [anio, mes, dia] = valor.split("-");
  return `${dia}/${mes}/${anio}`;
}

export function PrestamosActivos({
  prestamos,
  equipos,
  cargando,
  error,
  devolviendoId,
  onDevolver,
  onReintentar,
}: PrestamosActivosProps) {
  const [hoy] = useState(() => fechaLocal(new Date()));

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">SEGUIMIENTO DE EQUIPO</span>
          <h1>Préstamos activos</h1>
          <p>Controla las fechas y registra las devoluciones.</p>
        </div>
        <span className="inventory-count">
          <strong>{prestamos.length.toString().padStart(2, "0")}</strong>
          <span> préstamos activos</span>
        </span>
      </div>

      <section className="loans-panel" aria-label="Tabla de préstamos activos">
        <div className="table-caption">
          <div>
            <h2>Registro de préstamos</h2>
            <p>Los préstamos vencidos se resaltan automáticamente.</p>
          </div>
          <span className="table-live">
            <span className="availability-dot" /> EN VIVO
          </span>
        </div>

        {cargando ? (
          <div className="loading-state" role="status">
            <span className="spinner" />
            <span>Cargando préstamos...</span>
          </div>
        ) : error ? (
          <div className="error-state" role="alert">
            <span className="error-symbol">!</span>
            <div>
              <h2>No se pudieron cargar los préstamos</h2>
              <p>{error}</p>
              <button
                type="button"
                className="button button-primary"
                onClick={onReintentar}
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : prestamos.length === 0 ? (
          <div className="empty-state">
            <span aria-hidden="true">✓</span>
            <h3>Todo al día</h3>
            <p>No hay préstamos activos en este momento.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Solicitante</th>
                  <th>Carné</th>
                  <th>Fecha límite</th>
                  <th>Estado</th>
                  <th><span className="sr-only">Acción</span></th>
                </tr>
              </thead>
              <tbody>
                {prestamos.map((prestamo) => {
                  const equipo = equipos.find(
                    (item) => item.id === prestamo.equipoId,
                  );
                  const vencido = prestamo.fechaLimite.slice(0, 10) < hoy;

                  return (
                    <tr
                      key={prestamo.id}
                      className={vencido ? "loan-row overdue-row" : "loan-row"}
                    >
                      <td>
                        <div className="table-equipment">
                          <span className="table-equipment-icon" aria-hidden="true">
                            ◇
                          </span>
                          <span>
                            <strong>{equipo?.nombre ?? "Equipo no encontrado"}</strong>
                            <small>{equipo?.categoria ?? "Sin categoría"}</small>
                          </span>
                        </div>
                      </td>
                      <td className="borrower-name">{prestamo.solicitante}</td>
                      <td className="borrower-id">{prestamo.carne}</td>
                      <td className={vencido ? "due-date due-date-overdue" : "due-date"}>
                        {mostrarFecha(prestamo.fechaLimite)}
                      </td>
                      <td>
                        <span
                          className={`badge ${vencido ? "badge-overdue" : "badge-current"}`}
                        >
                          <span className="badge-dot" />
                          {vencido ? "Vencido" : "En curso"}
                        </span>
                      </td>
                      <td className="return-cell">
                        <button
                          type="button"
                          className="button button-return"
                          disabled={devolviendoId !== null}
                          onClick={() => onDevolver(prestamo)}
                        >
                          {devolviendoId === prestamo.id
                            ? "Devolviendo..."
                            : "Devolver"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
