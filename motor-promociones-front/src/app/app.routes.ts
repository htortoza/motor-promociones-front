import { Routes } from '@angular/router';
import { rolRedirectGuard } from './guards/rol-redirect.guard';
import { soloInternoGuard } from './guards/solo-interno.guard';
import { soloAdministradorHoldingGuard } from './guards/solo-administrador-holding.guard';
import { soloCompradorExternoGuard } from './guards/solo-comprador-externo.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [rolRedirectGuard], children: [] },
  {
    path: 'giftcards',
    canActivate: [soloInternoGuard],
    loadComponent: () => import('./components/giftcard/giftcard-list/giftcard-list').then((m) => m.GiftcardList),
  },
  {
    path: 'accesos-externos',
    canActivate: [soloInternoGuard, soloAdministradorHoldingGuard],
    loadComponent: () => import('./components/giftcard/acceso-externo-list/acceso-externo-list').then((m) => m.AccesoExternoList),
  },
  {
    path: 'mi-lote',
    canActivate: [soloCompradorExternoGuard],
    loadComponent: () => import('./components/giftcard/portal-externo/portal-externo').then((m) => m.PortalExterno),
  },
];
