import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SubnavService {
  private _title: string = '';
  setTitleEvent = new Subject<string>();

  get title(): string {
    return this._title;
  }

  setTitle(title: string) {
    this._title = title;
    this.setTitleEvent.next(title);
  }
}
