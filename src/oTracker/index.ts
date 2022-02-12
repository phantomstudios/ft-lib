// @ts-ignore
import oTracking from "@financial-times/o-tracking";

import { TrackingOptions } from "../FTTracking";
import { getValueFromCookie } from "../utils/cookies";
import getTrace from "../utils/getTrace";
import { ScrollTracker } from "../utils/scroll";
import {
  validateOrigamiEvent,
  ConfigType,
  OrigamiEventType,
} from "../utils/yupValidator";

/* oTracking setup for server-rendered (i.e. Wagtail) sites
The config object is read from the server-rendered o-tracking-data element
*/
export class oTracker {
  private _config: ConfigType;
  options: TrackingOptions;
  scrollTracker: ScrollTracker;

  constructor(config: ConfigType, options: TrackingOptions) {
    this._config = config;
    this._config.source_id = oTracking.getRootID();
    this.options = options;

    //init config data
    const configData = {
      server: "https://spoor-api.ft.com/px.gif",
      context: {
        ...this._config,
      },
      user: {
        ft_session: getValueFromCookie(/FTSession=([^;]+)/),
      },
    };
    oTracking.init(configData);

    //setup listeners
    this.OTrackingHandler();
    this.scrollTracker = new ScrollTracker(this);

    //send Origami DomLoaded event
    document.dispatchEvent(new CustomEvent("o.DOMContentLoaded"));

    //send page hits
    this.broadcastPageView();
    this.broadcastBrandedContent();
  }

  set config(c: ConfigType) {
    this._config = c;
  }
  get config() {
    return this._config;
  }

  public eventDispatcher(detail: OrigamiEventType) {
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
  }

  public broadcastPageView() {
    oTracking.page({
      app: this.config.app,
      product: this.config.product,
      title: document.title,
    });
  }

  public broadcastBrandedContent() {
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

        this.eventDispatcher(detail as OrigamiEventType);
      }
    });
  }
}
