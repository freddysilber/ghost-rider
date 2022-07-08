import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { GhostRiderEvent, GhostRiderEventType, GhostRiderModule } from 'ng-ghost-rider';
import { SharedModule } from 'src/app/modules/shared.module';

type Row = {
	name: string;
	type: string;
	description: string;
	example?: string;
};

const ROWS: Row[] = [
	{
		name: 'ghostRiderStepAdvance',
		type: 'Directive',
		description: 'Accepts a click event, emits an event when clicked and navigates to the next step when clicked',
		example: '(ghostRiderStepAdvance)="click()"',
	},
	{
		name: 'ghostRiderStepComplete',
		type: 'Directive',
		description: 'Completes the tour when clicked',
	},
];

@Component({
	selector: 'app-docs',
	templateUrl: 'docs.component.html',
	styleUrls: ['docs.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		GhostRiderModule,
		RouterModule,
		SharedModule,
	],
})
export class DocsComponent {
	public rows: Row[] = ROWS;

	constructor(
		private readonly _router: Router,
	) { }

	public handleEvent(event: GhostRiderEvent): void {
		if (event.type === GhostRiderEventType.Back) {
			this._router.navigate(['home']);
		}
	}
}