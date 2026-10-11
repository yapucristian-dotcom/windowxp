import { Component, input, output } from '@angular/core';
import { XpButton } from '../xp-button/xp-button';

@Component({
  selector: 'app-xp-dialog',
  imports: [XpButton],
  templateUrl: './xp-dialog.html',
  styleUrl: './xp-dialog.css',
})
export class XpDialog {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input('Sí');
  readonly cancelLabel = input('No');
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected stop(event: Event): void {
    event.stopPropagation();
  }
}
