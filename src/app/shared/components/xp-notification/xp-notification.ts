import { Component, inject } from '@angular/core';
import { NoticeType, NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-xp-notification-host',
  templateUrl: './xp-notification.html',
  styleUrl: './xp-notification.css',
})
export class XpNotificationHost {
  protected readonly notifications = inject(NotificationService);

  protected label(type: NoticeType): string {
    switch (type) {
      case 'success':
        return 'Operación completada';
      case 'warning':
        return 'Advertencia';
      case 'error':
        return 'Error';
      default:
        return 'Información';
    }
  }
}
