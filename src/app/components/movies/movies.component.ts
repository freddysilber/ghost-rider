import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GhostRiderEvent, GhostRiderEventType } from 'ng-ghost-rider';

@Component({
	selector: 'app-movies',
	templateUrl: 'movies.component.html',
	styles: [`
		h1 {
			color: white;
			margin: 1rem;
		}
	`],
})
export class MoviesComponent {
	constructor(
		private readonly _router: Router,
	) { }

	public handleEvent(event: GhostRiderEvent): void {
		if (event.type === GhostRiderEventType.Back) {
			this._router.navigate(['home']);
		}
	}
}
