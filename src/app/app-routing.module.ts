import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then((mod) => mod.HomeComponent)
      },
      {
        path: 'documentation',
        loadComponent: () => import('./pages/docs/docs.component').then((mod) => mod.DocsComponent)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'home'
      }
    ])
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
