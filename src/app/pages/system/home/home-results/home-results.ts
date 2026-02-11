import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CargoResponse, Vehicle } from '../../../../generated_services';
import { CargoView } from '../cargo-view/cargo-view';

@Component({
  selector: 'app-home-results',
  standalone: true,
  imports: [CommonModule, CargoView],
  templateUrl: './home-results.html',
  styleUrls: ['./home-results.scss']
})
export class HomeResults {
  @Input() response?: CargoResponse | null;
  @Input() vehicle?: Vehicle | null;
  @Output() toggleExpand = new EventEmitter<void>();

  onToggle(){
    this.toggleExpand.emit();
  }
}
