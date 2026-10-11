import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { API_LATENCY_MS, Sesion, XP_SESSION_KEY } from '../config/api.config';

const DEMO_USER = 'administrador';
const DEMO_PASSWORD = 'luna';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly latencyMs = inject(API_LATENCY_MS);
  readonly sesion = signal<Sesion | null>(this.leer());
  readonly authenticated = computed(() => this.sesion() !== null);

  login(username: string, password: string): Observable<boolean> {
    const accepted = username.trim().toLowerCase() === DEMO_USER && password === DEMO_PASSWORD;
    const result = of(accepted).pipe(
      tap((ok) => {
        if (ok) {
          this.guardar({ username: DEMO_USER, nombre: 'Administrador' });
        }
      }),
    );
    return this.latencyMs > 0 ? timer(this.latencyMs).pipe(switchMap(() => result)) : result;
  }

  logout(): void {
    sessionStorage.removeItem(XP_SESSION_KEY);
    this.sesion.set(null);
    void this.router.navigateByUrl('/login');
  }

  private guardar(sesion: Sesion): void {
    sessionStorage.setItem(XP_SESSION_KEY, JSON.stringify(sesion));
    this.sesion.set(sesion);
  }

  private leer(): Sesion | null {
    const raw = sessionStorage.getItem(XP_SESSION_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as Sesion;
      if (parsed.username && parsed.nombre) {
        return parsed;
      }
    } catch {
      sessionStorage.removeItem(XP_SESSION_KEY);
    }
    return null;
  }
}
