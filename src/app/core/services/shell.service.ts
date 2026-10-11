import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DESKTOP_ICONS, SHELL_TASKS } from '../config/shell.config';
import { ShellTask, WindowFrame, WindowPosition } from '../models/shell.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ShellService {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private layer = 8;
  private desktopHidden: readonly string[] | null = null;

  readonly startMenuOpen = signal(false);
  readonly selectedIconId = signal<string | null>(null);
  readonly currentPath = signal('');
  readonly tasks = signal<ShellTask[]>(SHELL_TASKS.map((task) => ({ ...task })));
  readonly now = signal(new Date());

  readonly openTasks = computed(() => this.tasks().filter((task) => task.open));
  readonly visibleWindows = computed(() =>
    this.tasks()
      .filter((task) => task.open && !task.minimized)
      .slice()
      .sort((left, right) => left.zIndex - right.zIndex),
  );
  readonly activeRoute = computed(
    () => this.tasks().find((task) => task.active && task.open && !task.minimized)?.route ?? null,
  );
  readonly activeVisible = computed(() => this.activeRoute() !== null);
  readonly timeLabel = computed(() =>
    new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(this.now()),
  );
  readonly dateLabel = computed(() => {
    const formatted = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(this.now());
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  });
  readonly isoTime = computed(() => this.now().toISOString());

  tickClock(): void {
    this.now.set(new Date());
  }

  toggleStartMenu(): void {
    this.startMenuOpen.update((open) => !open);
  }

  closeStartMenu(): void {
    this.startMenuOpen.set(false);
  }

  clearDesktop(): void {
    this.selectedIconId.set(null);
    this.closeStartMenu();
  }

  openFromDesktop(iconId: string): void {
    this.selectedIconId.set(iconId);
    const icon = DESKTOP_ICONS.find((item) => item.id === iconId);
    if (icon) {
      this.openTask(icon.taskId);
    }
  }

  openTask(id: string): void {
    this.tasks.update((tasks) => this.raise(id, tasks));
    this.closeStartMenu();
    this.goToActive();
  }

  focusWindow(id: string): void {
    const current = this.tasks().find((task) => task.id === id);
    if (current?.active && current.open && !current.minimized) {
      return;
    }
    this.tasks.update((tasks) => this.raise(id, tasks));
    this.goToActive();
  }

  followRoute(url: string): void {
    this.currentPath.set(url.split('?')[0]);
  }

  windowTitle(task: ShellTask): string {
    if (!(task.active && task.open && !task.minimized)) {
      return task.label;
    }
    const url = this.currentPath();
    if (!url || url === task.route || url.startsWith(`${task.route}/`)) {
      return task.label;
    }
    if (url.startsWith('/app/usuarios')) {
      return 'Usuarios';
    }
    if (url.startsWith('/app/reportes')) {
      return 'Reportes';
    }
    if (url.startsWith('/app/configuracion')) {
      return 'Configuración';
    }
    if (url.startsWith('/app/dashboard')) {
      return 'Dashboard';
    }
    return task.label;
  }

  activateTask(id: string): void {
    const current = this.tasks().find((task) => task.id === id);
    if (!current) {
      return;
    }
    if (current.active && !current.minimized) {
      this.minimizeWindow(id);
      return;
    }
    this.openTask(id);
  }

  showDesktop(): void {
    const tasks = this.tasks();
    const visible = tasks.filter((task) => task.open && !task.minimized);
    if (visible.length > 0) {
      this.desktopHidden = visible.map((task) => task.id);
      this.tasks.update((items) =>
        items.map((task) =>
          task.open && !task.minimized ? { ...task, minimized: true, active: false } : task,
        ),
      );
    } else {
      const ids = new Set(
        (this.desktopHidden ?? []).filter((id) => tasks.some((task) => task.id === id && task.open)),
      );
      this.desktopHidden = null;
      if (ids.size > 0) {
        this.tasks.update((items) =>
          this.activateTopmost(
            items.map((task) => (ids.has(task.id) ? { ...task, minimized: false } : task)),
          ),
        );
      }
    }
    this.closeStartMenu();
    this.goToActive();
  }

  minimizeWindow(id: string): void {
    this.tasks.update((tasks) => {
      const next = tasks.map((task) =>
        task.id === id ? { ...task, minimized: true, active: false } : task,
      );
      return this.activateTopmost(next);
    });
    this.goToActive();
  }

  toggleMaximize(id: string): void {
    const current = this.tasks().find((task) => task.id === id);
    const maximized = !(current?.maximized ?? false);
    this.tasks.update((tasks) =>
      this.raise(id, tasks).map((task) => (task.id === id ? { ...task, maximized } : task)),
    );
  }

  closeWindow(id: string): void {
    this.tasks.update((tasks) => {
      const next = tasks.map((task) =>
        task.id === id
          ? { ...task, open: false, minimized: false, active: false, maximized: false }
          : task,
      );
      return this.activateTopmost(next);
    });
    this.goToActive();
  }

  moveWindow(id: string, position: WindowPosition): void {
    this.tasks.update((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, x: position.x, y: position.y } : task)),
    );
  }

  resizeWindow(id: string, frame: WindowFrame): void {
    this.tasks.update((tasks) =>
      tasks.map((task) =>
        task.id === id
          ? { ...task, x: frame.x, y: frame.y, width: frame.width, height: frame.height }
          : task,
      ),
    );
  }

  private raise(id: string, tasks: ShellTask[]): ShellTask[] {
    if (!tasks.some((task) => task.id === id)) {
      return tasks;
    }
    this.layer += 1;
    if (this.layer > 16) {
      const ordered = tasks.slice().sort((left, right) => left.zIndex - right.zIndex);
      const zIndex = new Map(ordered.map((task, index) => [task.id, 6 + index]));
      tasks = tasks.map((task) => ({ ...task, zIndex: zIndex.get(task.id) ?? task.zIndex }));
      this.layer = 6 + tasks.length;
    }
    return tasks.map((task) => ({
      ...task,
      zIndex: task.id === id ? this.layer : task.zIndex,
      active: task.id === id,
      open: task.id === id ? true : task.open,
      minimized: task.id === id ? false : task.minimized,
    }));
  }

  private activateTopmost(tasks: ShellTask[]): ShellTask[] {
    const visible = tasks.filter((task) => task.open && !task.minimized);
    if (visible.length === 0) {
      return tasks.map((task) => ({ ...task, active: false }));
    }
    const topId = visible.reduce((best, task) => (task.zIndex > best.zIndex ? task : best)).id;
    return tasks.map((task) => ({ ...task, active: task.id === topId }));
  }

  private goToActive(): void {
    const current = this.router.url.split('?')[0];
    if (!this.auth.authenticated()) {
      if (current !== '/login') {
        void this.router.navigateByUrl('/login');
      }
      return;
    }
    const route = this.activeRoute();
    if (!route || current === route) {
      return;
    }
    void this.router.navigateByUrl(route);
  }
}
