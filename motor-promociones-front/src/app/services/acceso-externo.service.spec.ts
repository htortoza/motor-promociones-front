import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AccesoExternoService } from './acceso-externo.service';
import { SesionService } from './sesion.service';

describe('AccesoExternoService', () => {
  let service: AccesoExternoService;
  let sesionService: SesionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccesoExternoService);
    sesionService = TestBed.inject(SesionService);
  });

  it('crea una cuenta externa vinculada al holding activo', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    service.crear({ nombre: 'DOT Solutions', recurso: { tipoRecurso: 'lote_giftcard', idRecurso: 'campana-1', fechaExpiracion: '2026-12-31' } });
    expect(service.accesosDeHoldingActivo().length).toBe(1);
    expect(service.accesosDeHoldingActivo()[0].nombre).toBe('DOT Solutions');
    expect(service.accesosDeHoldingActivo()[0].empresaVendedoraId).toBe('empresa-1');
  });

  it('otorga un recurso adicional a una cuenta existente en vez de crear una nueva', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    service.crear({ nombre: 'DOT Solutions', recurso: { tipoRecurso: 'lote_giftcard', idRecurso: 'campana-1', fechaExpiracion: '2026-12-31' } });
    const [acceso] = service.accesosDeHoldingActivo();

    service.otorgarRecurso({ accesoExternoId: acceso.id, recurso: { tipoRecurso: 'lote_giftcard', idRecurso: 'campana-2', fechaExpiracion: '2027-01-31' } });

    expect(service.accesosDeHoldingActivo().length).toBe(1);
    expect(service.accesosDeHoldingActivo()[0].recursos.length).toBe(2);
  });

  it('recursosVigentesDeSesion excluye recursos vencidos', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    service.crear({ nombre: 'DOT Solutions', recurso: { tipoRecurso: 'lote_giftcard', idRecurso: 'campana-1', fechaExpiracion: '2000-01-01' } });
    const [acceso] = service.accesosDeHoldingActivo();

    sesionService.entrarComoCompradorExterno(acceso.id, 'DOT Solutions');

    expect(service.recursosVigentesDeSesion()).toEqual([]);
  });

  it('recursosVigentesDeSesion incluye recursos vigentes', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    service.crear({ nombre: 'DOT Solutions', recurso: { tipoRecurso: 'lote_giftcard', idRecurso: 'campana-1', fechaExpiracion: '2099-01-01' } });
    const [acceso] = service.accesosDeHoldingActivo();

    sesionService.entrarComoCompradorExterno(acceso.id, 'DOT Solutions');

    expect(service.recursosVigentesDeSesion().map((r) => r.idRecurso)).toEqual(['campana-1']);
  });
});
