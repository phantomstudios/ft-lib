/** FT tracking video event handlers for React-Player event handler props (onEnded, onPause, onPlay, onProgress) */
import Debug from "debug";

import { permutiveVideoUtils } from "../permutiveVideoUtils";
const debug = Debug("@phntms/ft-lib");

interface Options {
  isPermutiveTracking?: boolean;
  routeUrl?: string;
  /** video/article/stream  */
  category?: string;
  /** paid-post */
  product?: string;
}

const DEFAULT_OPTIONS = {
  isPermutiveTracking: false,
  routeUrl: typeof window !== "undefined" ? window.location.href : undefined,
  category: "Video",
  product: "paid-post",
};

interface PlayerProgressEvent {
  played: number;
  loaded: number;
  playedSeconds: number;
  loadedSeconds: number;
}

export class reactPlayerTracking {
  duration = 0;
  playedSeconds = 0;
  playedPercent = 0;
  oTrackingEvent: ({}) => void;
  gaDataLayer: Window["dataLayer"];
  videoTitle: string;
  videoUrl: string;
  campaign: string;
  options: Options;
  /** 100% is fired with ended event */
  GA_milestones: number[] = [1, 25, 50];
  oTracking_milestones: number[] = [25, 50, 75];
  permutiveTracker: permutiveVideoUtils | undefined;

  constructor(
    /** oTracking dispatch event function */
    oTrackingEvent: any,
    /** video page title */
    videoTitle: string,
    /** video/youtube url or youtube ID */
    videoUrl: string,
    /** From brand tracking template, e.g.  Shaping Digital Future */
    campaign: string,
    /** optional config */
    options?: Options
  ) {
    this.oTrackingEvent = oTrackingEvent;
    this.gaDataLayer = typeof window !== "undefined" && window.dataLayer;
    this.videoTitle = videoTitle;
    this.videoUrl = videoUrl;
    this.campaign = campaign;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    if (this.options.isPermutiveTracking) {
      this.permutiveTracker = new permutiveVideoUtils(
        campaign,
        videoTitle,
        videoUrl
      );
    }
  }

  setDuration = (duration: number) => {
    this.duration = Math.floor(duration);
  };

  sendGAEvent = (action: string) => {
    if (this.gaDataLayer) {
      debug("GA datalayer push - " + action);
      this.gaDataLayer.push({
        event: "customEvent",
        action: action,
        category: this.options.category,
        label: this.videoTitle,
      });
    }
  };

  sendoTrackingEvent = (action: string, progress?: number) => {
    debug("oTracking event - " + action);
    this.oTrackingEvent({
      category: this.options.category,
      action: action,
      product: this.options.product,
      app: this.options.category,
      duration: this.duration,
      progress: progress ? `${progress}%` : `${this.playedPercent}%`,
      url: this.options.routeUrl,
    });
  };

  trackPlay = () => {
    this.sendGAEvent("playing");
    this.sendoTrackingEvent("playing");
  };

  trackPause = () => {
    this.sendGAEvent("pause");
    this.sendoTrackingEvent("pause");
  };

  trackEnded = () => {
    //fire 100% progress events
    this.sendGAEvent("100% watched");
    this.sendoTrackingEvent("progress", 100);

    this.sendGAEvent("ended");
    this.sendoTrackingEvent("ended", 100);
  };

  trackProgress = (reactPlayerProgress: PlayerProgressEvent) => {
    this.playedSeconds = reactPlayerProgress.playedSeconds;
    if (this.duration > 0) {
      this.playedPercent = Math.floor(
        (Math.ceil(reactPlayerProgress.playedSeconds) / this.duration) * 100
      );
    }

    while (this.playedPercent >= this.GA_milestones[0]) {
      debug("GA progress milestone - " + this.GA_milestones[0]);
      this.sendGAEvent(`${this.GA_milestones[0]}% watched`);
      this.GA_milestones.shift();
    }

    while (this.playedPercent >= this.oTracking_milestones[0]) {
      debug("oTracking progress milestone - " + this.oTracking_milestones[0]);
      this.sendoTrackingEvent("progress", this.oTracking_milestones[0]);
      this.oTracking_milestones.shift();
    }

    //permutive only tracks progress events and contains its own milestones
    if (this.options.isPermutiveTracking) {
      debug("edit permutive progress event- " + this.playedSeconds);
      this.permutiveTracker?.emitPermutiveProgressEvent(
        this.duration,
        this.playedSeconds
      );
    }
  };
}
