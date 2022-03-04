import { FTTracking } from "../FTTracking";
import { permutiveVideoUtils } from "../permutiveVideoUtils";
import { OrigamiEventType } from "../utils/yupValidator";

export class ytIframeTracking {
  FTTracker: FTTracking;
  progressMilestones = [1, 25, 50, 75];
  permutiveUtils: permutiveVideoUtils;
  videoProgressInterval = 0;
  videoTitle: string;
  videoUrl: string | undefined;

  constructor(FTTracker: FTTracking, videoTitle?: string, videoUrl?: string) {
    this.FTTracker = FTTracker;
    this.videoTitle = videoTitle || window.location.pathname;
    this.videoUrl = videoUrl;
    this.permutiveUtils = new permutiveVideoUtils(
      this.FTTracker.config.campaign,
      this.videoTitle
    );
  }

  progressPercentage = (duration: number, currentTime: number) =>
    parseInt(((currentTime / duration) * 100).toFixed(2));

  emitProgressEvents = (
    progress: number,
    duration: number,
    isYoutube: boolean
  ) => {
    while (progress >= this.progressMilestones[0]) {
      this.FTTracker.gtmEvent(
        `Video${window.isOvideoPlayer ? ":fallback" : ""}`,
        `${this.progressMilestones[0]}% watched`,
        this.videoTitle
      );
      if (isYoutube) {
        this.FTTracker.oEvent({
          category: "video",
          action: "progress",
          duration: duration,
          progress,
        } as OrigamiEventType);
      }
      this.progressMilestones.shift();
    }
  };

  //Fallback oVideo implemented only on channels - uses shared events so added here for now.
  public oVideoEventHandler(videoEl: HTMLVideoElement) {
    window.isOvideoPlayer = true;
    this.permutiveUtils.videoId = videoEl.getAttribute("src") as string;
    videoEl.addEventListener("play", () => {
      this.playTracking(videoEl.currentTime, videoEl.duration);
    });
    videoEl.addEventListener("progress", () => {
      this.progressTracking(videoEl.currentTime, videoEl.duration);
    });
    videoEl.addEventListener("seeked", () => {
      this.seekedTracking(videoEl.currentTime, videoEl.duration);
    });
    videoEl.addEventListener("pause", () => {
      this.pausedTracking(videoEl.currentTime, videoEl.duration);
    });
    videoEl.addEventListener("ended", () => {
      this.endedTracking(videoEl.currentTime, videoEl.duration);
    });
  }

  public ytIframeEventHandler(event: YT.PlayerEvent) {
    const player = event.target as YT.Player;

    if (!this.videoUrl) {
      this.videoUrl = player.getVideoUrl();
    }
    this.permutiveUtils.videoId = this.videoUrl;
    //player.playerInfo.videoUrl

    switch (player.getPlayerState()) {
      case YT.PlayerState.ENDED:
        this.endedTracking(player.getCurrentTime(), player.getDuration());
        break;
      case YT.PlayerState.PLAYING:
        this.ytPlayTracking(player);
        break;
      case YT.PlayerState.PAUSED:
        //test if still pause after 1 second, otherwise its a seek
        setTimeout(() => {
          if (player.getPlayerState() == YT.PlayerState.PAUSED) {
            this.pausedTracking(player.getCurrentTime(), player.getDuration());
          }
        }, 1000);

        break;
    }
  }

  ytPlayTracking(player: YT.Player) {
    this.videoProgressInterval = window.setInterval(() => {
      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();
      this.permutiveUtils.emitPermutiveProgressEvent(
        duration - 1,
        currentTime,
        this.videoProgressInterval
      );
      const progress = this.progressPercentage(duration, currentTime);
      this.emitProgressEvents(progress, duration, true);
    }, 1000);
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    const progress = this.progressPercentage(duration, currentTime);
    if (progress < 100) {
      this.FTTracker.gtmEvent(
        `Video${window.isOvideoPlayer ? ":fallback" : ""}`,
        `playing`,
        this.videoTitle
      );
      this.FTTracker.oEvent({
        category: "video",
        action: "playing",
        duration: duration,
        progress,
      } as OrigamiEventType);
    }
  }

  pausedTracking(currentTime: number, duration: number) {
    const progress = this.progressPercentage(duration, currentTime);
    this.FTTracker.gtmEvent(
      `Video${window.isOvideoPlayer ? ":fallback" : ""}`,
      `pause`,
      `${this.videoTitle}`
    );
    this.FTTracker.oEvent({
      category: "video",
      action: "pause",
      duration: duration,
      progress,
    } as OrigamiEventType);
  }

  endedTracking(currentTime: number, duration: number) {
    const progress = this.progressPercentage(duration, currentTime);
    this.FTTracker.gtmEvent(
      `Video${window.isOvideoPlayer ? ":fallback" : ""}`,
      `100% watched`,
      `${this.videoTitle}`
    );
    this.FTTracker.oEvent({
      category: "video",
      action: "ended",
      duration: duration,
      progress,
    } as OrigamiEventType);
    //force a 100% event on end
    if (this.permutiveUtils.remainingProgress.length > 0) {
      this.permutiveUtils.emitPermutiveProgressEvent(
        currentTime,
        currentTime,
        this.videoProgressInterval
      );
    }
  }

  /*** Below events only used for FT-Channels videoJS and Origami players - remove if no longer needed ***/

  /*** videojs and origami player event only  ***/
  playTracking(currentTime: number, duration: number) {
    this.videoProgressInterval = window.setInterval(() => {
      this.permutiveUtils.emitPermutiveProgressEvent(
        duration - 1,
        currentTime,
        this.videoProgressInterval
      );
    }, 1000);
    const progress = this.progressPercentage(duration, currentTime);
    this.FTTracker.oEvent({
      category: "video",
      action: "playing",
      duration: duration,
      progress,
    } as OrigamiEventType);
  }

  /*** videojs and origami player event only  ***/
  progressTracking(currentTime: number, duration: number) {
    const progress = this.progressPercentage(duration, currentTime);
    this.emitProgressEvents(progress, duration, false);
    this.FTTracker.oEvent({
      category: "video",
      action: "progress",
      duration: duration,
      progress,
    } as OrigamiEventType);
  }

  /*** videojs and origami player event only  ***/
  seekedTracking(currentTime: number, duration: number) {
    const progress = this.progressPercentage(duration, currentTime);
    this.emitProgressEvents(progress, duration, false);
    this.FTTracker.oEvent({
      category: "video",
      action: "seek",
      duration: duration,
      progress,
    } as OrigamiEventType);
  }
}
