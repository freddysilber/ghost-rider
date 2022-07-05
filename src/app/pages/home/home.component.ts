import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
	GhostRiderEvent,
	GhostRiderEventType,
	GhostRiderModule,
	GhostRiderService,
	GhostRiderStep
} from 'ng-ghost-rider';

@Component({
	selector: 'app-home',
	templateUrl: 'home.component.html',
	styleUrls: ['home.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		GhostRiderModule,
		PortalModule,
		RouterModule,
	],
})
export class HomeComponent {
	constructor(
		private readonly _router: Router,
		private readonly _ghostRiderService: GhostRiderService,
	) {
		this.startTour();
	}

	public handleEvent(event: GhostRiderEvent | MouseEvent): void {
		if (event.type === GhostRiderEventType.Next || (event instanceof MouseEvent && !this._ghostRiderService.activeTour)) {
			this._router.navigate(['documentation']);
		}
	}

	public startTour(): void {
		if (!this._ghostRiderService.activeTour) {
			this._ghostRiderService.start(
				'tour',
				[
					new GhostRiderStep('title'),
					new GhostRiderStep('routerSupport'),
					new GhostRiderStep('zeroDependencies'),
					new GhostRiderStep('reactiveEvents'),
					new GhostRiderStep('documentation'),
					new GhostRiderStep('docsPage'),
					new GhostRiderStep('thirdStep'),
					new GhostRiderStep('fourthStep'),
				]
			);
		}
	}
}
