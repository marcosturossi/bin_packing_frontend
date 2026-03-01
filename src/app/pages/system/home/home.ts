import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { HomeControls } from "./home-controls/home-controls";
import { HomeResults } from "./home-results/home-results";
import { Axel, CargoRequest, CargoResponse, Item, Vehicle, BinPackingService } from '../../../generated_services';
import { NotificationService } from '../../../services/notification.service';
import { CargoProgressService } from '../../../services/cargo-progress.service';
import { NotificationInterface } from '../../../shared/interface/notification';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CargoView } from './cargo-view/cargo-view';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, ButtonModule, ProgressBarModule, CargoView, HomeControls, HomeResults],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})

export class Home implements OnDestroy {
  vehicle?: Vehicle
  items: Item[] = []
  visualizerExpanded = false
  // expose response as an observable to use the async pipe in template
  response$ = new BehaviorSubject<CargoResponse | undefined>(undefined)

  /** SSE progress state */
  loading = false
  iteration = 0
  statusMessage = ''
  private progressSub?: Subscription

  constructor(
    private binPacking: BinPackingService,
    private notificationService: NotificationService,
    private cargoProgress: CargoProgressService
  ) {}

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
    const requestId = cargoRequest.id!;

    // Reset progress state
    this.loading = true;
    this.iteration = 0;
    this.statusMessage = 'Enviando requisição…';
    this.response$.next(undefined);

    // 1. Open SSE stream to receive improving solutions in real-time
    this.progressSub?.unsubscribe();
    this.progressSub = this.cargoProgress.connect(requestId).subscribe({
      next: (update: CargoResponse) => {
        this.iteration = this.cargoProgress.eventCount;
        this.statusMessage = `Iteração ${this.iteration} — ${update.cargoItems?.length ?? 0} itens posicionados`;
        // Push each improving solution to the visualizer
        this.response$.next(update);
        console.log(`[SSE] iteração ${this.iteration}`, update);
      },
      complete: () => {
        // SSE stream ended – mark as done if POST hasn't already
        if (this.loading) {
          this.loading = false;
          this.statusMessage = 'Otimização concluída ✓';
        }
      }
    });

    // 2. Fire the POST request (the server starts optimising and streams progress)
    this.binPacking.calculateCargo(cargoRequest).subscribe({
      next: (res: CargoResponse) => {
        // Final optimised result
        this.response$.next(res);
        this.loading = false;
        this.statusMessage = 'Otimização concluída ✓';
        console.log('resposta final', res);
        const successNotif: NotificationInterface = { type: 'success', message: 'Carga calculada com sucesso.', title: 'Enviar Carga', duration: 4000, closable: true };
        try { console.debug('[Home] addNotification success', successNotif); } catch(e) {}
        this.notificationService.addNotification(successNotif);
      },
      error: (err) => {
        this.loading = false;
        this.statusMessage = '';
        this.cargoProgress.disconnect();
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

  ngOnDestroy(): void {
    this.progressSub?.unsubscribe();
    this.cargoProgress.disconnect();
  }
}
