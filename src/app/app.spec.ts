import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { API_LATENCY_MS, XP_SESSION_KEY } from './core/config/api.config';
import { NotificationService } from './core/services/notification.service';

function seedSession(): void {
  sessionStorage.setItem(
    XP_SESSION_KEY,
    JSON.stringify({ username: 'administrador', nombre: 'Administrador' }),
  );
}

async function createApp(): Promise<ComponentFixture<App>> {
  const fixture = TestBed.createComponent(App);
  TestBed.inject(Router).initialNavigation();
  await fixture.whenStable();
  return fixture;
}

describe('App', () => {
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    seedSession();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        { provide: API_LATENCY_MS, useValue: 0 },
      ],
    }).compileComponents();

    fixture = await createApp();
  });

  afterEach(() => {
    TestBed.inject(NotificationService).clear();
    sessionStorage.removeItem(XP_SESSION_KEY);
    fixture.destroy();
  });

  it('should create the app', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the XP desktop shell', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.xp-start-button')?.textContent).toContain('Inicio');
    expect(compiled.querySelector('.xp-taskbar')).toBeTruthy();
    expect(compiled.textContent).toContain('Mi sistema');
    expect(compiled.querySelector('.title-bar-text')?.textContent).toContain('Dashboard');
    expect(compiled.textContent).toContain('Tareas del sistema');
    expect(compiled.textContent).toContain('María García inició sesión.');
  });

  it('should open a section from the sidebar', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const link = [...compiled.querySelectorAll('a')].find((item) =>
      item.textContent?.includes('Configuración'),
    ) as HTMLAnchorElement;
    link.click();
    await fixture.whenStable();
    expect(compiled.textContent).toContain('Apariencia');
  });

  it('should close the active window', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const closeButton = compiled.querySelector('.xp-caption-close') as HTMLButtonElement;
    closeButton.click();
    await fixture.whenStable();
    expect(compiled.querySelector('.title-bar-text')?.textContent ?? '').not.toContain('Dashboard');
  });

  it('should open the start menu', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.xp-start-button') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    expect(compiled.querySelector('.xp-start-menu')).toBeTruthy();
    expect(compiled.textContent).toContain('Administrador');
    expect(compiled.textContent).toContain('Cerrar sesión');
  });

  it('should list, create and delete a user', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const link = [...compiled.querySelectorAll('a')].find((item) => item.textContent?.trim() === 'Usuarios') as
      | HTMLAnchorElement
      | undefined;
    const windowsBefore = compiled.querySelectorAll('app-xp-window').length;
    link?.click();
    await fixture.whenStable();
    expect(compiled.querySelectorAll('app-xp-window').length).toBe(windowsBefore);
    expect(compiled.textContent).toContain('María García');
    expect(compiled.textContent).not.toContain('Carmen Molina');

    const create = [...compiled.querySelectorAll('button')].find((item) =>
      item.textContent?.includes('Nuevo usuario'),
    ) as HTMLButtonElement;
    create.click();
    await fixture.whenStable();

    setControl(compiled, 'usuario', 'prueba');
    setControl(compiled, 'nombre', 'Usuario Prueba');
    setControl(compiled, 'email', 'prueba@plantilla.local');
    submitForm(compiled);
    await fixture.whenStable();

    expect(compiled.textContent).toContain('Usuario creado.');

    const search = compiled.querySelector('input[type="search"]') as HTMLInputElement;
    search.value = 'Prueba';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(compiled.textContent).toContain('Usuario Prueba');

    const remove = [...compiled.querySelectorAll('button')].find((item) => {
      const row = item.closest('tr');
      return row?.textContent?.includes('Usuario Prueba') && item.textContent?.includes('Eliminar');
    }) as HTMLButtonElement;
    remove.click();
    await fixture.whenStable();
    const accept = [...compiled.querySelectorAll('button')].find((item) => item.textContent?.trim() === 'Sí') as
      | HTMLButtonElement
      | undefined;
    accept?.click();
    await fixture.whenStable();
    expect(compiled.textContent).toContain('Usuario eliminado.');
    expect(compiled.textContent).not.toContain('Usuario Prueba');
  });
});

describe('App login', () => {
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    sessionStorage.removeItem(XP_SESSION_KEY);
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        { provide: API_LATENCY_MS, useValue: 0 },
      ],
    }).compileComponents();

    fixture = await createApp();
  });

  afterEach(() => {
    TestBed.inject(NotificationService).clear();
    sessionStorage.removeItem(XP_SESSION_KEY);
    fixture.destroy();
  });

  it('should ask for the demo account and reject a wrong password', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Inicio de sesión');
    expect(compiled.textContent).toContain('administrador');
    expect(compiled.textContent).toContain('luna');
    expect(compiled.querySelector('.title-bar-text')?.textContent ?? '').not.toContain('Dashboard');

    setControl(compiled, 'usuario', 'administrador');
    setControl(compiled, 'clave', 'mala');
    submitForm(compiled);
    await fixture.whenStable();
    expect(compiled.textContent).toContain('no son correctos');

    setControl(compiled, 'clave', 'luna');
    submitForm(compiled);
    await fixture.whenStable();
    expect(compiled.querySelector('.title-bar-text')?.textContent).toContain('Dashboard');
    expect(compiled.textContent).toContain('Activos');
  });
});

function setControl(root: HTMLElement, name: string, value: string): void {
  const input = root.querySelector(`[name="${name}"]`) as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function submitForm(root: HTMLElement): void {
  const button = root.querySelector('button[type="submit"]') as HTMLButtonElement;
  button.click();
}
