import { Attention } from "./attention";
import "./intersectionObserverPolyfill";

export class ScrollTracker {
  constructor(oTracker) {
    this.config = oTracker.config;
    this.options = oTracker.options;
    this.eventDispatcher = oTracker.eventDispatcher;
    this.attention = new Attention(this.config);
    this.scrollDepthInit([25, 50, 75, 100], this.options.scrollTrackerSelector);
  }

  reset() {
    document.querySelectorAll("[data-percentage]").forEach((element) => {
      element.remove();
    });
    this.attention = new Attention(this.config);
    this.scrollDepthInit([25, 50, 75, 100], this.options.scrollTrackerSelector);
  }

  scrollDepthInit(percentages, selector) {
    const element = document.querySelector(selector);
    if (element && window.IntersectionObserver) {
      const observer = new IntersectionObserver((changes) => {
        this.intersectionCallback(this, changes);
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
        targetEl.setAttribute("data-percentage", percentage);
        element.appendChild(targetEl);
        observer.observe(targetEl);
      });
    }
  }

  intersectionCallback(observer, changes) {
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
            attention: this.attention.get(),
          },
          product: this.config.product,
          source: this.config.product,
          app: this.config.app,
        };

        this.eventDispatcher(data);

        if (scrollDepthMarkerEl.parentNode) {
          scrollDepthMarkerEl.parentNode.removeChild(scrollDepthMarkerEl);
        }
      }
    });
  }
}
