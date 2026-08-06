import { ChangeDetectionStrategy, Component, computed, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { Button } from 'primeng/button';
import { CrearCampanaPayload } from '../../../data/giftcard.model';

@Component({
  selector: 'app-campana-create-modal',
  imports: [FormsModule, Dialog, InputText, DatePicker, Button],
  templateUrl: './campana-create-modal.html',
  styleUrl: './campana-create-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampanaCreateModal {
  readonly visible = model.required<boolean>();
  readonly crear = output<CrearCampanaPayload>();

  readonly nombre = signal('');
  readonly fechaInicio = signal<Date | null>(null);
  readonly fechaFin = signal<Date | null>(null);

  readonly puedeConfirmar = computed(() => this.nombre().trim().length > 0 && this.fechaInicio() !== null && this.fechaFin() !== null);

  confirmar(): void {
    if (!this.puedeConfirmar()) return;
    this.crear.emit({
      nombre: this.nombre().trim(),
      fechaInicio: aIso(this.fechaInicio()!),
      fechaFin: aIso(this.fechaFin()!),
    });
    this.cerrar();
  }

  cerrar(): void {
    this.visible.set(false);
    this.nombre.set('');
    this.fechaInicio.set(null);
    this.fechaFin.set(null);
  }
}

function aIso(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}
