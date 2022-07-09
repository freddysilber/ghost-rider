import { Injectable, Injector, OnDestroy, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, defer, Observable, of, Subject, Subscription } from 'rxjs';
import { first, last, startWith } from 'rxjs/operators';
import { Popover } from '../models/ghost-rider-popover.model';
import { GhostRiderPopoverFactory } from './ghost-rider-popover-factory.service';
import { GhostRiderStepComponent } from '../components/ghost-rider-step.component';
import { GhostRiderTourGuide } from '../helpers/ghost-rider-tour-guide';
import { GhostRiderEvent, GhostRiderEventSource, GhostRiderEventType } from '../models/ghost-rider-step-event.model';
import { GhostRiderStepDetails } from '../models/ghost-rider-step-details.model';
import { GhostRiderStep } from '../models/ghost-rider-step.model';
import { OverlayRef } from '@angular/cdk/overlay';

/**
 * Used for the '_subs' map prop keys
 */
enum SubKeys {
  StepAdded = 'stepAdded',
  Events = 'events'
}

const ACTIVE_TARGET_CLASS: string = `ghost-rider-walkthrough-step_active`;

/**
 * Service to control guided tours and walkthrough steps
 */
@Injectable({ providedIn: 'root' })
export class GhostRiderService implements OnDestroy {
  private readonly _stepAdded$ = new Subject<string>();
  // Add keys to the 'SubKeys' enum pleez
  private readonly _subs = new Map<SubKeys, Subscription>();
  private readonly _steps = new Map<string, GhostRiderStepDetails>(); // name => step
  private readonly _popoverFactory: GhostRiderPopoverFactory;
  private readonly _renderer: Renderer2;

  private _tourGuide: GhostRiderTourGuide;
  private _activePopover: Popover;
  // TODO: Implement an optional UI masking element to override clicks from the user
  // private _uiMask: HTMLDivElement | null;

  private _isAsync: boolean = false; // Flag to use asynchronous or synchronous methods

  private _hideStep: () => Observable<void>;
  private _removeWindowHandler: () => void;

  /**
   * Flag that the tour is in flight. Once the tour is closed or skipped, this will be false
   */
  public readonly activeTour$ = new BehaviorSubject(false);

  public events$ = new Subject<GhostRiderEvent>();

  public get activeTour(): boolean {
    return this.activeTour$.value;
  }

  public get tourGuide(): GhostRiderTourGuide {
    return this._tourGuide;
  }

