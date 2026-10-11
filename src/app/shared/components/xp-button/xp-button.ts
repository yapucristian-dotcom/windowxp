import { Component, input } from '@angular/core';

@Component({
  selector: 'app-xp-button',
  templateUrl: './xp-button.html',
  styleUrl: './xp-button.css',
})
export class XpButton {
  readonly disabled = input(false);
  readonly isDefault = input(false);
  readonly compact = input(false);
  readonly type = input<'button' | 'submit'>('button');
}
