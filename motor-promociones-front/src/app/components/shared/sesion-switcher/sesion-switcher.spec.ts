import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SesionSwitcher } from './sesion-switcher';
import { SesionService } from '../../../services/sesion.service';

describe('SesionSwitcher', () => {
  let fixture: ComponentFixture<SesionSwitcher>;
  let component: SesionSwitcher;
  let sesionService: SesionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SesionSwitcher] }).compileComponents();
    fixture = TestBed.createComponent(SesionSwitcher);
    component = fixture.componentInstance;
    sesionService = TestBed.inject(SesionService);
    fixture.detectChanges();
  });

  it('cambiar a usuario-pos entra con la primera tienda disponible', () => {
    component.cambiarRol('usuario-pos');
    expect(sesionService.rol()).toBe('usuario-pos');
    expect(sesionService.empresaId()).toBe('empresa-1a');
  });

  it('cambiar a administrador-holding entra con el primer holding disponible', () => {
    component.cambiarRol('administrador-holding');
    expect(sesionService.rol()).toBe('administrador-holding');
    expect(sesionService.empresaId()).toBe('empresa-1');
  });

  it('cambiar a comprador-externo sin cuentas disponibles entra con id vacío', () => {
    component.cambiarRol('comprador-externo');
    expect(sesionService.rol()).toBe('comprador-externo');
    expect(sesionService.accesoExternoId()).toBe('');
  });
});
