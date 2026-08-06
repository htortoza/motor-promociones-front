import { Injectable, computed, inject, signal } from '@angular/core';
import { AccesoExterno, CrearAccesoExternoPayload, OtorgarRecursoPayload, recursoVigente } from '../data/governance.model';
import { EmpresaService } from './empresa.service';
import { SesionService } from './sesion.service';

const MOCK_ACCESOS_EXTERNOS: AccesoExterno[] = [];

@Injectable({ providedIn: 'root' })
export class AccesoExternoService {
  private readonly empresaService = inject(EmpresaService);
  private readonly sesionService = inject(SesionService);
  private readonly _accesos = signal<AccesoExterno[]>(MOCK_ACCESOS_EXTERNOS);
  private secuencia = MOCK_ACCESOS_EXTERNOS.length;

  /** Todas las cuentas externas — solo para el selector de sesión de demo, nunca para una vista de negocio. */
  readonly todos = this._accesos.asReadonly();

  /** Cuentas creadas por el holding actualmente activo. */
  readonly accesosDeHoldingActivo = computed(() => {
    const empresa = this.empresaService.empresaActiva();
    if (!empresa) return [];
    const holdingId = empresa.holdingId ?? empresa.id;
    return this._accesos().filter((a) => a.empresaVendedoraId === holdingId);
  });

  /** Recursos no vencidos de la cuenta externa con sesión activa. */
  readonly recursosVigentesDeSesion = computed(() => {
    const accesoId = this.sesionService.accesoExternoId();
    if (!accesoId) return [];
    const acceso = this._accesos().find((a) => a.id === accesoId);
    if (!acceso) return [];
    const hoy = new Date().toISOString().slice(0, 10);
    return acceso.recursos.filter((r) => recursoVigente(r, hoy));
  });

  crear(payload: CrearAccesoExternoPayload): void {
    const empresa = this.empresaService.empresaActiva();
    if (!empresa) return;

    this.secuencia += 1;
    const holdingId = empresa.holdingId ?? empresa.id;
    const acceso: AccesoExterno = {
      id: `acceso-externo-${this.secuencia}`,
      nombre: payload.nombre,
      empresaVendedoraId: holdingId,
      recursos: [payload.recurso],
    };
    this._accesos.update((lista) => [acceso, ...lista]);
  }

  otorgarRecurso(payload: OtorgarRecursoPayload): void {
    this._accesos.update((lista) =>
      lista.map((a) => (a.id === payload.accesoExternoId ? { ...a, recursos: [...a.recursos, payload.recurso] } : a)),
    );
  }
}
