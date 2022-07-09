import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewContainerRef } from '@angular/core';
import { GhostRiderService } from '../providers/ghost-rider.service';
import { GhostRiderStepConfig } from '../models/ghost-rider-step-config.model';
import { GhostRiderStepDetails } from '../models/ghost-rider-step-details.model';
import { GhostRiderEvent } from '../models/ghost-rider-step-event.model';
import { BehaviorSubject, Subscription } from 'rxjs';

/**
 * Directive to make an element a step in the tour.
 * 
 * @param ghostRiderStep - Config object to customize the step
 */
@Directive({ selector: '[ghostRiderStep]' })
export class GhostRiderStepDirective<T = any> implements GhostRiderStepDetails, OnInit, OnDestroy {
  @Input() // Might want to remove the 'Partial'
  public set ghostRiderStep(config: Partial<GhostRiderStepConfig<T>>) {
    this.config = {
      ...new GhostRiderStepConfig(),
      ...config,
    };
  }

  public get ghostRiderStep(): GhostRiderStepConfig<T> {
    return this.config;
  }

  @Output()
  public ghostRiderStepEvent: EventEmitter<GhostRiderEvent> = new EventEmitter();

  public config!: GhostRiderStepConfig<T>;
  public active$: BehaviorSubject<boolean> = new BehaviorSubject(false as boolean);

  private readonly _subs: Subscription[] = [];

	constructor(
    public readonly element: ElementRef<HTMLElement>,
    public readonly vcr: ViewContainerRef,
		private readonly _ghostRiderService: GhostRiderService,
	) { }

  ngOnInit(): void {
    if (this.config.name && this.config.shouldRegister) {
      this._ghostRiderService.registerStep(this);
    }
  }

  ngOnDestroy(): void {
    if (this.config && this.config.name) {
      this._ghostRiderService.unregisterStep(this);
    }

    this._subs.forEach((sub) => sub.unsubscribe());
  }
}