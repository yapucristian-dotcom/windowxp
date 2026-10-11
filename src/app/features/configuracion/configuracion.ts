import { Component } from '@angular/core';

@Component({
  selector: 'app-configuracion',
  template: `
    <div class="xp-section">
      <fieldset>
        <legend>Apariencia</legend>
        <p><strong>Tema:</strong> Windows XP Luna</p>
        <p><strong>Fondo:</strong> paisaje del escritorio</p>
      </fieldset>
    </div>
  `,
  styles: ':host { display: block; }',
})
export class Configuracion {}
