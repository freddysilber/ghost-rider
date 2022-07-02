import { PortalModule } from '@angular/cdk/portal';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GhostRiderModule } from 'ng-ghost-rider';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GithubCorner } from './components/github-corner/github-corner.component';

const COMPONENTS = [
  AppComponent,
  GithubCorner,
];

@NgModule({
  declarations: [
    COMPONENTS
  ],
  imports: [
    PortalModule,
    BrowserModule,
    AppRoutingModule,
    GhostRiderModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
