import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SIDEBAR_GROUPS } from '../../core/config/shell.config';
import { SidebarLink } from '../../core/models/shell.model';
import { ShellService } from '../../core/services/shell.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly shell = inject(ShellService);
  protected readonly groups = SIDEBAR_GROUPS;
  protected readonly collapsed = signal<Readonly<Record<string, boolean>>>({});

  protected toggle(id: string): void {
    this.collapsed.update((state) => ({ ...state, [id]: !state[id] }));
  }

  protected open(link: SidebarLink): void {
    if (link.taskId) {
      this.shell.openTask(link.taskId);
    }
  }
}
