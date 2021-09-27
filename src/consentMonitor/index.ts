import Debug from "debug";
const debug = Debug("@phntms/ft-lib");

export class consentMonitor {
  protected _consent = false;
  protected _devHosts: string[] | string;
  protected _isDevEnvironment = false;
  protected _hostname: string;
  protected _isInitialized = false;

  constructor(
    hostname: string = window.location.hostname,
    devHosts: string[] | string = ["localhost", "phq", "vercel.app"]
  ) {
    this._devHosts = devHosts;
    this._hostname = hostname;
    this.init();
  }

  get consent(): boolean {
    return this._consent;
  }

  get devHosts(): string[] | string {
    return this._devHosts;
  }

  get isDevEnvironment(): boolean {
    return this._isDevEnvironment;
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  getCookieValue = (name: string) =>
    document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)")?.pop() || "";

  init = () => {
    this.cookieConsentTest();
    global.setInterval(this.cookieConsentTest, 3000);

    //Simulate cookie consent behaviour in non-prod environments
    if (Array.isArray(this._devHosts)) {
      this._devHosts.map(
        (devHost) =>
          this._hostname.includes(devHost) && this.setDevCookieHandler()
      );
    } else {
      if (this._hostname.includes(this._devHosts)) this.setDevCookieHandler();
    }
  };

  cookieConsentTest = () => {
    if (window.permutive) {
      if (!this._isInitialized) {
        if (
          this.getCookieValue("FTConsent").includes("behaviouraladsOnsite%3Aon")
        ) {
          this.permutiveConsentOn();
        } else {
          this.permutiveConsentOff();
        }
        this._isInitialized = true;
      } else if (
        this.getCookieValue("FTConsent").includes(
          "behaviouraladsOnsite%3Aon"
        ) &&
        !this.consent
      ) {
        debug("setting permutive tracking consent: on");
        this.permutiveConsentOn();
      } else if (
        !this.getCookieValue("FTConsent").includes(
          "behaviouraladsOnsite%3Aon"
        ) &&
        this.consent
      ) {
        debug("setting permutive tracking consent: off");
        this.permutiveConsentOff();
      }
    }
  };

  setDevCookieHandler = () => {
    this._isDevEnvironment = true;
    debug("setting development environment from host match");
    const oCookieMessage =
      document.getElementsByClassName("o-cookie-message")[0];
    if (oCookieMessage) {
      const onCookieMessageAct = () => {
        debug("setting development FT consent cookies");
        document.cookie = "FTConsent=behaviouraladsOnsite%3Aon";
        document.cookie = "FTCookieConsentGDPR=true";
        oCookieMessage.removeEventListener(
          "oCookieMessage.act",
          onCookieMessageAct,
          false
        );
      };
      oCookieMessage.addEventListener("oCookieMessage.act", onCookieMessageAct);
    }
  };

  permutiveConsentOn = () => {
    window.permutive.consent({
      opt_in: true,
      token: "behaviouraladsOnsite:on",
    });
    this._consent = true;
  };

  permutiveConsentOff = () => {
    window.permutive.consent({ opt_in: false });
    this._consent = false;
  };
}
