import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Vehicle } from '../../../../generated_services';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-select-vehicle',
  imports: [CommonModule, ButtonModule, DialogModule, InputTextModule, ReactiveFormsModule],
  templateUrl: './select-vehicle.html',
  styleUrls: ['./select-vehicle.scss'],
})
export class SelectVehicle {
  @Input() vehicles: Vehicle[] = [];
  @Output() outputEvent = new EventEmitter<Vehicle>();

  vehicle?: Vehicle;
  visible: boolean = false;
  selectedIndex: number | null = null;

  vehicleList: Vehicle[] = [
    { width: 2352, height: 2395, length: 5898, maxWeight: 18000, axles: [] },
    { width: 2352, height: 2395, length: 12032, maxWeight: 28000, axles: [] },
    { width: 2352, height: 2698, length: 12032, maxWeight: 33500, axles: [] },
  ];

  get availableVehicles(): Vehicle[] {
    return (this.vehicles && this.vehicles.length) ? this.vehicles : this.vehicleList;
  }


  selectVehicle(index: number | string) {
    const idx = typeof index === 'string' ? parseInt(index, 10) : index;
    if (!isNaN(Number(idx)) && idx !== null && this.availableVehicles[idx]) {
      this.vehicle = this.availableVehicles[idx];
      this.selectedIndex = Number(idx);
      this.outputEvent.emit(this.vehicle);
    } else {
      this.vehicle = undefined;
      this.selectedIndex = null;
    }
  }

  showDialog() {
    this.visible = true;
  }
}
