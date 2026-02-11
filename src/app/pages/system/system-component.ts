import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";
// navbar and sidebar are provided by the app shell; avoid duplication here

@Component({
  selector: 'app-system-component',
  templateUrl: './system-component.html',
  styleUrls: ['./system-component.scss'],
  standalone: true,
  imports: [RouterModule]
})
export class SystemComponent {

}
