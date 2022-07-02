import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then((mod) => mod.HomeComponent),
        title: 'Ghost Rider'
      },
      {
        path: 'documentation',
        loadComponent: () => import('./pages/docs/docs.component').then((mod) => mod.DocsComponent),
        title: 'Ghost Rider - Docs'
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
