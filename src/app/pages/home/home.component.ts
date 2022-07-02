import { Component, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PortalModule } from '@angular/cdk/portal';
import { GhostRiderModule } from 'ng-ghost-rider';
import { GhostRiderEvent, GhostRiderEventType, GhostRiderService, GhostRiderStep } from 'ng-ghost-rider';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-home',
	templateUrl: 'home.component.html',
	styleUrls: ['home.component.scss'],
	standalone: true,
	imports: [
		GhostRiderModule,
		PortalModule,
		RouterModule,
	],
})
export class HomeComponent implements OnDestroy {
	private _subs: Map<string, Subscription> = new Map();

	constructor(
		private readonly _router: Router,
		private readonly _ghostRiderService: GhostRiderService,
	) {
		this.startTour();
	}

	ngOnDestroy(): void {
		this._subs.forEach((sub) => sub.unsubscribe());
	}

	public handleEvent(event: GhostRiderEvent): void {
		if (event.type === GhostRiderEventType.Next) {
			this._router.navigate(['documentation']);
		}
	}

	public startTour(): void {
		this._ghostRiderService.start(
			'tour',
			[
				new GhostRiderStep('title'),
				new GhostRiderStep('subTitle'),
				new GhostRiderStep('secondStep'),
				new GhostRiderStep('thirdStep'),
				new GhostRiderStep('fourthStep'),
			]
		);
	}
}
