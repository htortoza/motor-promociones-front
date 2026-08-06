export type Rol = 'master' | 'administrador-holding' | 'administrador-tienda' | 'usuario-pos' | 'comprador-externo';

export type TipoRecurso = 'lote_giftcard';

export interface RecursoOtorgado {
  tipoRecurso: TipoRecurso;
  idRecurso: string;
  fechaExpiracion: string;
}

export interface AccesoExterno {
  id: string;
  nombre: string;
  empresaVendedoraId: string;
  recursos: RecursoOtorgado[];
}

export interface CrearAccesoExternoPayload {
  nombre: string;
  recurso: RecursoOtorgado;
}

export interface OtorgarRecursoPayload {
  accesoExternoId: string;
  recurso: RecursoOtorgado;
}

/** Un recurso otorgado deja de ser accesible al vencer su fecha de expiración. */
export function recursoVigente(recurso: RecursoOtorgado, hoy: string): boolean {
  return recurso.fechaExpiracion >= hoy;
}
