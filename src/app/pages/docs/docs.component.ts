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

type Section = {
	name: string;
	rows: Row[];
};

const SECTIONS: Section[] = [
	{
		name: 'Directives',
		rows: [
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
			{
				name: 'ghostRiderStepHide',
				type: 'Directive',
				description: 'Hides the step when clicked',
			},
			{
				name: 'ghostRiderStepPrevious',
				type: 'Directive',
				description: 'Goes to the previous step when clicked',
			},
		],
	},
	{
		name: 'Outputs',
		rows: [
			{
				name: 'ghostRiderStepEvent',
				type: 'Output',
				description: 'Emits an event when a step is Started, Next, Back, Close or Complete',
				example: '(ghostRiderStepEvent)="handleEvent()"',
			},
		],
	},
	{
		name: 'Step Options',
		rows: [
			{
				name: 'name',
				type: 'string',
				description: `The name of the step (should be 'namespaced' to scope step names specific tours. ie. 'tourname.firststep')`,
			},
			{
				name: 'title',
				type: 'string',
				description: `Text that is displayed for the step title`,
			},
			{
				name: 'backButtonLabel',
				type: 'string',
				description: `Label for the back button`,
			},
			{
				name: 'nextButtonLabel',
				type: 'string',
				description: `Label for the next button`,
			},
			{
				name: 'shouldRegister',
				type: 'boolean',
				description: `Flag if the step should get 'registered' as soon as possible`,
			},
			{
				name: 'backIsDisabled',
				type: 'boolean',
				description: `Flag to disable the back step action`,
			},
			{
				name: 'nextIsDisabled',
				type: 'boolean',
				description: `Flag to disable the next step action`,
			},
			{
				name: 'nextIsHide',
				type: 'boolean',
				description: `Flag to hide the step when the next button is clicked`,
			},
			{
				name: 'position',
				type: 'PopoverPosition',
				description: `Postion for the popover. See Angular tooltip: https://github.com/angular/components/blob/main/src/material/tooltip/tooltip.ts `,
			},
			{
				name: 'nubbinPosition',
				type: 'PopoverNubbinPosition',
				description: `Position for the nubbin`,
			},
			{
				name: 'content',
				type: 'PopoverContent',
				description: `Step's content. This can be a string, a TemplatePortal, or a ComponentPortal`,
			},
			{
				name: 'beforeActivate',
				type: 'function',
				description: `Function to run before the popover is shown. 'popover.show(0)'`,
			},
		],
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
	public sections: Section[] = SECTIONS;

	constructor(
		private readonly _router: Router,
	) { }

	public handleEvent(event: GhostRiderEvent): void {
		if (event.type === GhostRiderEventType.Back) {
			this._router.navigate(['home']);
		}
	}
}