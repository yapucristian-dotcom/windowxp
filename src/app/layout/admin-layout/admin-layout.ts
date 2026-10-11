import { Component, HostListener, inject, input, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { ShellService } from '../../core/services/shell.service';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

interface MenuItem {
  id: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, Sidebar, Topbar],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  private readonly shell = inject(ShellService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  readonly title = input('');
  readonly taskId = input.required<string>();
  readonly interactive = input(true);
  protected readonly openMenu = signal<string | null>(null);
  protected readonly menus: readonly { id: string; label: string; items: readonly MenuItem[] }[] = [
    { id: 'archivo', label: 'Archivo', items: [{ id: 'cerrar', label: 'Cerrar' }] },
    {
      id: 'edicion',
      label: 'Edición',
      items: [
        { id: 'cortar', label: 'Cortar', disabled: true },
        { id: 'copiar', label: 'Copiar', disabled: true },
        { id: 'pegar', label: 'Pegar', disabled: true },
      ],
    },
    { id: 'ver', label: 'Ver', items: [{ id: 'actualizar', label: 'Actualizar' }] },
    {
      id: 'favoritos',
      label: 'Favoritos',
      items: [
        { id: 'inicio', label: 'Inicio' },
        { id: 'usuarios', label: 'Usuarios' },
        { id: 'reportes', label: 'Reportes' },
      ],
    },
    { id: 'herramientas', label: 'Herramientas', items: [{ id: 'configuracion', label: 'Configuración' }] },
    { id: 'ayuda', label: 'Ayuda', items: [{ id: 'acerca', label: 'Acerca de Plantilla XP' }] },
  ];

  @HostListener('document:click')
  protected closeMenus(): void {
    this.openMenu.set(null);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.openMenu.set(null);
  }

  protected toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.openMenu.update((current) => (current === id ? null : id));
  }

  protected hoverMenu(id: string): void {
    if (this.openMenu()) {
      this.openMenu.set(id);
    }
  }

  protected run(id: string, event: Event): void {
    event.stopPropagation();
    this.openMenu.set(null);
    switch (id) {
      case 'cerrar':
        this.shell.closeWindow(this.taskId());
        break;
      case 'actualizar':
        void this.router.navigateByUrl(this.router.url);
        break;
      case 'inicio':
        void this.router.navigateByUrl('/app/dashboard');
        break;
      case 'usuarios':
        void this.router.navigateByUrl('/app/usuarios');
        break;
      case 'reportes':
        void this.router.navigateByUrl('/app/reportes');
        break;
      case 'configuracion':
        void this.router.navigateByUrl('/app/configuracion');
        break;
      case 'acerca':
        this.notifications.show('info', 'Plantilla XP · Tema Luna.');
        break;
      default:
        break;
    }
  }
}
