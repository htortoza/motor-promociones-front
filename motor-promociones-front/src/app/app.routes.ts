import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'giftcards' },
  {
    path: 'giftcards',
    loadComponent: () => import('./components/giftcard/giftcard-list/giftcard-list').then((m) => m.GiftcardList),
  },
];
