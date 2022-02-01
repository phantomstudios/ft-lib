import { consentMonitor } from "../consentMonitor";
import { gaTracker } from "../gaTracker";
import { oTracker } from "../oTracker";
import { validateConfig } from "../utils/yupValidator";

export interface TrackingOptions {
  scrollTrackerSelector?: string;
  isCustomGTMEvent?: boolean;
}

const DEFAULT_OPTIONS = {
  scrollTrackerSelector: "#o_tracker_scroll",
  isCustomGTMEvent: true,
};

export class FTTracking {
  config: any;
  options: TrackingOptions;
  oTracker: oTracker;
  gaTracker: gaTracker;
  setConfig: any;
  oEvent: any;
  gtmEvent: any;

  constructor(config: any, options?: TrackingOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.oTracker = new oTracker(config, this.options);
    this.gaTracker = new gaTracker(this.options);

    this.oEvent = this.oTracker.eventDispatcher;
    this.gtmEvent = this.gaTracker.GTMEventDispatcher;

    this.setConfig = (config: any) => {
      validateConfig(config);
      this.config = config;
      this.oTracker.setConfig(config);
    };
    this.setConfig(config);
    //cookie consent monitor for permutive tracking
    window.addEventListener("load", () => {
      new consentMonitor(window.location.hostname, [".app", "preview"]);
    });
  }
}
