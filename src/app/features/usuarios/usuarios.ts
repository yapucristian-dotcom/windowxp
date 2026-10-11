import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { startWith } from 'rxjs';
import { Usuario } from '../../core/models/plantilla.model';
import { DialogService } from '../../core/services/dialog.service';
import { NotificationService } from '../../core/services/notification.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { XpButton } from '../../shared/components/xp-button/xp-button';
import { XpLoading } from '../../shared/components/xp-loading/xp-loading';
import { XpTable } from '../../shared/components/xp-table/xp-table';

@Component({
  selector: 'app-usuarios',
  imports: [ReactiveFormsModule, RouterLink, XpButton, XpLoading, XpTable],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios {
  private readonly destroyRef = inject(DestroyRef);
  private readonly usuariosService = inject(UsuarioService);
  private readonly dialogs = inject(DialogService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly pageSize = 5;

  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly query = toSignal(this.search.valueChanges.pipe(startWith('')), { initialValue: '' });
  protected readonly busy = signal(false);
  protected readonly selectedId = signal<number | null>(null);
  private readonly page = signal(0);

  protected readonly filtered = computed(() => {
    const term = this.query().trim().toLowerCase();
    return this.usuariosService.usuarios().filter((usuario) => {
      if (!term) {
        return true;
      }
      return (
        usuario.usuario.toLowerCase().includes(term) ||
        usuario.nombre.toLowerCase().includes(term) ||
        usuario.email.toLowerCase().includes(term)
      );
    });
  });
  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  protected readonly currentPage = computed(() => Math.min(this.page(), this.pageCount() - 1));
  protected readonly pageItems = computed(() => {
    const start = this.currentPage() * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  constructor() {
    this.search.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.page.set(0));
  }

  protected rangeLabel(): string {
    const total = this.filtered().length;
    if (total === 0) {
      return '0 usuarios';
    }
    const start = this.currentPage() * this.pageSize + 1;
    const end = Math.min(total, start + this.pageSize - 1);
    return `${start}–${end} de ${total}`;
  }

  protected previous(): void {
    this.page.set(Math.max(0, this.currentPage() - 1));
  }

  protected next(): void {
    this.page.set(Math.min(this.pageCount() - 1, this.currentPage() + 1));
  }

  protected edit(usuario: Usuario): void {
    void this.router.navigate(['/app/usuarios/editar', usuario.id]);
  }

  protected async remove(usuario: Usuario): Promise<void> {
    const accepted = await this.dialogs.confirm({
      title: 'Confirmar eliminación',
      message: `¿Desea eliminar a ${usuario.nombre}?`,
    });
    if (!accepted) {
      return;
    }
    this.busy.set(true);
    this.usuariosService
      .eliminar(usuario.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((removed) => {
      this.busy.set(false);
      this.notifications.show(removed ? 'success' : 'error', removed ? 'Usuario eliminado.' : 'No se pudo eliminar.');
    });
  }

  protected toggle(usuario: Usuario): void {
    this.busy.set(true);
    this.usuariosService
      .cambiarEstado(usuario.id, !usuario.activo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => {
      this.busy.set(false);
      if (!updated) {
        this.notifications.show('error', 'No se pudo cambiar el estado.');
        return;
      }
      this.notifications.show('success', updated.activo ? 'Usuario activado.' : 'Usuario desactivado.');
    });
  }
}
