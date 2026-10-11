import { Component, inject } from '@angular/core';
import { ShellService } from '../../core/services/shell.service';

@Component({
  selector: 'app-start-button',
  templateUrl: './start-button.html',
  styleUrl: './start-button.css',
})
export class StartButton {
  protected readonly shell = inject(ShellService);

  protected onClick(event: Event): void {
    event.stopPropagation();
    this.shell.toggleStartMenu();
  }
}
