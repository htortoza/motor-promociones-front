import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrimeTemplate } from 'primeng/api';
import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Tag } from 'primeng/tag';
import { AccesoExternoService } from '../../../services/acceso-externo.service';
import { CampanaService } from '../../../services/campana.service';
import { RecursoOtorgado, recursoVigente } from '../../../data/governance.model';

@Component({
  selector: 'app-acceso-externo-list',
  imports: [FormsModule, PrimeTemplate, Card, TableModule, Button, Dialog, InputText, Select, DatePicker, Tag],
  templateUrl: './acceso-externo-list.html',
  styleUrl: './acceso-externo-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccesoExternoList {
  private readonly accesoExternoService = inject(AccesoExternoService);
  private readonly campanaService = inject(CampanaService);

  readonly accesos = this.accesoExternoService.accesosDeHoldingActivo;
  readonly campanasDisponibles = this.campanaService.campanasDelHoldingActivo;

  readonly modalVisible = signal(false);
  readonly nombre = signal('');
  readonly campanaId = signal<string | null>(null);
  readonly fechaExpiracion = signal<Date | null>(null);

  readonly puedeCrear = computed(() => this.nombre().trim().length > 0 && this.campanaId() !== null && this.fechaExpiracion() !== null);

  esVigente(recurso: RecursoOtorgado): boolean {
    return recursoVigente(recurso, new Date().toISOString().slice(0, 10));
  }

  abrirModal(): void {
    this.modalVisible.set(true);
  }

  cerrarModal(): void {
    this.modalVisible.set(false);
    this.nombre.set('');
    this.campanaId.set(null);
    this.fechaExpiracion.set(null);
  }

  confirmarCreacion(): void {
    const campanaId = this.campanaId();
    const fecha = this.fechaExpiracion();
    if (!this.puedeCrear() || !campanaId || !fecha) return;

    this.accesoExternoService.crear({
      nombre: this.nombre().trim(),
      recurso: { tipoRecurso: 'lote_giftcard', idRecurso: campanaId, fechaExpiracion: fecha.toISOString().slice(0, 10) },
    });
    this.cerrarModal();
  }
}
