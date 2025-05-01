import Debug from "debug";
const debug = Debug("@phantomstudios/ft-lib");
export class permutiveVideoUtils {
  protected progressPermutiveMilestones: number[] = [0, 0.25, 0.5, 0.75, 1];
  protected _campaign: string;
  protected _title: string;
  protected _videoId;

  constructor(campaign: string, title: string, videoId = "") {
    this._campaign = campaign;
    this._title = title;
    this._videoId = videoId;
  }

  set videoId(vid: string) {
    this._videoId = vid;
  }
  get videoId() {
    return this._videoId;
  }

  get remainingProgress(): number[] {
    return this.progressPermutiveMilestones;
  }

  emitPermutiveProgressEvent = (
    duration: number,
    currentTime: number,
    interval: any = undefined,
  ) => {
    const progress = currentTime / (Math.floor(duration) - 1);

    while (
      progress >= this.progressPermutiveMilestones[0] &&
      currentTime > 0 &&
      window.permutive
    ) {
      debug("Emit videoEngagement permutive event");
      window.permutive.track("VideoEngagement", {
        campaign: this._campaign,
        createdAt: new Date().toISOString(),
        duration: Math.floor(duration),
        title: this._title,
        videoId: this._videoId,
        progress: this.progressPermutiveMilestones[0],
      });
      this.progressPermutiveMilestones.shift();
      if (this.progressPermutiveMilestones.length === 0 && interval) {
        window.clearInterval(interval);
      }
    }
  };
}
