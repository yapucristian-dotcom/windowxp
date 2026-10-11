import { DesktopIcon, ShellTask, SidebarGroup, StartMenuEntry } from '../models/shell.model';

export const SESSION_USER_NAME = 'Administrador';

const WINDOW_WIDTH = 760;
const WINDOW_HEIGHT = 460;

export const DESKTOP_ICONS: readonly DesktopIcon[] = [
  { id: 'sistema', label: 'Mi sistema', icon: 'icons/computer.svg', taskId: 'dashboard' },
  { id: 'usuarios', label: 'Usuarios', icon: 'icons/users.svg', taskId: 'usuarios' },
  { id: 'reportes', label: 'Reportes', icon: 'icons/chart.svg', taskId: 'reportes' },
];

export const SHELL_TASKS: readonly ShellTask[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'icons/dashboard.svg',
    route: '/app/dashboard',
    open: true,
    minimized: false,
    maximized: false,
    active: true,
    zIndex: 8,
    x: 108,
    y: 18,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: 'icons/users.svg',
    route: '/app/usuarios',
    open: true,
    minimized: true,
    maximized: false,
    active: false,
    zIndex: 6,
    x: 136,
    y: 42,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: 'icons/chart.svg',
    route: '/app/reportes',
    open: true,
    minimized: true,
    maximized: false,
    active: false,
    zIndex: 5,
    x: 164,
    y: 66,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: 'icons/control-panel.svg',
    route: '/app/configuracion',
    open: false,
    minimized: false,
    maximized: false,
    active: false,
    zIndex: 4,
    x: 148,
    y: 36,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
];

export const QUICK_LAUNCH: readonly DesktopIcon[] = [
  { id: 'ql-dashboard', label: 'Dashboard', icon: 'icons/dashboard.svg', taskId: 'dashboard' },
  { id: 'ql-usuarios', label: 'Usuarios', icon: 'icons/users.svg', taskId: 'usuarios' },
  { id: 'ql-reportes', label: 'Reportes', icon: 'icons/chart.svg', taskId: 'reportes' },
];

export const START_MENU_LEFT: readonly StartMenuEntry[] = [
  { id: 'documentos', label: 'Mis documentos', detail: 'Documentos y carpetas', icon: 'icons/folder.svg' },
  { id: 'imagenes', label: 'Mis imágenes', detail: 'Fotografías e ilustraciones', icon: 'icons/images.svg' },
  { id: 'archivos', label: 'Mis archivos', detail: 'Archivos recientes', icon: 'icons/files.svg' },
];

export const START_MENU_RIGHT: readonly StartMenuEntry[] = [
  { id: 'panel', label: 'Panel de control', icon: 'icons/control-panel.svg', taskId: 'configuracion' },
  { id: 'impresoras', label: 'Impresoras', icon: 'icons/printer.svg' },
  { id: 'buscar', label: 'Buscar', icon: 'icons/search.svg' },
  { id: 'ayuda', label: 'Ayuda', icon: 'icons/help.svg' },
];

export const SIDEBAR_GROUPS: readonly SidebarGroup[] = [
  {
    id: 'tareas',
    title: 'Tareas del sistema',
    links: [
      { label: 'Inicio', icon: 'icons/dashboard.svg', route: '/app/dashboard', taskId: 'dashboard' },
      { label: 'Usuarios', icon: 'icons/users.svg', route: '/app/usuarios', taskId: 'usuarios' },
      { label: 'Reportes', icon: 'icons/chart.svg', route: '/app/reportes', taskId: 'reportes' },
      {
        label: 'Configuración',
        icon: 'icons/control-panel.svg',
        route: '/app/configuracion',
        taskId: 'configuracion',
      },
    ],
  },
  {
    id: 'lugares',
    title: 'Otros lugares',
    links: [
      { label: 'Documentos', icon: 'icons/folder.svg', taskId: 'dashboard' },
      { label: 'Mi equipo', icon: 'icons/computer.svg', taskId: 'dashboard' },
    ],
  },
];
