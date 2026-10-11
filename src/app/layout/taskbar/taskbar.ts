import { Component, DestroyRef, inject } from '@angular/core';
import { QUICK_LAUNCH } from '../../core/config/shell.config';
import { ShellService } from '../../core/services/shell.service';
import { StartButton } from '../start-button/start-button';

@Component({
  selector: 'app-taskbar',
  imports: [StartButton],
  templateUrl: './taskbar.html',
  styleUrl: './taskbar.css',
})
export class Taskbar {
  protected readonly shell = inject(ShellService);
  protected readonly quickLaunch = QUICK_LAUNCH;

  constructor() {
    this.shell.tickClock();
    const timerId = window.setInterval(() => this.shell.tickClock(), 1000);
    inject(DestroyRef).onDestroy(() => window.clearInterval(timerId));
  }
}
