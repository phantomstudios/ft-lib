import { TrackingOptions } from "../FTTracking";
import { oTracker } from "../oTracker";
import { Attention } from "./attention";
import "./intersectionObserverPolyfill";
import { ConfigType, OrigamiEventType } from "./yupValidator";

export class ScrollTracker {
  oTracker: oTracker;
  options: TrackingOptions;
  attention: any;
  config: ConfigType;
  constructor(oTracker: oTracker) {
    this.oTracker = oTracker;
    this.options = oTracker.options;
    this.config = oTracker.config;

    this.attention = new Attention(this.oTracker);
    this.scrollDepthInit([25, 50, 75, 100], this.options.scrollTrackerSelector);
  }

  reset() {
    document.querySelectorAll("[data-percentage]").forEach((element) => {
      element.remove();
    });
    this.attention = new Attention(this.oTracker);
    this.scrollDepthInit([25, 50, 75, 100], this.options.scrollTrackerSelector);
  }

  scrollDepthInit(percentages: number[], selector = "") {
    const element = document.querySelector(selector);
    if (element && window.IntersectionObserver) {
      const observer = new IntersectionObserver((changes) => {
        this.intersectionCallback(observer, changes);
      });

      percentages.forEach((percentage) => {
        // add a scroll depth marker element
        const targetEl = document.createElement("div");
        targetEl.className = "n-ui__scroll-depth-marker";
        targetEl.style.position = "absolute";
        targetEl.style.top = `${percentage}%`;
        targetEl.style.bottom = "0";
        targetEl.style.width = "100%";
        targetEl.style.zIndex = "-1";
        targetEl.setAttribute("data-percentage", percentage.toString());
        element.appendChild(targetEl);
        observer.observe(targetEl);
      });
    }
  }

  intersectionCallback(
    observer: IntersectionObserver,
    changes: IntersectionObserverEntry[]
  ) {
    changes.forEach((change) => {
      if (change.isIntersecting || change.intersectionRatio > 0) {
        const scrollDepthMarkerEl = change.target;
        const percentagesViewed =
          scrollDepthMarkerEl.getAttribute("data-percentage");
        const data = {
          action: "scrolldepth",
          category: "page",
          meta: {
            percentagesViewed,
          },
          product: this.config.product,
          source: this.config.product,
          app: this.config.app,
        };

        this.oTracker.eventDispatcher(data as OrigamiEventType);

        if (scrollDepthMarkerEl.parentNode) {
          scrollDepthMarkerEl.parentNode.removeChild(scrollDepthMarkerEl);
        }
      }
    });
  }
}
