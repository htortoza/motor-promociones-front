import { Injectable, computed, signal } from '@angular/core';
import { Empresa } from '../data/giftcard.model';
import { Modulo } from '../data/shell.model';

const MOCK_EMPRESAS: Empresa[] = [
  { id: 'empresa-1', nombre: 'Italmod', holdingId: null },
  { id: 'empresa-1a', nombre: 'Italmod Providencia', holdingId: 'empresa-1' },
  { id: 'empresa-1b', nombre: 'Italmod Ñuñoa', holdingId: 'empresa-1' },
  { id: 'empresa-2', nombre: 'Autoplanet', holdingId: null },
];

/** Motor de Promociones es el único módulo raíz — Giftcards es una parte de él, no un módulo paralelo. */
const MOTOR_PROMOCIONES: Modulo = {
  clave: 'motor-promociones',
  etiqueta: 'Motor de Promociones',
  empresasHabilitadas: ['empresa-1', 'empresa-1a', 'empresa-1b'],
  submodulos: [
    { clave: 'giftcards', etiqueta: 'Giftcards', icono: 'pi pi-credit-card', ruta: '/giftcards', implementado: true },
    { clave: 'promociones', etiqueta: 'Promociones', icono: 'pi pi-percentage', ruta: '/promociones', implementado: false },
  ],
};

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private readonly _empresas = signal<Empresa[]>(MOCK_EMPRESAS);
  private readonly _empresaActivaId = signal<string>(MOCK_EMPRESAS[0].id);
  private readonly _cambiandoContexto = signal(false);

  readonly empresas = this._empresas.asReadonly();
  readonly cambiandoContexto = this._cambiandoContexto.asReadonly();
  readonly modulo = MOTOR_PROMOCIONES;

  readonly empresaActiva = computed(() => this._empresas().find((e) => e.id === this._empresaActivaId())!);

  readonly moduloHabilitadoParaEmpresa = computed(() => this.modulo.empresasHabilitadas.includes(this.empresaActiva().id));

  cambiarEmpresa(empresaId: string): void {
    this._cambiandoContexto.set(true);
    this._empresaActivaId.set(empresaId);
    setTimeout(() => this._cambiandoContexto.set(false), 500);
  }
}
