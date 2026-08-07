import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CampanaService } from './campana.service';
import { EmpresaService } from './empresa.service';
import { SesionService } from './sesion.service';

describe('CampanaService — campanasDelHoldingActivo', () => {
  let campanaService: CampanaService;
  let empresaService: EmpresaService;
  let sesionService: SesionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    campanaService = TestBed.inject(CampanaService);
    empresaService = TestBed.inject(EmpresaService);
    sesionService = TestBed.inject(SesionService);
  });

  it('devuelve las campañas del holding aunque la vista esté acotada a una tienda sin campañas propias', () => {
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    empresaService.cambiarEmpresa('empresa-1a');

    // La vista de giftcards queda acotada a la tienda (campanasDeEmpresaActiva vacío)...
    expect(campanaService.campanasDeEmpresaActiva()).toEqual([]);
    // ...pero otorgar un acceso externo sigue siendo una acción de holding completo.
    expect(campanaService.campanasDelHoldingActivo().map((c) => c.id)).toEqual(['campana-1']);
  });
});
