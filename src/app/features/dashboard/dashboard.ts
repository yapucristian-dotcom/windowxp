import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { ShellService } from '../../core/services/shell.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected readonly dashboard = inject(DashboardService);
  protected readonly auth = inject(AuthService);
  protected readonly shell = inject(ShellService);

  protected percent(part: number, total: number): number {
    if (total === 0) {
      return 0;
    }
    return Math.round((part / total) * 100);
  }
}
