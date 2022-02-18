import Debug from "debug";

import { FTTracking } from "../FTTracking";
import { permutiveVideoUtils } from "../permutiveVideoUtils";
import { OrigamiEventType } from "../utils/yupValidator";
const debug = Debug("@phntms/ft-lib");
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
  videoTitle: string;
  videoUrl: string;

  /** 100% is fired with ended event */
  GA_milestones: number[] = [1, 25, 50];
  oTracking_milestones: number[] = [25, 50, 75];
  FTTracker: FTTracking;
  permutiveTracker: permutiveVideoUtils | undefined;

  constructor(FTTracker: FTTracking, videoTitle: string, videoUrl: string) {
    /** oTracking dispatch event function */
    this.FTTracker = FTTracker;
    this.videoTitle = videoTitle;
    this.videoUrl = videoUrl;
    this.permutiveTracker = new permutiveVideoUtils(
      this.FTTracker.config.campaign,
      this.videoTitle,
      this.videoUrl
    );
  }

  setDuration = (duration: number) => {
    this.duration = Math.floor(duration);
  };

  sendGAEvent = (action: string) => {
    debug("GA datalayer push - " + action);
    this.FTTracker.gtmEvent("Video", action, this.videoTitle);
  };

  sendoTrackingEvent = (action: string, progress?: number) => {
    debug("oTracking event - " + action);
    this.FTTracker.oEvent({
      category: "video",
      action: action,
      product: this.FTTracker.config.product,
      app: this.FTTracker.config.app,
      duration: this.duration,
      ...(progress && { progress: progress }),
    } as OrigamiEventType);
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
    debug("edit permutive progress event- " + this.playedSeconds);
    this.permutiveTracker?.emitPermutiveProgressEvent(
      this.duration,
      this.playedSeconds
    );
  };
}
