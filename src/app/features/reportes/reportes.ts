import { Component } from '@angular/core';

@Component({
  selector: 'app-reportes',
  template: `
    <div class="xp-section">
      <fieldset>
        <legend>Reportes</legend>
        <p>No hay reportes generados.</p>
      </fieldset>
    </div>
  `,
  styles: ':host { display: block; }',
})
export class Reportes {}
