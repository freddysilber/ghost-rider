import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { GhostRiderService } from '../providers/ghost-rider.service';
import { GhostRiderEventSource } from '../models/ghost-rider-step-event.model';

/**
 * Goes to the next step when clicked
 */
@Directive({ selector: '[ghostRiderStepAdvance]' })
export class GhostRiderStepAdvanceDirective {
  @Output()
  public ghostRiderStepAdvance: EventEmitter<MouseEvent> = new EventEmitter();

  constructor(
    private readonly _ghostRiderService: GhostRiderService,
  ) { }

  @HostListener('click', ['$event'])
  public advance(event: MouseEvent): void {
    this.ghostRiderStepAdvance.emit(event);
    this._ghostRiderService.next(GhostRiderEventSource.Directive);
  }
}