  constructor(
    private readonly _injector: Injector,
    rendererFactory: RendererFactory2,
  ) {
    this._popoverFactory = new GhostRiderPopoverFactory(this._injector);
    this._renderer = rendererFactory.createRenderer(null, null);

    /**
     * When there are step events, emit the event from the step's 'GhostRiderStepEvent'
     * output so we can react to event from specific components
     */
    this._subs.set(
      SubKeys.Events,
      this.events$.subscribe((event) => {
        if (this._steps.has(event.name)) {
          this._steps.get(event.name)?.ghostRiderStepEvent.emit(event);
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this._stepAdded$.complete();
    this._stepAdded$.unsubscribe();

    this.activeTour$.complete();
    this.activeTour$.unsubscribe();

    this.events$.complete();
    this.events$.unsubscribe();

    this._subs.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Adds a new step to the tour
   * @param step The step to add to the tour
   */
  public registerStep(step: GhostRiderStepDetails): void {
    if (!this._steps.has(step.config.name)) {
      this._steps.set(step.config.name, step);
    }
    this._stepAdded$.next(step.config.name);
  }

  /**
   * Removes the step from the '_steps' map
   * @param step The step to remove from the map
   */
  public unregisterStep(step: GhostRiderStepDetails): void {
    if (this._steps.has(step.config.name) && this._steps.get(step.config.name) === step) {
      this._steps.delete(step.config.name);
    }
  }

  /**
   * Starts the tour at from the first step
   * @param tourNamespace String to distinguish different tour contexts (becomes a prefix to all steps)
   * @param steps List of tour steps in the order in which they should go
   */
  public start(tourNamespace: string, steps: GhostRiderStep[]): void {
    tourNamespace = tourNamespace ? tourNamespace + '.' : '';
    this.activeTour$.next(true);
    this.events$.next({
      type: GhostRiderEventType.Start,
      name: tourNamespace,
      source: GhostRiderEventSource.Manual,
    });
    this._tourGuide = new GhostRiderTourGuide(tourNamespace, steps);
    this._goToStep();
  }

  /**
   * Pauses the tour on the active step
   */
  public pause(): void {
    if (this.activeTour) {
      this.hideStep();
    }
  }

  /**
   * Resumes the tour from the active step
   */
  public resume(): void {
    if (this.activeTour) {
      this._goToStep();
    }
  }

  /**
   * Goes to a parent step from any sub step
   * @param source The source value that caused this to be called
   */
  public goToParent(source: GhostRiderEventSource = GhostRiderEventSource.Manual): void {
    if (this.activeTour) {
      const { name } = this._tourGuide.activeStep;
      this.tourGuide.activeStep = this.tourGuide.activeStep.parent as GhostRiderStep;
      this._goToStep({ type: null, name, source }, true);
    }
  }

  /**
   * Goes to the next step
   * @param source The source value that caused this to be called
   */
  public next(source: GhostRiderEventSource = GhostRiderEventSource.Manual): void {
    if (this.activeTour) {
      const { name } = this._tourGuide.activeStep;
      this._tourGuide.getNextStep();
      this._goToStep({ type: GhostRiderEventType.Next, name, source });
    }
  }

  /**
   * Goes to the previous step
   * @param source The source value that caused this to be called
   */
  public back(source: GhostRiderEventSource = GhostRiderEventSource.Manual): void {
    if (this.activeTour) {
      const { name } = this._tourGuide.activeStep;
      this._tourGuide.getPreviousStep();
      this._goToStep({ type: GhostRiderEventType.Back, name, source });
    }
  }

  /**
   * Goes to the next sub step
   * @param source The source value that caused this to be called
   */
  public nextSubStep(source: GhostRiderEventSource = GhostRiderEventSource.Manual): void {
    if (this.activeTour) {
      const { name } = this._tourGuide.activeStep;
      this._tourGuide.getNextSubStep();
      this._goToStep({ type: null, name, source });
    }
  }

  /**
   * Goes to the previous sub step
   * @param source The source value that caused this to be called
   */
  public previousSubStep(source: GhostRiderEventSource = GhostRiderEventSource.Manual): void {
    if (this.activeTour) {
      const { name } = this._tourGuide.activeStep;
      this._tourGuide.getPreviousSubStep();
      this._goToStep({ type: null, name, source }, true);
    }
  }

  /**
   * Closes the tour, but with a more descriptive event
   * @param source The source value that caused this to be called
   */
  public complete(source: GhostRiderEventSource = GhostRiderEventSource.Manual): void {
    this.close(source, GhostRiderEventType.Complete);
  }

  /**
   * Ends the tour
   * @param source The source value that caused this to be called
   * @param type The event type to use for the emitted event
   */
  public close(
    source: GhostRiderEventSource = GhostRiderEventSource.Manual,
    type: GhostRiderEventType = GhostRiderEventType.Close,
  ): void {
    this.activeTour$.next(false);

    const { name } = this._tourGuide.activeStep;
    // Immediately remove the backdrop and clip path elements
    this._removeWindowHandler();
    // Dispose of the step and cleanup
    const hideStepSub = this.hideStep().subscribe(() => {
      this.events$.next({ type, name, source });
      hideStepSub.unsubscribe();
    });
    this._tourGuide = undefined as unknown as GhostRiderTourGuide;
  }

  /**
   * Calls the dynamic '_hideStep' prop function to remove a popover step from the UI
   */
  public hideStep(): Observable<void> {
    if (this._hideStep) {
      return this._hideStep();
    } else {
      return of(void 0);
    }
  }

  /**
   * Repositions the window and the popover manually
   */
  public tidy(): void {
    this.updatePosition();
    this.updateWindow();
  }

  /**
   * Updates the active popover's overlay position
   */
  public updatePosition(): void {
    if (this._activePopover) {
      this._activePopover.updateOverlayPosition();
    }
  }

  /**
   * Updates the positions of the clip paths for the target element
   */
  public updateWindow(): void {
    if (this._activePopover && this._activePopover?._overlayRef?.backdropElement) {
      this._buildWindow(
        this._steps.get(this._tourGuide.activeStep.name)!.element.nativeElement.getBoundingClientRect(),
        this._activePopover._overlayRef,
      );
    }
  }

  /**
   * Removes backdrop and clip path divs for the active step
   */
  public removeWindow(): void {
    if (this._removeWindowHandler) {
      this._removeWindowHandler();
    }
  }

  /**
   * Finds the step to show if it exists or when it is dynamically registered from the subject
   * @param event Optional event object to emit
   */
  private _goToStep(event?: GhostRiderEvent, asyncOverride?: boolean): void {
    if (this._tourGuide.activeStep) {
      this.hideStep().subscribe(() => {

        if (event) {
          this.events$.next(event);
        }

        if (this._subs.has(SubKeys.StepAdded)) {
          const stepAdded = this._subs.get(SubKeys.StepAdded);
          if (stepAdded) {
            stepAdded.unsubscribe();
            this._subs.delete(SubKeys.StepAdded);
          }
        }

        const hasStep = this._steps.has(this._tourGuide.activeStep.name);

        if (asyncOverride !== undefined) {
          this._isAsync = asyncOverride;
        } else {
          this._isAsync = !hasStep;
        }

        if (hasStep) {
          this._showStep();
        } else {
          this._subs.set(
            SubKeys.StepAdded,
            this._stepAdded$.pipe(
              first((step) => step === this._tourGuide.activeStep.name),
            ).subscribe(() => {
              this._showStep();
            }),
          );
        }
      });
    } else {
      // There isn't a next step so just end the tour
      this.close();
    }
  }

  /**
   * Destroys the active popover and creates the new popover for the desired step
   */
  private _showStep(): void {
    const { element, vcr, config, active$ } = this._steps.get(this._tourGuide.activeStep.name) as GhostRiderStepDetails;
    const popover = this._activePopover = this._popoverFactory.createPopover(element, { vcr });

    // Assign a tear down function for the active step
    this._hideStep = (): Observable<void> => {
      popover.hide();
      active$.next(false);
      // this._removeMask();
      this._renderer.removeClass(
        element.nativeElement,
        ACTIVE_TARGET_CLASS
      );

      if (this._activePopover === popover) {
        this._activePopover = null as unknown as Popover<any>;
      }
      this._hideStep = null as unknown as () => Observable<void>;

      return defer(() => {
        return popover.popoverInstance!.afterHidden().pipe(
          startWith(null as any),
          last(),
        );
      });
    };

    // Custom class that we can use too style the target element
    this._renderer.addClass(
      element.nativeElement,
      ACTIVE_TARGET_CLASS
    );

    popover.position = config.position;
    popover.nubbinPosition = config.nubbinPosition;
    popover.content = config.content;
    popover.popoverType = GhostRiderStepComponent;

    if (config.beforeActivate) {
      config.beforeActivate();
    }

    // Remove old backdrop and clip paths
    this.removeWindow();
    // TODO: rethink some of this logic and design
    if (this._tourGuide.activeStep.parent) {
      this._isAsync = true;
    }
    // Show new popover step
    popover.show(0);
    // Set props on step component
    (popover.popoverInstance as GhostRiderStepComponent).details = config;
    // Assign new backdrop and clip path destroyer
    this._removeWindowHandler = () => {
      this._removeWindow(popover._overlayRef?.backdropElement as HTMLElement);
    };

    if (this._isAsync) {
      // Wait for popover component to be visible before adding styles
      const afterVisibleSub = popover.popoverInstance?.afterVisible().subscribe(() => {
        this._buildWindow(element.nativeElement.getBoundingClientRect(), popover._overlayRef as OverlayRef);
        active$.next(true);
        afterVisibleSub?.unsubscribe();
      });
    } else {
      // Since this isn't async, we can just build the new backdrop and set styles ASAP
      this._buildWindow(element.nativeElement.getBoundingClientRect(), popover._overlayRef as OverlayRef);
    }
  }

  /**
   * Creates the clip path in the backdrop and an inner inset clip path to round the edges
   *
   * TODO: fix the slight edges that are showing between the inner and outter clip paths
   * @param rect The rectangle dimensions to clip
   * @param overlayRef The overlay element
   */
  private _buildWindow(rect: DOMRect, overlayRef: OverlayRef): void {
    // if (this._tourGuide.activeStep.preventClicks && !this._uiMask) {
    //   // Make div to prevent actions
    //   this._uiMask = this._renderer.createElement('div');
    //   this._renderer.setStyle(this._uiMask, 'position', 'fixed');
    //   this._renderer.setStyle(this._uiMask, 'height', '100%');
    //   this._renderer.setStyle(this._uiMask, 'width', '100%');
    //   this._renderer.setStyle(this._uiMask, 'background-color', 'transparent');
    //   this._renderer.setStyle(this._uiMask, 'zIndex', '8999');
    //   this._renderer.setStyle(this._uiMask, 'pointerEvents', 'all');
    //   this._renderer.insertBefore(overlayRef.backdropElement.parentElement, this._uiMask, overlayRef.backdropElement);
    // }

    this._renderer.setStyle(overlayRef.backdropElement?.nextSibling, 'zIndex', 9001);
    this._renderer.setStyle( // Should we remove this style on tear down?
      overlayRef.backdropElement,
      'clipPath',
      `polygon(
          0% 0%,
          0% 100%,
          ${rect.left}px 100%,
          ${rect.left}px ${rect.top}px,
          ${rect.right}px ${rect.top}px,
          ${rect.right}px ${rect.bottom}px,
          ${rect.left}px ${rect.bottom}px,
          ${rect.left}px 100%,
          100% 100%,
          100% 0%
        )`,
    );

    if (!overlayRef.backdropElement?.firstChild) {
      this._renderer.appendChild(overlayRef.backdropElement, this._renderer.createElement('div'));
    }

    const buffer = 5;
    const borderRadius = buffer;
    const distributionSize = buffer / 2;

    if (overlayRef.backdropElement?.firstChild) {
      this._renderer.setStyle(overlayRef.backdropElement.firstChild, 'position', 'absolute');
      this._renderer.setStyle(overlayRef.backdropElement.firstChild, 'background', 'white');
      this._renderer.setStyle(overlayRef.backdropElement.firstChild, 'width', `${rect.width + buffer}px`);
      this._renderer.setStyle(overlayRef.backdropElement.firstChild, 'height', `${rect.height + buffer}px`);
      this._renderer.setStyle(overlayRef.backdropElement.firstChild, 'clipPath', `inset(0 round ${borderRadius}px)`);
      this._renderer.setStyle(overlayRef.backdropElement.firstChild, 'inset', `${rect.y - distributionSize}px 0 0 ${rect.x - distributionSize}px`);
    }
  }

  /**
   * Removes the custom backdrop styles and inset clip path div
   * @param backdrop The backdrop overlay element
   */
  private _removeWindow(backdrop: HTMLElement): void {
    if (backdrop) {
      this._renderer.removeClass(backdrop, 'ghost-rider-backdrop');
      if (backdrop.firstChild) {
        this._renderer.removeChild(backdrop, backdrop.firstChild);
      }
    }

    // this._removeMask();
  }

  // /**
  //  * Removes the masking div to prevent clicks
  //  */
  // private _removeMask(): void {
  //   if (this._uiMask) {
  //     this._uiMask.remove();
  //     this._uiMask = null;
  //   }
  // }
}
