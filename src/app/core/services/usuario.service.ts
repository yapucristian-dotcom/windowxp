import { Injectable, inject } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_LATENCY_MS } from '../config/api.config';
import { Usuario, UsuarioInput, UsuarioResultado } from '../models/plantilla.model';
import { MockDataService } from './mock-data.service';

/**
 * Fachada de usuarios. Hoy lee el almacén simulado; más adelante estas
 * operaciones pueden delegar en HttpClient sin tocar los componentes.
 */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly data = inject(MockDataService);
  private readonly latencyMs = inject(API_LATENCY_MS);

  readonly usuarios = this.data.usuarios;

  obtener(id: number): Observable<Usuario | null> {
    return this.later(() => this.data.usuarios().find((item) => item.id === id) ?? null);
  }

  crear(input: UsuarioInput): Observable<UsuarioResultado> {
    return this.later(() => this.data.crear(input));
  }

  actualizar(id: number, input: UsuarioInput): Observable<UsuarioResultado> {
    return this.later(() => this.data.actualizar(id, input));
  }

  eliminar(id: number): Observable<boolean> {
    return this.later(() => this.data.eliminar(id));
  }

  cambiarEstado(id: number, activo: boolean): Observable<Usuario | null> {
    return this.later(() => this.data.cambiarEstado(id, activo));
  }

  private later<T>(read: () => T): Observable<T> {
    return this.latencyMs > 0 ? timer(this.latencyMs).pipe(map(() => read())) : of(read());
  }
}
