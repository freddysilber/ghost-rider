import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { GhostRiderEvent, GhostRiderEventType, GhostRiderModule } from 'ng-ghost-rider';

@Component({
	selector: 'app-docs',
	templateUrl: 'docs.component.html',
	styleUrls: ['docs.component.scss'],
	standalone: true,
	imports: [
		GhostRiderModule,
		RouterModule,
	],
})
export class DocsComponent {
	constructor(
		private readonly _router: Router,
	) { }

	public handleEvent(event: GhostRiderEvent): void {
		if (event.type === GhostRiderEventType.Back) {
			this._router.navigate(['home']);
		}
	}
}