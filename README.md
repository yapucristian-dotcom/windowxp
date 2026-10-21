### Window XP Admin Dashboard (Angular 22)

Un panel de administración con estética Windows XP: escritorio, barra de tareas, botón Inicio, ventanas flotantes y CRUD de usuarios con datos simulados. Ideal como plantilla para apps internas con look & feel nostálgico.

- Funciones principales:
  - Escritorio XP, barra de tareas y menú Inicio
  - Ventanas con foco y control de estado
  - Módulo de Usuarios: listar, crear, editar, activar/desactivar y eliminar
  - Datos simulados (MockDataService) para desarrollo rápido
  - Routing basado en `app.routes.ts` y servicios en `core/services`
  - Pruebas unitarias con `Vitest`

### Requisitos

- Node >= 22.22 (Angular 22 no compila en Node 20)
- npm

Sugerencia:

```bash
nvm use
```

El proyecto declara `engines` y `.nvmrc` para alinear versiones.

### Instalación

```bash
npm ci
```

### Desarrollo

```bash
npm start
# o
ng serve
```

Abrir `http://localhost:4200/`.

### Build de producción

```bash
npm run build
# artefactos en dist/
```

### Pruebas

```bash
npm test
# equivalente a: ng test
```

### Credenciales de DEMO

- Usuario: `administrador`
- Clave: `luna`

Estas credenciales son SOLO de demostración. No usarlas en entornos reales.

### Estructura de carpetas (resumen)

- `src/app/core`: servicios compartidos (auth, notificaciones, mock de datos, etc.)
- `src/app/layout`: escritorio XP, barra de tareas, botón Inicio, menú Inicio
- `src/app/shared`: componentes UI reutilizables
- `src/app/features`: funcionalidades de negocio (por ejemplo, `usuarios`)

### Datos simulados y cómo cambiarlos por una API real

Actualmente los servicios de la app leen y escriben sobre un almacén en memoria:

- `src/app/core/services/mock-data.service.ts` (fuente de datos simulada)
- `src/app/core/services/usuario.service.ts` y `src/app/core/services/dashboard.service.ts` inyectan `MockDataService`

Para conectarte a una API real usando `HttpClient`:

1) Asegúrate de que `HttpClient` esté habilitado (ya se hace en `app.config.ts` vía `provideHttpClient()`).
2) En `usuario.service.ts` reemplaza la dependencia de `MockDataService` por `HttpClient` e implementa los métodos (`crear`, `actualizar`, `eliminar`, `cambiarEstado`, etc.) llamando a tus endpoints (por ejemplo, `POST /api/usuarios`, `PUT /api/usuarios/:id`, `DELETE /api/usuarios/:id`).
3) En `dashboard.service.ts`, en lugar de leer del mock, solicita los datos agregados a tu backend (por ejemplo, `GET /api/dashboard`).
4) Maneja errores con `catchError` y muestra notificaciones utilizando `NotificationService` si corresponde.

Ejemplo mínimo del paso 2 (fragmento conceptual):

```ts
// usuario.service.ts
import { HttpClient } from '@angular/common/http';
// ...
private readonly http = inject(HttpClient);

crear(input: CrearUsuarioInput) {
  return this.http.post<Usuario>('/api/usuarios', input);
}
```

No es necesario modificar componentes: la interfaz del servicio puede mantenerse estable.

### Licencia

MIT (o la que corresponda a tu proyecto).

