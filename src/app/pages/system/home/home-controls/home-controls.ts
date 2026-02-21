import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectVehicle } from '../select-vehicle/select-vehicle';
import { Item, Vehicle, CargoResponse } from '../../../../generated_services';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { HomeVehicleInfo } from '../home-vehicle-info/home-vehicle-info';

@Component({
  selector: 'app-home-controls',
  standalone: true,
  imports: [CommonModule, ButtonModule, SelectVehicle, ReactiveFormsModule, InputTextModule, CheckboxModule, HomeVehicleInfo],
  templateUrl: './home-controls.html',
  styleUrls: ['./home-controls.scss']
})
export class HomeControls {
  @Input() items: Item[] = [];
  @Input() vehicle?: Vehicle;
  @Input() response?: CargoResponse | null;

  @Output() addItem = new EventEmitter<Item>();
  @Output() selectVehicle = new EventEmitter<Vehicle>();
  @Output() removeItem = new EventEmitter<number>();
  @Output() send = new EventEmitter<void>();
  form!: FormGroup;
  showHelp = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      width: [30, [Validators.required, Validators.min(1)]],
      length: [30, [Validators.required, Validators.min(1)]],
      height: [30, [Validators.required, Validators.min(1)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      weight: [1, [Validators.required, Validators.min(0)]],
      stackable: [true],
      uprightOnly: [false],
      itemMaxStackWeight: [null]
    });
  }

  onAddItem(item: Item){ this.addItem.emit(item); }
  onSelectVehicle(v: Vehicle){ this.selectVehicle.emit(v); }
  onRemove(index:number){ this.removeItem.emit(index); }
  onSend(){ this.send.emit(); }

  quickAdd() {
    if (!this.form) return;
    const v = this.form.value as Item;
    // ensure numeric conversions
    v.width = Number(v.width);
    v.length = Number(v.length);
    v.height = Number(v.height);
    v.quantity = Number(v.quantity) || 1;
    v.weight = Number(v.weight) || 1;
    this.addItem.emit(v);
    this.form.patchValue({ width:30, length:30, height:30, quantity:1, weight:1, stackable:true, uprightOnly:false, itemMaxStackWeight:null });
  }

  toggleHelp() { this.showHelp = !this.showHelp; }
}
