import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GhostRiderEvent, GhostRiderEventType, GhostRiderService, GhostRiderStep } from 'ng-ghost-rider';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-home',
	templateUrl: 'home.component.html',
	styleUrls: ['home.component.scss'],
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
			this._router.navigate(['movies']);
		}
	}

	public startTour(): void {
		this._ghostRiderService.start(
			'tour',
			[
				new GhostRiderStep('firstStep'),
				new GhostRiderStep('secondStep'),
				new GhostRiderStep('thirdStep'),
				new GhostRiderStep('fourthStep'),
			]
		);
	}
}
