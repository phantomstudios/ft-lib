import { consentMonitor } from "../consentMonitor";
import { gaTracker } from "../gaTracker";
import { oTracker } from "../oTracker";
import {
  validateConfig,
  ConfigType,
  OrigamiEventType,
  GTMCustomEventType,
} from "../utils/yupValidator";

export interface TrackingOptions {
  scrollTrackerSelector?: string;
  isCustomGTMEvent?: boolean;
}

const DEFAULT_OPTIONS = {
  scrollTrackerSelector: "#o_tracker_scroll",
  isCustomGTMEvent: true,
};

export class FTTracking {
  private _config: ConfigType;
  options: TrackingOptions;
  oTracker: oTracker;
  gaTracker: gaTracker;
  oEvent: (detail: OrigamiEventType) => void;
  gtmEvent: (category: string, action: string, label: string) => void;

  constructor(config: ConfigType, options?: TrackingOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.oTracker = new oTracker(config, this.options);
    this.gaTracker = new gaTracker(this.options);

    this.oEvent = this.oTracker.eventDispatcher;
    this.gtmEvent = this.gaTracker.GTMEventDispatcher;
    this._config = config;

    //cookie consent monitor for permutive tracking
    window.addEventListener("load", () => {
      new consentMonitor(window.location.hostname, [".app", "preview"]);
    });
  }
  set config(c: ConfigType) {
    validateConfig(c);
    this._config = c;
    this.oTracker.config = c;
  }
  get config() {
    return this._config;
  }
}
