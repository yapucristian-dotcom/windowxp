import { Injectable, signal } from '@angular/core';
import {
  Actividad,
  Aviso,
  Estadistica,
  Reporte,
  Usuario,
  UsuarioInput,
  UsuarioResultado,
} from '../models/plantilla.model';

const USUARIOS: Usuario[] = [
  { id: 1, usuario: 'mgarcia', nombre: 'María García', email: 'mgarcia@plantilla.local', activo: true },
  { id: 2, usuario: 'ltorres', nombre: 'Luis Torres', email: 'ltorres@plantilla.local', activo: true },
  { id: 3, usuario: 'aperez', nombre: 'Ana Pérez', email: 'aperez@plantilla.local', activo: false },
  { id: 4, usuario: 'rruiz', nombre: 'Rosa Ruiz', email: 'rruiz@plantilla.local', activo: true },
  { id: 5, usuario: 'jdiaz', nombre: 'José Díaz', email: 'jdiaz@plantilla.local', activo: true },
  { id: 6, usuario: 'cmolina', nombre: 'Carmen Molina', email: 'cmolina@plantilla.local', activo: true },
  { id: 7, usuario: 'fsoto', nombre: 'Francisco Soto', email: 'fsoto@plantilla.local', activo: false },
  { id: 8, usuario: 'vramos', nombre: 'Valeria Ramos', email: 'vramos@plantilla.local', activo: true },
  { id: 9, usuario: 'hleon', nombre: 'Hugo León', email: 'hleon@plantilla.local', activo: true },
  { id: 10, usuario: 'ncastro', nombre: 'Natalia Castro', email: 'ncastro@plantilla.local', activo: false },
];

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private readonly usuariosState = signal<Usuario[]>(USUARIOS.map((usuario) => ({ ...usuario })));
  private readonly actividadState = signal<Actividad[]>([
    { id: 1, hora: '08:12', texto: 'María García inició sesión.' },
    { id: 2, hora: '08:40', texto: 'Se generó el reporte semanal de accesos.' },
    { id: 3, hora: '09:05', texto: 'Ana Pérez quedó inactiva.' },
    { id: 4, hora: '09:26', texto: 'Luis Torres actualizó su correo.' },
    { id: 5, hora: '10:02', texto: 'Copia de seguridad completada.' },
  ]);

  readonly usuarios = this.usuariosState.asReadonly();
  readonly actividad = this.actividadState.asReadonly();
  readonly avisos = signal<readonly Aviso[]>([
    { id: 1, tipo: 'info', texto: 'La copia de seguridad se ejecuta cada noche.' },
    { id: 2, tipo: 'warning', texto: 'Hay cuentas inactivas pendientes de revisión.' },
    { id: 3, tipo: 'success', texto: 'El último acceso del administrador fue correcto.' },
  ]).asReadonly();
  readonly reportes = signal<readonly Reporte[]>([
    { id: 1, nombre: 'Usuarios del mes', fecha: '01/10/2026', estado: 'Listo' },
    { id: 2, nombre: 'Accesos semanales', fecha: '06/10/2026', estado: 'Listo' },
    { id: 3, nombre: 'Cuentas inactivas', fecha: '08/10/2026', estado: 'En proceso' },
  ]).asReadonly();
  readonly estadisticas = signal<readonly Estadistica[]>([
    { etiqueta: 'Almacenamiento', valor: 64 },
    { etiqueta: 'Tareas del sistema', valor: 38 },
  ]).asReadonly();

  registrar(texto: string): void {
    this.actividadState.update((items) => [
      { id: items.length + 1, hora: this.horaActual(), texto },
      ...items,
    ].slice(0, 8));
  }

  crear(input: UsuarioInput): UsuarioResultado {
    if (this.existe(input.usuario)) {
      return { ok: false, error: 'duplicado' };
    }
    const usuario: Usuario = { ...input, id: this.siguienteId() };
    this.usuariosState.update((items) => [usuario, ...items]);
    this.registrar(`Se creó el usuario ${usuario.usuario}.`);
    return { ok: true, usuario };
  }

  actualizar(id: number, input: UsuarioInput): UsuarioResultado {
    if (this.existe(input.usuario, id)) {
      return { ok: false, error: 'duplicado' };
    }
    let actualizado: Usuario | undefined;
    this.usuariosState.update((items) =>
      items.map((item) => {
        if (item.id !== id) {
          return item;
        }
        actualizado = { ...item, ...input };
        return actualizado;
      }),
    );
    if (!actualizado) {
      return { ok: false };
    }
    this.registrar(`Se actualizó el usuario ${actualizado.usuario}.`);
    return { ok: true, usuario: actualizado };
  }

  eliminar(id: number): boolean {
    const usuario = this.usuariosState().find((item) => item.id === id);
    if (!usuario) {
      return false;
    }
    this.usuariosState.update((items) => items.filter((item) => item.id !== id));
    this.registrar(`Se eliminó el usuario ${usuario.usuario}.`);
    return true;
  }

  cambiarEstado(id: number, activo: boolean): Usuario | null {
    const actual = this.usuariosState().find((item) => item.id === id);
    if (!actual) {
      return null;
    }
    const actualizado: Usuario = { ...actual, activo };
    this.usuariosState.update((items) => items.map((item) => (item.id === id ? actualizado : item)));
    this.registrar(activo ? `Se activó a ${actualizado.usuario}.` : `Se desactivó a ${actualizado.usuario}.`);
    return actualizado;
  }

  private existe(usuario: string, excepto?: number): boolean {
    const clave = usuario.trim().toLowerCase();
    return this.usuariosState().some(
      (item) => item.usuario.toLowerCase() === clave && item.id !== excepto,
    );
  }

  private siguienteId(): number {
    return this.usuariosState().reduce((max, item) => Math.max(max, item.id), 0) + 1;
  }

  private horaActual(): string {
    return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date());
  }
}
