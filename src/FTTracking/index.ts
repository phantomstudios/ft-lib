import { consentMonitor } from "../consentMonitor";
import { gaTracker } from "../gaTracker";
import { oTracker } from "../oTracker";
import { ScrollTracker } from "../utils/scroll";
import {
  validateConfig,
  ConfigType,
  OrigamiEventType,
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
  scrollTracker: ScrollTracker;
  oEvent: (detail: OrigamiEventType) => void;
  gaEvent: (category: string, action: string, label: string) => void;
  gtmEvent: (category: string, action: string, label: string) => void;

  constructor(config: ConfigType, options?: TrackingOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.oTracker = new oTracker(config, this.options);
    this.gaTracker = new gaTracker(this.options);

    this.oEvent = this.oTracker.eventDispatcher;
    this.gaEvent = this.options.isCustomGTMEvent
      ? this.gaTracker.GTMEventDispatcher
      : this.gaTracker.GtagEventDispatcher;
    this._config = config;

    //backwards compatibility
    this.gtmEvent = this.gaEvent;

    this.scrollTracker = new ScrollTracker(this);

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

  public newPageView(config: ConfigType) {
    //Update passed config to otracker,send pageview events and reset scrollTracker
    this.oTracker.config = config;
    this.oTracker.broadcastPageView();
    this.oTracker.broadcastBrandedContent();
    this.scrollTracker.reset();
    //ga pageview event required for sites without GTM?
  }
}
