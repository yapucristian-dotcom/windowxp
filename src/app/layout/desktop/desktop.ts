import { Component, HostListener, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DESKTOP_ICONS } from '../../core/config/shell.config';
import { AuthService } from '../../core/services/auth.service';
import { DialogService } from '../../core/services/dialog.service';
import { ShellService } from '../../core/services/shell.service';
import { XpDialog } from '../../shared/components/xp-dialog/xp-dialog';
import { XpNotificationHost } from '../../shared/components/xp-notification/xp-notification';
import { XpWindow } from '../../shared/components/xp-window/xp-window';
import { AdminLayout } from '../admin-layout/admin-layout';
import { StartMenu } from '../start-menu/start-menu';
import { Taskbar } from '../taskbar/taskbar';

@Component({
  selector: 'app-desktop',
  imports: [Taskbar, StartMenu, XpWindow, AdminLayout, RouterOutlet, XpDialog, XpNotificationHost],
  templateUrl: './desktop.html',
  styleUrl: './desktop.css',
})
export class Desktop {
  protected readonly shell = inject(ShellService);
  protected readonly auth = inject(AuthService);
  protected readonly dialogs = inject(DialogService);
  protected readonly icons = DESKTOP_ICONS;
  private readonly router = inject(Router);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.shell.followRoute(event.urlAfterRedirects.split('?')[0]);
      });
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.dialogs.current()) {
      this.dialogs.dismiss();
      return;
    }
    this.shell.closeStartMenu();
  }
}
