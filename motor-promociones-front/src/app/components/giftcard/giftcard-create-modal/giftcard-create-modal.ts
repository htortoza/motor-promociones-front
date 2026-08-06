import { ChangeDetectionStrategy, Component, computed, inject, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrimeTemplate } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { SelectButton } from 'primeng/selectbutton';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { Checkbox } from 'primeng/checkbox';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { CrearGiftcardPayload, GiftcardCanal, GiftcardTipoMonto } from '../../../data/giftcard.model';
import { CampanaService } from '../../../services/campana.service';

type Modo = 'individual' | 'lote';

const OPCIONES_MODO: { label: string; value: Modo }[] = [
  { label: 'Individual', value: 'individual' },
  { label: 'Lote corporativo', value: 'lote' },
];

const OPCIONES_TIPO_MONTO: { label: string; value: GiftcardTipoMonto }[] = [
  { label: 'Fijo', value: 'fijo' },
  { label: 'Dinámico', value: 'dinamico' },
];

const OPCIONES_CANAL: { label: string; value: GiftcardCanal }[] = [
  { label: 'Solo ecommerce', value: 'ecommerce' },
  { label: 'Solo tienda', value: 'tienda' },
  { label: 'Ambos', value: 'ambos' },
];

@Component({
  selector: 'app-giftcard-create-modal',
  imports: [FormsModule, PrimeTemplate, Dialog, SelectButton, Select, InputNumber, Checkbox, Button, Message],
  templateUrl: './giftcard-create-modal.html',
  styleUrl: './giftcard-create-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GiftcardCreateModal {
  private readonly campanaService = inject(CampanaService);

  readonly visible = model.required<boolean>();
  readonly crear = output<CrearGiftcardPayload>();

  readonly opcionesModo = OPCIONES_MODO;
  readonly opcionesTipoMonto = OPCIONES_TIPO_MONTO;
  readonly opcionesCanal = OPCIONES_CANAL;
  readonly campanas = this.campanaService.campanasDeEmpresaActiva;

  readonly modo = signal<Modo>('individual');
  readonly tipoMonto = signal<GiftcardTipoMonto>('fijo');
  readonly canal = signal<GiftcardCanal>('ambos');
  readonly montoFijo = signal<number | null>(null);
  readonly crearSoloComoVigente = signal(false);
  readonly cantidadLote = signal<number | null>(null);
  readonly campanaId = signal<string | null>(null);

  readonly etiquetaBotonConfirmar = computed(() => (this.modo() === 'individual' ? 'Crear giftcard' : 'Crear lote'));

  readonly puedeConfirmar = computed(() => {
    if (this.tipoMonto() === 'fijo' && !this.montoFijo()) return false;
    if (this.modo() === 'lote' && (!this.cantidadLote() || !this.campanaId())) return false;
    return true;
  });

  confirmar(): void {
    if (!this.puedeConfirmar()) return;

    const payload: CrearGiftcardPayload =
      this.modo() === 'individual'
        ? {
            modo: 'individual',
            tipoMonto: this.tipoMonto(),
            canal: this.canal(),
            montoFijo: this.montoFijo(),
            crearSoloComoVigente: this.crearSoloComoVigente(),
          }
        : {
            modo: 'lote',
            campanaId: this.campanaId()!,
            cantidad: this.cantidadLote() ?? 0,
            tipoMonto: this.tipoMonto(),
            canal: this.canal(),
            montoFijo: this.montoFijo(),
          };

    this.crear.emit(payload);
    this.cerrar();
  }

  cerrar(): void {
    this.visible.set(false);
    this.reiniciar();
  }

  private reiniciar(): void {
    this.modo.set('individual');
    this.tipoMonto.set('fijo');
    this.canal.set('ambos');
    this.montoFijo.set(null);
    this.crearSoloComoVigente.set(false);
    this.cantidadLote.set(null);
    this.campanaId.set(null);
  }
}
