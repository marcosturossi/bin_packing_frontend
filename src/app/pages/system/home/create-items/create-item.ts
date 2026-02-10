import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Item } from '../../../../generated_services';

@Component({
  selector: 'app-create-item',
  imports: [ButtonModule, DialogModule, InputTextModule, ReactiveFormsModule],
  templateUrl: './create-item.html',
  styleUrls: ['./create-item.scss'],
  standalone: true
})
export class CreateItem {
  @Output() outputEvent = new EventEmitter<Item>();

  visible: boolean = false;
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      w: [0],
      l: [0],
      h: [0],
      quantity: [1],
      weight: [0],
      stackable: [true],
      uprightOnly: [false],
      itemMaxStackWeight: [null]
    });
  }

  showDialog() {
        this.visible = true;
    }

  emitItem() {
    if (this.form.valid) {
      const value = this.form.value as Item;
      this.outputEvent.emit(value);
      this.visible = false;
      this.form.reset({ w:0,l:0,h:0,quantity:1,weight:0,stackable:true,uprightOnly:false,itemMaxStackWeight:null });
    }
  }
}
