import { NgModule } from '@angular/core';
import { LogoComponent } from '../components/logo/logo.component';

@NgModule({
	declarations: [
		LogoComponent,
	],
	exports: [
		LogoComponent,
	],
})
export class SharedModule { }
