import { Injectable, computed, inject } from '@angular/core';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly data = inject(MockDataService);

  readonly actividad = this.data.actividad;
  readonly avisos = this.data.avisos;
  readonly estadisticas = this.data.estadisticas;
  readonly resumen = computed(() => {
    const usuarios = this.data.usuarios();
    const activos = usuarios.filter((usuario) => usuario.activo).length;
    return {
      total: usuarios.length,
      activos,
      inactivos: usuarios.length - activos,
    };
  });
}
