import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CreateItem } from '../create-items/create-item';
import { SelectVehicle } from '../select-vehicle/select-vehicle';
import { Item, Vehicle } from '../../../../generated_services';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-home-controls',
  standalone: true,
  imports: [CommonModule, ButtonModule, CreateItem, SelectVehicle, ReactiveFormsModule, InputTextModule, CheckboxModule],
  templateUrl: './home-controls.html',
  styleUrls: ['./home-controls.scss']
})
export class HomeControls {
  @Input() items: Item[] = [];
  @Input() vehicle?: Vehicle;

  @Output() addItem = new EventEmitter<Item>();
  @Output() selectVehicle = new EventEmitter<Vehicle>();
  @Output() removeItem = new EventEmitter<number>();
  @Output() send = new EventEmitter<void>();
  form!: FormGroup;
  showHelp = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      w: [30, [Validators.required, Validators.min(1)]],
      l: [30, [Validators.required, Validators.min(1)]],
      h: [30, [Validators.required, Validators.min(1)]],
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
    v.w = Number(v.w);
    v.l = Number(v.l);
    v.h = Number(v.h);
    v.quantity = Number(v.quantity) || 1;
    v.weight = Number(v.weight) || 0;
    this.addItem.emit(v);
    this.form.patchValue({ w:30, l:30, h:30, quantity:1, weight:0, stackable:true, uprightOnly:false, itemMaxStackWeight:null });
  }

  toggleHelp() { this.showHelp = !this.showHelp; }
}
