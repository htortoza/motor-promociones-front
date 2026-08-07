import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccesoExternoList } from './acceso-externo-list';
import { SesionService } from '../../../services/sesion.service';
import { AccesoExternoService } from '../../../services/acceso-externo.service';

describe('AccesoExternoList', () => {
  let fixture: ComponentFixture<AccesoExternoList>;
  let component: AccesoExternoList;
  let sesionService: SesionService;
  let accesoExternoService: AccesoExternoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AccesoExternoList] }).compileComponents();
    fixture = TestBed.createComponent(AccesoExternoList);
    component = fixture.componentInstance;
    sesionService = TestBed.inject(SesionService);
    accesoExternoService = TestBed.inject(AccesoExternoService);
    sesionService.entrarComoInterno('administrador-holding', 'empresa-1', 'Admin Italmod');
    fixture.detectChanges();
  });

  it('puedeCrear es false hasta completar nombre, campaña y fecha', () => {
    expect(component.puedeCrear()).toBe(false);
    component.nombre.set('DOT Solutions');
    component.campanaId.set('campana-1');
    component.fechaExpiracion.set(new Date('2026-12-31'));
    expect(component.puedeCrear()).toBe(true);
  });

  it('confirmarCreacion crea el acceso y cierra el modal', () => {
    component.nombre.set('DOT Solutions');
    component.campanaId.set('campana-1');
    component.fechaExpiracion.set(new Date('2026-12-31'));
    component.modalVisible.set(true);

    component.confirmarCreacion();

    expect(accesoExternoService.accesosDeHoldingActivo().length).toBe(1);
    expect(component.modalVisible()).toBe(false);
  });

  it('confirmarCreacion no hace nada si falta un campo obligatorio', () => {
    component.nombre.set('DOT Solutions');
    component.confirmarCreacion();
    expect(accesoExternoService.accesosDeHoldingActivo().length).toBe(0);
  });
});
