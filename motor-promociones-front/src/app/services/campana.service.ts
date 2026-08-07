import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { Campana, CrearCampanaPayload, EstadisticasCampana, Giftcard, calcularEstadoGiftcard } from '../data/giftcard.model';
import { EmpresaService } from './empresa.service';
import { GiftcardService } from './giftcard.service';

const MOCK_CAMPANAS: Campana[] = [
  { id: 'campana-1', empresaId: 'empresa-1', nombre: 'Campaña Invierno', fechaCreacion: '2026-05-28', fechaInicio: '2026-06-01', fechaFin: '2026-08-31', archivada: false },
];

@Injectable({ providedIn: 'root' })
export class CampanaService {
  private readonly empresaService = inject(EmpresaService);
  private readonly giftcardService = inject(GiftcardService);
  private readonly _campanas = signal<Campana[]>(MOCK_CAMPANAS);
  private secuencia = MOCK_CAMPANAS.length;

  readonly campanasDeEmpresaActiva = computed(() => {
    const idsIncluidos = this.empresaService.empresasIncluidasEnVistaActiva();
    return this._campanas().filter((c) => idsIncluidos.includes(c.empresaId));
  });

  /**
   * Campañas de todo el holding, independiente de si la vista de giftcards está acotada a una tienda puntual.
   * Otorgar un acceso externo es una acción de holding completo (§4.1 de la spec), no debe depender del drill-down de la vista.
   */
  readonly campanasDelHoldingActivo = computed(() => {
    const activa = this.empresaService.empresaActiva();
    if (!activa) return [];
    const holdingId = activa.holdingId ?? activa.id;
    const empresas = this.empresaService.empresas();
    const idsHolding = [holdingId, ...empresas.filter((e) => e.holdingId === holdingId).map((e) => e.id)];
    return this._campanas().filter((c) => idsHolding.includes(c.empresaId));
  });

  readonly estadisticas = computed<EstadisticasCampana[]>(() => {
    const giftcards = this.giftcardService.giftcardsDeEmpresaActiva();
    return this.campanasDeEmpresaActiva().map((campana) => calcularEstadisticas(campana, giftcards));
  });

  readonly estadisticasActivas = computed(() => this.estadisticas().filter((e) => !e.campana.archivada));
  readonly estadisticasArchivadas = computed(() => this.estadisticas().filter((e) => e.campana.archivada));

  constructor() {
    // Archiva automáticamente cuando todos los códigos de una campaña quedaron en un estado terminal (canjeados o cancelados).
    effect(() => {
      const giftcards = this.giftcardService.giftcardsDeEmpresaActiva();
      const campanas = this._campanas();

      for (const campana of campanas) {
        if (campana.archivada) continue;
        const propias = giftcards.filter((g) => g.campanaId === campana.id);
        if (propias.length === 0) continue;
        const todasTerminales = propias.every((g) => {
          const estado = calcularEstadoGiftcard(g);
          return estado === 'agotada' || estado === 'inactiva';
        });
        if (todasTerminales) {
          untracked(() => this.archivar(campana.id));
        }
      }
    });
  }

  campanaPorId(id: string): Campana | null {
    return this._campanas().find((c) => c.id === id) ?? null;
  }

  estadisticasDe(campanaId: string): EstadisticasCampana | null {
    return this.estadisticas().find((e) => e.campana.id === campanaId) ?? null;
  }

  crear(payload: CrearCampanaPayload): void {
    const empresaActiva = this.empresaService.empresaActiva();
    if (!empresaActiva) return;

    this.secuencia += 1;
    const campana: Campana = {
      id: `campana-${this.secuencia}`,
      empresaId: empresaActiva.id,
      archivada: false,
      fechaCreacion: new Date().toISOString().slice(0, 10),
      ...payload,
    };
    this._campanas.update((lista) => [campana, ...lista]);
  }

  archivar(campanaId: string): void {
    this._campanas.update((lista) => lista.map((c) => (c.id === campanaId ? { ...c, archivada: true } : c)));
  }
}

function calcularEstadisticas(campana: Campana, giftcards: Giftcard[]): EstadisticasCampana {
  const propias = giftcards.filter((g) => g.campanaId === campana.id);
  return {
    campana,
    total: propias.length,
    activas: propias.filter((g) => calcularEstadoGiftcard(g) === 'activa').length,
    sinActivar: propias.filter((g) => calcularEstadoGiftcard(g) === 'sin-activar').length,
    canjeadas: propias.filter((g) => calcularEstadoGiftcard(g) === 'agotada').length,
    canceladas: propias.filter((g) => calcularEstadoGiftcard(g) === 'inactiva').length,
  };
}
