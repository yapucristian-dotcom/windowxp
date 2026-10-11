import { Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly title = input('');
  protected readonly route = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected back(): void {
    this.location.back();
  }

  protected forward(): void {
    this.location.forward();
  }

  protected up(): void {
    const parts = this.router.url.split('?')[0].split('/').filter(Boolean);
    if (parts.length <= 2) {
      return;
    }
    parts.pop();
    void this.router.navigateByUrl(`/${parts.join('/')}`);
  }

  protected go(): void {
    void this.router.navigateByUrl(this.router.url.split('?')[0]);
  }
}
