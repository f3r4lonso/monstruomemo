import { Routes } from '@angular/router';
import { MemoComponent } from './features/memo/memo.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Monstruomemo | Memoria de monstruos',
    component: MemoComponent
  },
  {
    path: '',
    loadComponent: () => import('./pokedex-layout.component').then(m => m.PokedexLayoutComponent),
    children: [
      {
        path: 'pokemon-listing',
        title: 'Listing - Pokédex',
        loadComponent: () => import('@features/pokemon-listing/pokemon-listing.component').then(m => m.PokemonListingComponent)
      },
      {
        path: 'pokemon-details/:name',
        title: 'Pokédex',
        loadComponent: () => import('@features/pokemon-details/pokemon-details.component').then(m => m.PokemonDetailsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
