// @ts-ignore
import oTracking from "@financial-times/o-tracking";

import { TrackingOptions } from "../FTTracking";
import { getValueFromCookie } from "../utils/cookies";
import getTrace from "../utils/getTrace";
import { ScrollTracker } from "../utils/scroll";
import { validateOrigamiEvent } from "../utils/yupValidator";

/* oTracking setup for server-rendered (i.e. Wagtail) sites
The config object is read from the server-rendered o-tracking-data element
*/
export class oTracker {
  config: any;
  setConfig: any;
  options: TrackingOptions;
  eventDispatcher: any;

  constructor(config: any, options: TrackingOptions) {
    this.setConfig = function (config: any) {
      //TODO validate config
      this.config = config;
      this.config.source_id = oTracking.getRootID();
    };

    this.eventDispatcher = function (detail: any) {
      if (typeof detail === "object" && detail.category && detail.action) {
        validateOrigamiEvent(detail);
        detail.app = this.config.app;
        detail.product = this.config.product;
        document.body.dispatchEvent(
          new CustomEvent("oTracking.event", { detail, bubbles: true })
        );
      } else {
        throw "Invalid event type";
      }
    };

    this.options = options;
    this.setConfig(config);

    //init config data
    const configData = {
      server: "https://spoor-api.ft.com/px.gif",
      context: {
        ...this.config,
      },
      user: {
        ft_session: getValueFromCookie(/FTSession=([^;]+)/),
      },
    };
    oTracking.init(configData);

    //setup listeners
    this.OTrackingHandler();
    new ScrollTracker(this);

    //send Origami DomLoaded event
    document.dispatchEvent(new CustomEvent("o.DOMContentLoaded"));

    //send page hits
    this.broadcastPageView();
    this.broadcastBrandedContent();
  }

  broadcastPageView() {
    oTracking.page({
      app: this.config.app,
      product: this.config.product,
      title: document.title,
    });
  }

  broadcastBrandedContent() {
    document.body.dispatchEvent(
      new CustomEvent("oTracking.event", {
        detail: {
          ...this.config,
          action: "view",
          category: "brandedContent",
        },
        bubbles: true,
      })
    );
  }

  OTrackingHandler() {
    document.body.addEventListener("click", (event) => {
      const trackableElement = event
        .composedPath()
        .find(
          (elm) =>
            elm instanceof HTMLElement &&
            elm.hasAttribute &&
            elm.hasAttribute("data-o-event")
        );
      if (trackableElement && trackableElement instanceof HTMLElement) {
        const data = trackableElement.getAttribute("data-o-event");
        const detail = {};
        const { trace } = getTrace(trackableElement);

        if (data) {
          data.split("|").forEach((item) => {
            const kv = item.split(":");
            //TODO
            // @ts-ignore
            detail[kv[0]] = kv[1];
          });

          //TODO
          // @ts-ignore
          detail.domPathTokens = trace;
        }

        this.eventDispatcher(detail);
      }
    });
  }
}
