import { TrackingOptions } from "../FTTracking";
import { validateGTMCustomEvent } from "../utils/yupValidator";
const HEADER_CATEGORY = "Header";
const HEADER_SEARCH_ACTION = "Engagement - Search";

export class gaTracker {
  options;
  constructor(options: TrackingOptions) {
    this.options = options;
    this.setUpFTNavigationLinksTracking();
    this.addDataAttributesListener();
    this.setUpFTNavigationSearchTracking(HEADER_CATEGORY, HEADER_SEARCH_ACTION);
    this.setupFooterLinksTracking();
  }

  public GTMEventDispatcher(category: string, action: string, label: string) {
    validateGTMCustomEvent({ category, action, label });
    //from channels - sets event categories on window on certain pages..replace?
    if (category === "<category>" && window.gtmCategory) {
      category = window.gtmCategory;
    }
    window.dataLayer.push({
      event: "customEvent",
      category,
      action,
      label,
    });
  }

  public GtagEventDispatcher(category: string, action: string, label: string) {
    validateGTMCustomEvent({ category, action, label });
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
    });
  }

  addDataAttributesListener() {
    document.body.addEventListener("click", (evt) => {
      //get nearest element with data-gadl attribute
      const elm = (evt.target as HTMLElement).closest("[data-gadl]");
      const gaEventString = elm?.getAttribute("data-gadl");
      if (!gaEventString) return;
      const [category, action, label] = gaEventString.split("|");

      //TODO validate event fields
      if (typeof window !== "undefined") {
        //TBC - GTM customEvent tag vs standard UA event push?
        if (this.options.isCustomGTMEvent) {
          this.GTMEventDispatcher(
            category,
            action,
            label || window.location.pathname //use pathname if label section has not been defined
          );
        } else {
          this.GtagEventDispatcher(
            category,
            action,
            label || window.location.pathname
          );
        }
      }
    });
  }

  setUpFTNavigationLinksTracking() {
    const FTNavigationLinks = Array.from(
      document.querySelectorAll(".o-header__drawer-menu-link")
    );
    if (FTNavigationLinks) {
      FTNavigationLinks.map((navLink) => {
        const trackingValue = `Header|Engagement - Hamburger|${
          document.URL
        } - ${(navLink as HTMLAnchorElement).href}`;
        navLink.setAttribute("data-gadl", trackingValue);
      });
    }
  }

  setUpFTNavigationSearchTracking(category: string, action: string) {
    const searchForm = document.querySelector(".o-header__search-form");
    if (searchForm) {
      searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const searchBarContent = (
          document.querySelector(".o-header__search-term") as HTMLInputElement
        )?.value;
        if (typeof window !== "undefined") {
          window.dataLayer.push("event", action, {
            event_category: category,
            event_label: searchBarContent,
            event_callback: () => {
              (searchForm as HTMLFormElement).submit();
            },
          });
        }
      });
    }
  }

  setupFooterLinksTracking() {
    const FTFooterLinks = Array.from(
      document.querySelectorAll(".o-footer__legal-links li a")
    );
    if (FTFooterLinks) {
      FTFooterLinks.forEach((footerLink) => {
        const trackingValue = `Footer|Click - Footer Nav|${document.URL} - ${
          (footerLink as HTMLAnchorElement).href
        }`;
        footerLink.setAttribute("data-gadl", trackingValue);
      });
    }
  }
}
