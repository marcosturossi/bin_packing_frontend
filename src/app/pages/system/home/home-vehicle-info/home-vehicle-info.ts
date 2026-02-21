import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CargoResponse, ItemWithPositions, Vehicle } from '../../../../generated_services';

@Component({
  selector: 'app-home-vehicle-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-vehicle-info.html',
  styleUrls: ['./home-vehicle-info.scss']
})
export class HomeVehicleInfo {
  @Input() response?: CargoResponse | null
  @Input() vehicle?: Vehicle

  // prefer vehicle info from response if present
  get effectiveVehicle(): Vehicle | undefined {
    return (this.response && this.response.vehicle) ? this.response.vehicle : this.vehicle
  }

  get totalPlacedWeight(): number {
    const items = this.response?.cargoItems || []
    return items.reduce((sum: number, it: ItemWithPositions) => {
      const qty = (it.quantity || 1)
      const w = (it.weight || 0)
      return sum + (w * qty)
    }, 0)
  }

  get totalPlacedVolume(): number {
    const items = this.response?.cargoItems || []
    return items.reduce((sum: number, it: ItemWithPositions) => {
      const qty = (it.quantity || 1)
      const vol = (it.width || 0) * (it.length || 0) * (it.height || 0)
      return sum + (vol * qty)
    }, 0)
  }
}
