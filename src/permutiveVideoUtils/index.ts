import Debug from "debug";
const debug = Debug("@phntms/ft-lib");
export class permutiveVideoUtils {
  protected progressPermutiveMilestones: number[] = [0, 0.25, 0.5, 0.75, 1];
  protected _campaign: string;
  protected _title: string;
  protected _videoId: string;

  constructor(campaign: string, title: string, videoId: string) {
    this._campaign = campaign;
    this._title = title;
    this._videoId = videoId;
  }

  get remainingProgress(): number[] {
    return this.progressPermutiveMilestones;
  }

  emitPermutiveProgressEvent = (
    duration: number,
    currentTime: number,
    interval: any = undefined
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
