interface EncabezadoProps {
  titulo: string;
  disponibles: number;
  total: number;
  prestamosVencidos: number;
}

export function Encabezado({
  titulo,
  disponibles,
  total,
  prestamosVencidos,
}: EncabezadoProps) {
  return (
    <header className="app-header">
      <a className="brand" href="#inicio" aria-label="Ir al inicio">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <path
              d="M6 10.5 16 5l10 5.5v11L16 27 6 21.5v-11Z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="m6.5 10.8 9.5 5.4 9.5-5.4M16 16.5V27M11 8l10 5.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="brand-copy">
          <strong>LAB<span> / </span>CONTROL</strong>
          <span>Centro universitario</span>
        </span>
      </a>

      <div className="header-summary">
        <span className="header-title">{titulo}</span>
        <span className="availability">
          <span className="availability-dot" />
          <strong>{disponibles}</strong> de {total} equipos disponibles
        </span>
        <span className="overdue-summary">
          <span aria-hidden="true">◷</span> {prestamosVencidos} vencidos
        </span>
      </div>

      <div className="header-status">
        <span className="status-pulse" />
        Gestión de laboratorio
      </div>
    </header>
  );
}
