import { Component, input, output } from '@angular/core';
import { WindowFrame, WindowPosition } from '../../../core/models/shell.model';

type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

@Component({
  selector: 'app-xp-window',
  templateUrl: './xp-window.html',
  styleUrl: './xp-window.css',
  host: {
    '[class.is-active]': 'active()',
    '[class.is-maximized]': 'maximized()',
    '[style.left.px]': 'maximized() ? null : x()',
    '[style.top.px]': 'maximized() ? null : y()',
    '[style.width.px]': 'maximized() ? null : width()',
    '[style.height.px]': 'maximized() ? null : height()',
    '[style.z-index]': 'zIndex()',
  },
})
export class XpWindow {
  readonly title = input.required<string>();
  readonly icon = input('');
  readonly active = input(true);
  readonly maximized = input(false);
  readonly minimizable = input(true);
  readonly maximizable = input(true);
  readonly closable = input(true);
  readonly x = input(80);
  readonly y = input(24);
  readonly width = input(720);
  readonly height = input(460);
  readonly zIndex = input(6);

  readonly activated = output<void>();
  readonly minimized = output<void>();
  readonly maximizeToggled = output<void>();
  readonly closed = output<void>();
  readonly moved = output<WindowPosition>();
  readonly frameChanged = output<WindowFrame>();

  protected readonly resizeEdges: readonly ResizeEdge[] = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];

  private drag: { pointerId: number; originX: number; originY: number; x: number; y: number } | null =
    null;
  private resize: {
    pointerId: number;
    edge: ResizeEdge;
    originX: number;
    originY: number;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null = null;

  protected onTitlePointerDown(event: PointerEvent): void {
    const target = event.target;
    if (target instanceof Element && target.closest('.xp-caption-buttons')) {
      return;
    }
    this.activated.emit();
    if (this.maximized() || event.button !== 0) {
      return;
    }
    const handle = event.currentTarget;
    if (!(handle instanceof HTMLElement)) {
      return;
    }
    handle.setPointerCapture(event.pointerId);
    this.drag = {
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      x: this.x(),
      y: this.y(),
    };
  }

  protected onTitlePointerMove(event: PointerEvent): void {
    if (!this.drag || this.drag.pointerId !== event.pointerId) {
      return;
    }
    const nextX = this.drag.x + event.clientX - this.drag.originX;
    const nextY = this.drag.y + event.clientY - this.drag.originY;
    const maxX = Math.max(0, window.innerWidth - 96);
    const maxY = Math.max(0, window.innerHeight - 64);
    this.moved.emit({
      x: Math.min(maxX, Math.max(-this.width() + 96, nextX)),
      y: Math.min(maxY, Math.max(0, nextY)),
    });
  }

  protected onTitlePointerUp(event: PointerEvent): void {
    if (this.drag?.pointerId === event.pointerId) {
      this.drag = null;
    }
  }

  protected onResizeDown(event: PointerEvent, edge: ResizeEdge): void {
    if (this.maximized() || event.button !== 0) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    const handle = event.currentTarget;
    if (handle instanceof HTMLElement) {
      try {
        handle.setPointerCapture(event.pointerId);
      } catch {
        // El arrastre sigue por los eventos del propio borde.
      }
    }
    this.activated.emit();
    this.resize = {
      pointerId: event.pointerId,
      edge,
      originX: event.clientX,
      originY: event.clientY,
      x: this.x(),
      y: this.y(),
      width: this.width(),
      height: this.height(),
    };
  }

  protected onResizeMove(event: PointerEvent): void {
    const drag = this.resize;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - drag.originX;
    const dy = event.clientY - drag.originY;
    const east = drag.edge === 'e' || drag.edge === 'ne' || drag.edge === 'se';
    const west = drag.edge === 'w' || drag.edge === 'nw' || drag.edge === 'sw';
    const south = drag.edge === 's' || drag.edge === 'se' || drag.edge === 'sw';
    const north = drag.edge === 'n' || drag.edge === 'ne' || drag.edge === 'nw';
    let x = drag.x;
    let y = drag.y;
    let width = east ? drag.width + dx : drag.width;
    let height = south ? drag.height + dy : drag.height;
    if (west) {
      width = drag.width - dx;
      x = drag.x + dx;
    }
    if (north) {
      height = drag.height - dy;
      y = drag.y + dy;
    }
    const minWidth = 280;
    const minHeight = 180;
    if (width < minWidth) {
      if (west) {
        x -= minWidth - width;
      }
      width = minWidth;
    }
    if (height < minHeight) {
      if (north) {
        y -= minHeight - height;
      }
      height = minHeight;
    }
    if (y < 0) {
      if (north) {
        height += y;
      }
      y = 0;
      height = Math.max(minHeight, height);
    }
    const maxRight = window.innerWidth;
    const maxBottom = window.innerHeight - 30;
    if (x + width > maxRight) {
      if (east) {
        width = Math.max(minWidth, maxRight - x);
      } else {
        x = maxRight - width;
      }
    }
    if (x > maxRight - 96) {
      x = maxRight - 96;
    }
    if (x + width < 96) {
      x = 96 - width;
    }
    if (y + height > maxBottom) {
      if (south) {
        height = Math.max(minHeight, maxBottom - y);
      } else {
        y = Math.max(0, maxBottom - height);
      }
    }
    this.frameChanged.emit({
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(width),
      height: Math.round(height),
    });
  }

  protected onResizeUp(event: PointerEvent): void {
    if (this.resize?.pointerId === event.pointerId) {
      this.resize = null;
    }
  }

  protected onTitleDoubleClick(event: MouseEvent): void {
    const target = event.target;
    if (!this.maximizable() || (target instanceof Element && target.closest('.xp-caption-buttons'))) {
      return;
    }
    this.maximizeToggled.emit();
  }

  protected onMinimize(event: Event): void {
    event.stopPropagation();
    this.minimized.emit();
  }

  protected onMaximize(event: Event): void {
    event.stopPropagation();
    this.maximizeToggled.emit();
  }

  protected onClose(event: Event): void {
    event.stopPropagation();
    this.closed.emit();
  }
}
