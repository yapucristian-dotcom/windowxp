import { Component, DestroyRef, ElementRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioInput } from '../../core/models/plantilla.model';
import { NotificationService } from '../../core/services/notification.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { XpButton } from '../../shared/components/xp-button/xp-button';
import { XpLoading } from '../../shared/components/xp-loading/xp-loading';

@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule, XpButton, XpLoading],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.css',
})
export class UsuarioForm implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly usuariosService = inject(UsuarioService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly host = inject(ElementRef<HTMLElement>);
  private userId: number | null = null;

  protected readonly editing = signal(false);
  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly form = new FormGroup({
    usuario: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9._-]+$/)],
    }),
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    estado: new FormControl<'activo' | 'inactivo'>('activo', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    this.form.controls.usuario.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      const errors = this.form.controls.usuario.errors;
      if (errors?.['duplicado']) {
        const next = { ...errors };
        delete next['duplicado'];
        this.form.controls.usuario.setErrors(Object.keys(next).length ? next : null);
      }
    });
  }

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    if (rawId === null) {
      return;
    }
    const id = Number(rawId);
    if (!Number.isInteger(id) || id <= 0) {
      this.notifications.show('error', 'No se encontró el usuario.');
      void this.router.navigateByUrl('/app/usuarios');
      return;
    }
    this.editing.set(true);
    this.loading.set(true);
    this.usuariosService
      .obtener(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((usuario) => {
      this.loading.set(false);
      if (!usuario) {
        this.notifications.show('error', 'No se encontró el usuario.');
        void this.router.navigateByUrl('/app/usuarios');
        return;
      }
      this.userId = usuario.id;
      this.form.setValue({
        usuario: usuario.usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        estado: usuario.activo ? 'activo' : 'inactivo',
      });
    });
  }

  protected invalid(name: 'usuario' | 'nombre' | 'email' | 'estado'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected message(name: 'usuario' | 'nombre' | 'email' | 'estado'): string {
    const errors = this.form.controls[name].errors;
    if (!errors) {
      return '';
    }
    if (errors['required']) {
      return 'Este campo es obligatorio.';
    }
    if (errors['email']) {
      return 'Escriba un correo válido.';
    }
    if (errors['minlength']) {
      return 'Mínimo 3 caracteres.';
    }
    if (errors['pattern']) {
      return 'Use letras, números, punto o guion.';
    }
    if (errors['duplicado']) {
      return 'Ese usuario ya existe.';
    }
    return '';
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }
    const value = this.form.getRawValue();
    const input: UsuarioInput = {
      usuario: value.usuario.trim(),
      nombre: value.nombre.trim(),
      email: value.email.trim(),
      activo: value.estado === 'activo',
    };
    this.submitting.set(true);
    this.form.disable();
    const request =
      this.userId === null
        ? this.usuariosService.crear(input)
        : this.usuariosService.actualizar(this.userId, input);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      this.submitting.set(false);
      this.form.enable();
      if (!result.ok && result.error === 'duplicado') {
        this.form.controls.usuario.setErrors({ duplicado: true });
        this.focusFirstInvalid();
        return;
      }
      if (!result.ok) {
        this.notifications.show('error', 'No se pudo guardar el usuario.');
        return;
      }
      this.notifications.show('success', this.userId === null ? 'Usuario creado.' : 'Usuario actualizado.');
      void this.router.navigateByUrl('/app/usuarios');
    });
  }

  protected cancel(): void {
    void this.router.navigateByUrl('/app/usuarios');
  }

  private focusFirstInvalid(): void {
    const invalid = this.host.nativeElement.querySelector(
      'input.ng-invalid, select.ng-invalid',
    ) as HTMLElement | null;
    invalid?.focus();
  }
}
