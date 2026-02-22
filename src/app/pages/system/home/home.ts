import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { HomeControls } from "./home-controls/home-controls";
import { HomeResults } from "./home-results/home-results";
import { Axel, CargoRequest, CargoResponse, Item, Vehicle, BinPackingService } from '../../../generated_services';
import { NotificationService } from '../../../services/notification.service';
import { NotificationInterface } from '../../../shared/interface/notification';
import { BehaviorSubject } from 'rxjs';
import { CargoView } from './cargo-view/cargo-view';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, ButtonModule, CargoView, HomeControls, HomeResults],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})

export class Home {
  vehicle?: Vehicle
  items: Item[] = []
  visualizerExpanded = false
  // expose response as an observable to use the async pipe in template
  response$ = new BehaviorSubject<CargoResponse | undefined>(undefined)

  constructor(private binPacking: BinPackingService, private notificationService: NotificationService) {}

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
        const successNotif: NotificationInterface = { type: 'success', message: 'Carga calculada com sucesso.', title: 'Enviar Carga', duration: 4000, closable: true };
        try { console.debug('[Home] addNotification success', successNotif); } catch(e) {}
        this.notificationService.addNotification(successNotif);
      },
      error: (err) => {
        console.error('erro', err);
        const msg = err?.error?.message || err?.message || 'Falha ao enviar carga.';
        const errorNotif: NotificationInterface = { type: 'error', message: msg, title: 'Enviar Carga', duration: 6000, closable: true };
        try { console.debug('[Home] addNotification error', errorNotif); } catch(e) {}
        this.notificationService.addNotification(errorNotif);
      }
    });
  }

  toggleVisualizer(){
    this.visualizerExpanded = !this.visualizerExpanded
  }
}
