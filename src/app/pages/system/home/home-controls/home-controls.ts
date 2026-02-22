import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectVehicle } from '../select-vehicle/select-vehicle';
import { Item, Vehicle, CargoResponse } from '../../../../generated_services';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { HomeVehicleInfo } from '../home-vehicle-info/home-vehicle-info';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../../services/notification.service';
import { NotificationInterface } from '../../../../shared/interface/notification';

@Component({
  selector: 'app-home-controls',
  standalone: true,
  imports: [CommonModule, ButtonModule, SelectVehicle, ReactiveFormsModule, FormsModule, InputTextModule, CheckboxModule, HomeVehicleInfo],
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
  fileToUpload: File | null = null;
  delimiter: string = ',';
  uploading: boolean = false;
  // backend base, match generated service default
  private backendBase = 'http://localhost:5000';

  constructor(private fb: FormBuilder, private http: HttpClient, private notificationService: NotificationService) {}

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

  onFileSelected(ev: any) {
    // support both native <input type=file> change event and PrimeNG FileUpload onSelect
    const pguFiles: File[] | undefined = ev?.files ?? ev?.originalEvent?.dataTransfer?.files;
    if (pguFiles && pguFiles.length) {
      this.fileToUpload = pguFiles[0];
      return;
    }
    const nativeFile: File | null = ev?.target?.files?.[0] ?? null;
    this.fileToUpload = nativeFile;
  }

  uploadCsv() {
    if (!this.fileToUpload) return;
    this.uploading = true;
    const fd = new FormData();
    fd.append('file', this.fileToUpload as Blob, this.fileToUpload!.name);
    const url = `${this.backendBase}/cargo/file/${encodeURIComponent(this.delimiter || ',')}`;
    this.http.post<Item[]>(url, fd).subscribe(
      (items) => {
        if (Array.isArray(items)) {
          items.forEach(it => this.addItem.emit(it));
          const successNotif: NotificationInterface = { type: 'success', message: `${items.length} itens importados com sucesso.`, title: 'Importar CSV', duration: 4000, closable: true };
          try { console.debug('[HomeControls] addNotification success', successNotif); } catch(e) {}
          this.notificationService.addNotification(successNotif);
        }
        this.uploading = false;
      },
      (err) => {
        console.error('CSV upload failed', err);
        const msg = err?.error?.message || err?.message || 'Falha ao importar CSV.';
        const errorNotif: NotificationInterface = { type: 'error', message: msg, title: 'Importar CSV', duration: 6000, closable: true };
        try { console.debug('[HomeControls] addNotification error', errorNotif); } catch(e) {}
        this.notificationService.addNotification(errorNotif);
        this.uploading = false;
      }
    );
  }

  clearSelection(fileInput: HTMLInputElement) {
    try {
      fileInput.value = '';
    } catch (e) {
      // ignore
    }
    this.fileToUpload = null;
    const infoNotif: NotificationInterface = { type: 'info', message: 'Seleção de arquivo limpa.', title: 'Importar CSV', duration: 2000, closable: false };
    this.notificationService.addNotification(infoNotif);
  }
}
