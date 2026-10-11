export interface Usuario {
  id: number;
  usuario: string;
  nombre: string;
  email: string;
  activo: boolean;
}

export interface UsuarioInput {
  usuario: string;
  nombre: string;
  email: string;
  activo: boolean;
}

export interface UsuarioResultado {
  ok: boolean;
  usuario?: Usuario;
  error?: 'duplicado';
}

export interface Actividad {
  id: number;
  hora: string;
  texto: string;
}

export interface Aviso {
  id: number;
  tipo: 'success' | 'info' | 'warning' | 'error';
  texto: string;
}

export interface Reporte {
  id: number;
  nombre: string;
  fecha: string;
  estado: string;
}

export interface Estadistica {
  etiqueta: string;
  valor: number;
}
