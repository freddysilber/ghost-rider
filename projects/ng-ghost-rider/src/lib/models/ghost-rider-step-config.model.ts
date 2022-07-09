import { PopoverContent, PopoverNubbinPosition, PopoverPosition } from './ghost-rider-popover.model';

export class GhostRiderStepConfig<T = any> {
  /**
   * The name of the step (should be 'namespaced' to scope step names specific tours. ie. 'tourname.firststep')
   */
  public name: string;
  /**
   * Text that is displayed for the step title
   */
  public title: string;
  /**
   * Label for the back button
   */
  public backButtonLabel: string = 'Back';
  /**
   * Label for the next button
   */
  public nextButtonLabel: string = 'Next';

  /**
   * Flag if the step should get 'registered' as soon as possible
   */
  public shouldRegister: boolean = true;
  /**
   * Flag to disable the back step action
   */
  public backIsDisabled: boolean = false;
  /**
   * Flag to disable the next step action
   */
  public nextIsDisabled: boolean = false;
  /**
   * Flag to hide the step when the next button is clicked
   */
  public nextIsHide: boolean = false;

  /**
   * Postion for the popover. See Angular tooltip: https://github.com/angular/components/blob/main/src/material/tooltip/tooltip.ts 
   */
  public position: PopoverPosition = 'below';
  /**
   * Position for the nubbin
   */
  public nubbinPosition: PopoverNubbinPosition = 'auto';
  /**
   * Step's content. This can be a string, a TemplatePortal, or a ComponentPortal
   */
  public content: PopoverContent<T>;

  /**
   * Function to run before the popover is shown. 'popover.show(0)'
   */
  beforeActivate?: () => unknown;
}