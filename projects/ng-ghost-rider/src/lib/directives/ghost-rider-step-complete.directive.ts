import { Directive, HostListener } from '@angular/core';
import { GhostRiderEventSource } from '../models/ghost-rider-step-event.model';
import { GhostRiderService } from '../providers/ghost-rider.service';

/**
 * Completes the tour when clicked
 */
@Directive({ selector: '[ghostRiderStepComplete]' })
export class GhostRiderStepCompleteDirective {

  constructor(
    private readonly _ghostRiderService: GhostRiderService,
  ) { }

  @HostListener('click')
  public complete(): void {
    this._ghostRiderService.complete(GhostRiderEventSource.Directive);
  }
}
