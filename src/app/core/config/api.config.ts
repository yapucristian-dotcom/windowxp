import { InjectionToken } from '@angular/core';

export const API_LATENCY_MS = new InjectionToken<number>('API_LATENCY_MS', {
  factory: () => 280,
});

export const XP_SESSION_KEY = 'xp-session';

export interface Sesion {
  username: string;
  nombre: string;
}
