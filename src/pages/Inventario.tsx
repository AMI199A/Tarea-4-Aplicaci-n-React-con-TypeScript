import { useMemo, useState } from "react";
import type { Equipo } from "../types";
import { ListaEquipos } from "../components/ListaEquipos";

interface InventarioProps {
  equipos: Equipo[];
  cargando: boolean;
  error: string | null;
  onPrestar: (id: number) => void;
  onReintentar: () => void;
}

export function Inventario({
  equipos,
  cargando,
  error,
  onPrestar,
  onReintentar,
}: InventarioProps) {
  const [categoria, setCategoria] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const categorias = useMemo(
    () => [...new Set(equipos.map((equipo) => equipo.categoria))].sort(),
    [equipos],
  );
  const equiposFiltrados = useMemo(
    () =>
      equipos.filter((equipo) => {
        const coincideCategoria =
          categoria === "Todas" || equipo.categoria === categoria;
        const coincideNombre = equipo.nombre
          .toLocaleLowerCase()
          .includes(busqueda.trim().toLocaleLowerCase());
        return coincideCategoria && coincideNombre;
      }),
    [busqueda, categoria, equipos],
  );

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">RECURSOS DEL LABORATORIO</span>
          <h1>Inventario</h1>
          <p>Explora y solicita el equipo que necesitas.</p>
        </div>
        <span className="inventory-count">
          <strong>{equiposFiltrados.length.toString().padStart(2, "0")}</strong>
          <span> equipos mostrados</span>
        </span>
      </div>

      <section className="inventory-panel" aria-label="Inventario de equipo">
        <div className="filter-toolbar">
          <label className="search-field" htmlFor="buscar-equipo">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="8.8" cy="8.8" r="5.8" />
              <path d="m13.2 13.2 4 4" />
            </svg>
            <input
              id="buscar-equipo"
              type="search"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
            <span className="search-shortcut">⌕</span>
          </label>
          <label className="category-filter" htmlFor="filtrar-categoria">
            Categoría
            <select
              id="filtrar-categoria"
              value={categoria}
              onChange={(evento) => setCategoria(evento.target.value)}
            >
              <option value="Todas">Todas las categorías</option>
              {categorias.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        {cargando ? (
          <div className="loading-state" role="status">
            <span className="spinner" />
            <span>Cargando inventario...</span>
          </div>
        ) : error ? (
          <div className="error-state" role="alert">
            <span className="error-symbol">!</span>
            <div>
              <h2>No se pudo cargar el inventario</h2>
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
        ) : (
          <ListaEquipos equipos={equiposFiltrados} onPrestar={onPrestar} />
        )}
      </section>

      <p className="policy-note">
        <span aria-hidden="true">ⓘ</span> Los préstamos tienen un plazo máximo
        de 3 días.
      </p>
    </main>
  );
}
