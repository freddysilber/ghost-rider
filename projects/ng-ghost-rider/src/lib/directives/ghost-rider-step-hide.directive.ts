import { Directive, HostListener } from '@angular/core';
import { GhostRiderService } from '../providers/ghost-rider.service';

/**
 * Hides the current step when clicked
 */
@Directive({ selector: '[ghostRiderStepHide]' })
export class GhostRiderStepHideDirective {
  constructor(
    private readonly _ghostRiderService: GhostRiderService,
  ) { }

  @HostListener('click')
  public hide(): void {
    if (this._ghostRiderService.activeTour) {
      this._ghostRiderService.hideStep();
    }
  }
}
