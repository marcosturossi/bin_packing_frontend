import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CreateItem } from "./create-items/create-item";
import { SelectVehicle } from "./select-vehicle/select-vehicle";
import { HomeControls } from "./home-controls/home-controls";
import { HomeResults } from "./home-results/home-results";
import { Axel, CargoRequest, CargoResponse, Item, Vehicle, BinPackingService } from '../../../generated_services';
import { BehaviorSubject } from 'rxjs';
import { CargoView } from './cargo-view/cargo-view';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ButtonModule, CreateItem, SelectVehicle, CargoView, HomeControls, HomeResults],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})

export class Home {
  vehicle?: Vehicle
  items: Item[] = []
  visualizerExpanded = false
  // expose response as an observable to use the async pipe in template
  response$ = new BehaviorSubject<CargoResponse | undefined>(undefined)

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
        // push into observable subject; template uses async pipe
        this.response$.next(res);
        console.log('resposta', res);
      },
      error: (err) => {
        console.error('erro', err);
      }
    });
  }

  toggleVisualizer(){
    this.visualizerExpanded = !this.visualizerExpanded
  }
}
