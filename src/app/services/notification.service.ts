import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationInterface } from '../shared/interface/notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications$ = new BehaviorSubject<NotificationInterface[]>([]);

  getNotifications(): Observable<NotificationInterface[]> {
    return this.notifications$.asObservable();
  }

  addNotification(notification: NotificationInterface) {
    const id = notification.id ?? `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const item = { ...notification, id } as NotificationInterface;
    const current = this.notifications$.value.slice();
    current.push(item);
    this.notifications$.next(current);
    return id;
  }

  removeNotification(id: string) {
    const filtered = this.notifications$.value.filter(n => n.id !== id);
    this.notifications$.next(filtered);
  }
}
