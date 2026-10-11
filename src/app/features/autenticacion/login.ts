import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { XpButton } from '../../shared/components/xp-button/xp-button';
import { XpLoading } from '../../shared/components/xp-loading/xp-loading';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, XpButton, XpLoading],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly usuarioInput = viewChild<ElementRef<HTMLInputElement>>('usuario');

  protected readonly submitting = signal(false);
  protected readonly authError = signal(false);
  protected readonly form = new FormGroup({
    usuario: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    clave: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4)],
    }),
  });

  constructor() {
    afterNextRender(() => this.usuarioInput()?.nativeElement.focus());
  }

  protected invalid(name: 'usuario' | 'clave'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.authError());
  }

  protected message(name: 'usuario' | 'clave'): string {
    const errors = this.form.controls[name].errors;
    if (errors?.['required']) {
      return 'Este campo es obligatorio.';
    }
    if (errors?.['minlength']) {
      return 'Mínimo 4 caracteres.';
    }
    return '';
  }

  protected submit(): void {
    this.authError.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }
    this.submitting.set(true);
    this.form.disable();
    const { usuario, clave } = this.form.getRawValue();
    this.auth.login(usuario, clave).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((accepted) => {
      this.submitting.set(false);
      this.form.enable();
      if (!accepted) {
        this.authError.set(true);
        return;
      }
      void this.router.navigateByUrl('/app/dashboard');
    });
  }

  private focusFirstInvalid(): void {
    const invalid = document.querySelector<HTMLElement>('.xp-logon input.ng-invalid');
    invalid?.focus();
  }
}
