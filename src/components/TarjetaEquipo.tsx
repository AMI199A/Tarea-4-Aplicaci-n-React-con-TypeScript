import type { Equipo } from "../types";

export interface TarjetaEquipoProps {
  equipo: Equipo;
  onPrestar: (id: number) => void;
}

const iconos: Record<string, string> = {
  Laptop: "▱",
  Proyector: "▣",
  Router: "⌁",
};

export function TarjetaEquipo({ equipo, onPrestar }: TarjetaEquipoProps) {
  return (
    <article className="equipment-card">
      <div className="equipment-card-top">
        <span className="equipment-icon" aria-hidden="true">
          {iconos[equipo.categoria] ?? "◇"}
        </span>
        <span
          className={`badge ${equipo.disponible ? "badge-available" : "badge-loaned"}`}
        >
          <span className="badge-dot" />
          {equipo.disponible ? "Disponible" : "Prestado"}
        </span>
      </div>
      <div className="equipment-details">
        <span className="equipment-category">{equipo.categoria}</span>
        <h3>{equipo.nombre}</h3>
        <span className="equipment-id">EQ-{String(equipo.id).padStart(3, "0")}</span>
      </div>
      <button
        className="button button-card"
        type="button"
        disabled={!equipo.disponible}
        onClick={() => onPrestar(equipo.id)}
      >
        Prestar <span aria-hidden="true">↗</span>
      </button>
    </article>
  );
}
