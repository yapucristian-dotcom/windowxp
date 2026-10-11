import { Component, inject, signal } from '@angular/core';
import { SHELL_TASKS, START_MENU_LEFT, START_MENU_RIGHT } from '../../core/config/shell.config';
import { StartMenuEntry } from '../../core/models/shell.model';
import { AuthService } from '../../core/services/auth.service';
import { DialogService } from '../../core/services/dialog.service';
import { ShellService } from '../../core/services/shell.service';

@Component({
  selector: 'app-start-menu',
  templateUrl: './start-menu.html',
  styleUrl: './start-menu.css',
})
export class StartMenu {
  protected readonly shell = inject(ShellService);
  protected readonly auth = inject(AuthService);
  private readonly dialogs = inject(DialogService);
  protected readonly leftColumn = START_MENU_LEFT;
  protected readonly rightColumn = START_MENU_RIGHT;
  protected readonly programs = SHELL_TASKS;
  protected readonly programsOpen = signal(false);

  protected togglePrograms(event: Event): void {
    event.stopPropagation();
    this.programsOpen.update((open) => !open);
  }

  protected openProgram(id: string): void {
    this.programsOpen.set(false);
    this.shell.openTask(id);
  }

  protected onEntry(entry: StartMenuEntry): void {
    if (entry.taskId) {
      this.shell.openTask(entry.taskId);
      return;
    }
    this.shell.closeStartMenu();
  }

  protected logout(): void {
    this.shell.closeStartMenu();
    this.auth.logout();
  }

  protected async shutdown(): Promise<void> {
    this.shell.closeStartMenu();
    const accepted = await this.dialogs.confirm({
      title: 'Apagar el equipo',
      message: '¿Desea cerrar la sesión?',
    });
    if (accepted) {
      this.auth.logout();
    }
  }
}
