import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SubnavService} from "../../services/subnav.service";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-subnav',
  templateUrl: './subnav.component.html',
  styleUrls: ['./subnav.component.scss']
})
export class SubnavComponent implements OnInit, OnDestroy {
  title: string = "";
  subscriptions: Subscription[] = [];

  constructor(private subNavService: SubnavService) {
    this.title = this.subNavService.title;
  }

  ngOnInit(): void {
    this.subscriptions.push(this.subNavService.setTitleEvent.subscribe(
      (title: string) => {
        this.title = title
      }
    ))
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
