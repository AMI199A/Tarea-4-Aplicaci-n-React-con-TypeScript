import type { Equipo, NuevoPrestamo, Prestamo } from "../types";

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3001").replace(
  /\/$/,
  "",
);

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  } catch {
    throw new Error(
      "No se pudo conectar con la API. Comprueba que el servidor esté iniciado.",
    );
  }

  if (!response.ok) {
    throw new Error(
      `La API respondió con un error (${response.status} ${response.statusText}).`,
    );
  }

  return response.json() as Promise<T>;
}

export function obtenerEquipos(): Promise<Equipo[]> {
  return request<Equipo[]>("/equipos");
}

export function obtenerPrestamosActivos(): Promise<Prestamo[]> {
  return request<Prestamo[]>("/prestamos?devuelto=false");
}

export function registrarPrestamo(prestamo: NuevoPrestamo): Promise<Prestamo> {
  return request<Prestamo>("/prestamos", {
    method: "POST",
    body: JSON.stringify(prestamo),
  });
}

export function actualizarEquipo(
  id: number,
  cambios: Partial<Equipo>,
): Promise<Equipo> {
  return request<Equipo>(`/equipos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(cambios),
  });
}

export function actualizarPrestamo(
  id: number,
  cambios: Partial<Prestamo>,
): Promise<Prestamo> {
  return request<Prestamo>(`/prestamos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(cambios),
  });
}
