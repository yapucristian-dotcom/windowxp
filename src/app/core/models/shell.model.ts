export interface ShellTask {
  id: string;
  label: string;
  icon: string;
  route: string;
  open: boolean;
  minimized: boolean;
  maximized: boolean;
  active: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DesktopIcon {
  id: string;
  label: string;
  icon: string;
  taskId: string;
}

export interface StartMenuEntry {
  id: string;
  label: string;
  icon: string;
  detail?: string;
  taskId?: string;
}

export interface SidebarLink {
  label: string;
  icon: string;
  route?: string;
  taskId?: string;
}

export interface SidebarGroup {
  id: string;
  title: string;
  links: readonly SidebarLink[];
}

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowFrame extends WindowPosition {
  width: number;
  height: number;
}
