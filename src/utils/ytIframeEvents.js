import { permutiveVideoUtils } from "../permutiveVideoUtils";

const progressPercentage = (duration, currentTime) =>
  ((currentTime / duration) * 100).toFixed(2);
const progressMilestones = [1, 25, 50, 75];

const emitProgressEvents = (progress, duration, isYoutube) => {
  while (progress >= progressMilestones[0]) {
    window.gtmEvent(
      `Video${window.isOvideoPlayer ? ":fallback" : ""}`,
      `${progressMilestones[0]}% watched`,
      `${window.gtmCategory} - Progress`
    );
    if (isYoutube) {
      eventDispatcher({
        category: "video",
        action: "progress",
        duration: duration,
        progress,
      });
    }
    progressMilestones.shift();
  }
};
const campaign = window.gtmCategory.split(" - ")[1];
const title = window.gtmCategory.split(" - ")[2];
let permutiveUtils;
let videoProgressInterval;

export const OVideoEventHandler = function (videoEl) {
  window.isOvideoPlayer = true;
  permutiveUtils = new permutiveVideoUtils(
    campaign,
    title,
    videoEl.getAttribute("src")
  );
  videoEl.addEventListener("play", () => {
    playTracking(videoEl.currentTime, videoEl.duration);
  });
  videoEl.addEventListener("progress", () => {
    progressTracking(videoEl.currentTime, videoEl.duration);
  });
  videoEl.addEventListener("seeked", () => {
    seekedTracking(videoEl.currentTime, videoEl.duration);
  });
  videoEl.addEventListener("pause", () => {
    pausedTracking(videoEl.currentTime, videoEl.duration);
  });
  videoEl.addEventListener("ended", () => {
    endedTracking(videoEl.currentTime, videoEl.duration);
  });
};

export const YtVideoEventHandler = function (player) {
  window.isOvideoPlayer = false;
  permutiveUtils = new permutiveVideoUtils(
    campaign,
    title,
    player.id_.replace("vid-", "")
  );

  player.on("play", () => {
    playTracking(player.currentTime(), player.duration());
  });
  player.on("progress", () => {
    progressTracking(player.currentTime(), player.duration());
  });
  player.on("seeked", () => {
    seekTracking(player.currentTime(), player.duration());
  });
  player.on("pause", () => {
    pausedTracking(player.currentTime(), player.duration());
  });
  player.on("ended", () => {
    endedTracking(player.currentTime(), player.duration());
  });
};

export const YtIframeEventHandler = function (event) {
  const player = event.target;
  permutiveUtils = new permutiveVideoUtils(
    campaign,
    title,
    player.playerInfo.videoUrl
  );

  switch (event.data) {
    case 0:
      endedTracking(player.getCurrentTime(), player.getDuration());
      break;
    case 1:
      ytPlayTracking(player);
      break;
    case 2:
      setTimeout(function () {
        if (player.getPlayerState() == 2) {
          pausedTracking(player.getCurrentTime(), player.getDuration());
        }
      }, 1000);

      break;
  }
};
/*** shared videojs and origami player tracking  ***/
const ytPlayTracking = function (player) {
  videoProgressInterval = window.setInterval(() => {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    permutiveUtils.emitPermutiveProgressEvent(
      duration - 1,
      currentTime,
      videoProgressInterval
    );
    const progress = progressPercentage(duration, currentTime);
    emitProgressEvents(progress, duration, true);
  }, 1000);
  const currentTime = player.getCurrentTime();
  const duration = player.getDuration();
  const progress = progressPercentage(duration, currentTime);
  if (progress < 1) {
    eventDispatcher({
      category: "video",
      action: "playing",
      duration: duration,
      progress,
    });
  }
};

/*** shared videojs and origami player tracking  ***/
const playTracking = function (currentTime, duration) {
  videoProgressInterval = window.setInterval(() => {
    permutiveUtils.emitPermutiveProgressEvent(
      duration - 1,
      currentTime,
      videoProgressInterval
    );
  }, 1000);
  const progress = progressPercentage(duration, currentTime);
  eventDispatcher({
    category: "video",
    action: "playing",
    duration: duration,
    progress,
  });
};

const progressTracking = function (currentTime, duration) {
  const progress = progressPercentage(duration, currentTime);
  emitProgressEvents(progress, duration, false);
  eventDispatcher({
    category: "video",
    action: "progress",
    duration: duration,
    progress,
  });
};

const seekedTracking = function (currentTime, duration) {
  const progress = progressPercentage(duration, currentTime);
  emitProgressEvents(progress, duration, false);
  eventDispatcher({
    category: "video",
    action: "seek",
    duration: duration,
    progress,
  });
};

const pausedTracking = function (currentTime, duration) {
  const progress = progressPercentage(duration, currentTime);
  eventDispatcher({
    category: "video",
    action: "pause",
    duration: duration,
    progress,
  });
};

const endedTracking = function (currentTime, duration) {
  const progress = progressPercentage(duration, currentTime);
  window.gtmEvent(
    `Video${window.isOvideoPlayer ? ":fallback" : ""}`,
    `100% watched`,
    `${window.gtmCategory} - Progress`
  );
  eventDispatcher({
    category: "video",
    action: "ended",
    duration: duration,
    progress,
  });
  //force a 100% event on end
  if (permutiveUtils.progressPermutiveMilestones > 0) {
    permutiveUtils.emitPermutiveProgressEvent(
      currentTime,
      currentTime,
      videoProgressInterval
    );
  }
};
