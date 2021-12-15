import Debug from "debug";
const debug = Debug("@phntms/ft-lib");

const DEFAULT_DEV_HOSTS = ["localhost", "phq", ".app", "preview"];

export class consentMonitor {
  protected _consent = false;
  protected _devHosts: string[];
  protected _isDevEnvironment = false;
  protected _hostname: string;
  protected _isInitialized = false;

  constructor(hostname?: string, devHosts?: string[] | string) {
    if (Array.isArray(devHosts)) {
      this._devHosts = devHosts.concat(DEFAULT_DEV_HOSTS);
    } else if (devHosts === undefined) {
      this._devHosts = DEFAULT_DEV_HOSTS;
    } else {
      this._devHosts = DEFAULT_DEV_HOSTS;
      this._devHosts.push(devHosts);
    }

    this._hostname = hostname || window.location.hostname;
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
    this._devHosts.map(
      (devHost) =>
        this._hostname.includes(devHost) && this.setDevCookieHandler()
    );
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
