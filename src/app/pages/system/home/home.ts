import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CreateItem } from "./create-items/create-item";
import { SelectVehicle } from "./select-vehicle/select-vehicle";
import { Axel, CargoRequest, CargoResponse, Item, Vehicle, BinPackingService } from '../../../generated_services';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ButtonModule, CreateItem, SelectVehicle],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})

export class Home {
  vehicle?: Vehicle
  items: Item[] = []
  response?: CargoResponse

  constructor(private binPacking: BinPackingService) {}

  addItem(item:Item){
    this.items.push(item)
  }

  selectVehicle(vehicle: Vehicle){
    this.vehicle = vehicle
  }

  removeItem(index:number){
    this.items.splice(index, 1)
  }

  createCargoRequest(): CargoRequest {
    return {
      id: 'cargo_' + Date.now(),
      vehicle: this.vehicle!,
      cargoItems: this.items
    }
  }

  sendCargo(){
    const cargoRequest = this.createCargoRequest()
    this.binPacking.calculateCargo(cargoRequest).subscribe({
      next: (res: CargoResponse) => {
        // assign on next microtask to avoid ExpressionChangedAfterItHasBeenCheckedError
        Promise.resolve().then(() => {
          this.response = res;
          console.log('resposta', res);
        });
      },
      error: (err) => {
        console.error('erro', err);
      }
    });
  }
}
