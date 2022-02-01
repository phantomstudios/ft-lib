import { validateGTMCustomEvent } from "../utils/yupValidator";
const HEADER_CATEGORY = "Header";
const HEADER_SEARCH_ACTION = "Engagement - Search";

export class gaTracker {
  options;
  constructor(options) {
    this.options = options;
    this.setUpFTNavigationLinksTracking();
    this.addDataAttributesListener();
    this.setUpFTNavigationSearchTracking(HEADER_CATEGORY, HEADER_SEARCH_ACTION);
    this.setupFooterLinksTracking();

    //RFC - window events for code-fired custom events? (i.e. not data-gadl clicks)
    window.gtmEvent = (category, action, label) => {
      validateGTMCustomEvent({ category, action, label });
      //from channels - replace?
      if (category === "<category>") {
        category = window.gtmCategory;
      }
      window.dataLayer.push({
        event: "customEvent",
        category,
        action,
        label,
      });
    };

    window.uaEvent = (category, action, label) => {
      validateGTMCustomEvent({ category, action, label });
      window.dataLayer.push("event", action, {
        event_category: category,
        event_label: label,
      });
    };
  }

  getPropertiesFromDataAttribute(element) {
    const gaEventString = element["getAttribute"]("data-gadl");
    if (!gaEventString) return;
    return gaEventString.split("|");
  }

  addDataAttributesListener() {
    document.body.addEventListener("click", (evt) => {
      const elm = evt.target;
      const gaEventString = elm["getAttribute"]("data-gadl");
      if (!gaEventString) return;
      const [category, action, label] = gaEventString.split("|");
      //TODO validate event fields
      if (typeof window !== "undefined") {
        //TBC - GTM customEvent tag vs standard UA event push?
        if (this.options.isCustomGTMEvent) {
          window.gtmEvent(category, action, label);
        } else {
          window.uaEvent(category, action, label);
        }
      }
    });
  }

  setUpFTNavigationLinksTracking() {
    const FTNavigationLinks = Array.from(
      document.querySelectorAll(".o-header__drawer-menu-link")
    );
    if (FTNavigationLinks) {
      FTNavigationLinks.forEach((navLink) => {
        const trackingValue = `Header|Engagement - Hamburger|${document.URL} - ${navLink.href}`;
        navLink.setAttribute("data-gadl", trackingValue);
      });
    }
  }

  setUpFTNavigationSearchTracking(category, action) {
    const searchForm = document.querySelector(".o-header__search-form");
    if (searchForm) {
      searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const searchBarContent = document.querySelector(
          ".o-header__search-term"
        ).value;
        if (typeof window !== "undefined") {
          window.dataLayer.push("event", action, {
            event_category: category,
            event_label: searchBarContent,
            event_callback: () => {
              searchForm.submit();
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
        const trackingValue = `Footer|Click - Footer Nav|${document.URL} - ${footerLink.href}`;
        footerLink.setAttribute("data-gadl", trackingValue);
      });
    }
  }
}
