import {
  initSourcepointCmp,
  interceptManageCookiesLinks,
  properties,
} from "@financial-times/cmp-client";
import Debug from "debug";

import { enqueueCmpCallback, loadFtCmpScript } from "../cmp/loadFtCmp";

const debug = Debug("@phantomstudios/ft-lib/consentMonitor");

const DEFAULT_DEV_HOSTS = ["localhost", "phq", ".app", "preview"];

interface ConsentReadyInfo {
  consentedToAll: boolean;
}
type ConsentReadyHandler = (
  legislation: string,
  uuid: string,
  tcData: unknown,
  info: ConsentReadyInfo,
) => void;
type MessageChoiceHandler = (
  legislation: string,
  choiceId: number,
  choiceTypeId: number,
) => void;

const CMP_CHOICE_ACCEPT_ALL = 11;
const CMP_CHOICE_REJECT_ALL = 13;

export class ConsentMonitor {
  private _consent = false;
  private _devHosts: string[];
  private _isDevEnvironment = false;
  private _isInitialized = false;

  public get consent(): boolean {
    return this._consent;
  }
  public get devHosts(): string[] {
    return this._devHosts;
  }
  public get isDevEnvironment(): boolean {
    return this._isDevEnvironment;
  }
  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  public get userHasConsented(): boolean {
    return this._consent;
  }

  constructor(hostname?: string, devHosts?: string[] | string) {
    if (Array.isArray(devHosts)) {
      this._devHosts = [...devHosts, ...DEFAULT_DEV_HOSTS];
    } else if (devHosts === undefined) {
      this._devHosts = [...DEFAULT_DEV_HOSTS];
    } else {
      this._devHosts = [...DEFAULT_DEV_HOSTS, devHosts];
    }

    const hostToCheck = hostname ?? window.location.hostname;
    this._isDevEnvironment = this._devHosts.some((h) =>
      hostToCheck.includes(h),
    );

    loadFtCmpScript()
      .then(() => {
        this.attachCmpListeners();

        const propertyConfig = window.location.hostname.endsWith("ft.com")
          ? properties["FT_DOTCOM_PROD"]
          : properties["FT_DOTCOM_TEST"];

        // initialize CMP
        initSourcepointCmp({ propertyConfig });
        // use cmp client lib to intercept footer 'Manage Cookies' links (opens privacy modal)
        // Note, function requires very specific link: text = 'Manage Cookies' and href = 'https://ft.com/preferences/manage-cookies'
        interceptManageCookiesLinks();
        this._isInitialized = true;
      })
      .catch((err) => console.error(err));
  }

  private attachCmpListeners(): void {
    enqueueCmpCallback(() => {
      const onReady: ConsentReadyHandler = (_l, _u, _t, info) => {
        debug("onConsentReady:", info);
        if (info.consentedToAll) {
          this.enablePermutive();
        } else {
          this.disablePermutive();
        }
      };

      const onChoice: MessageChoiceHandler = (_l, _c, typeId) => {
        debug("onMessageChoiceSelect:", typeId);
        if (typeId === CMP_CHOICE_ACCEPT_ALL) this.enablePermutive();
        else if (typeId === CMP_CHOICE_REJECT_ALL) this.disablePermutive();
      };

      window._sp_.addEventListener?.("onConsentReady", onReady);
      window._sp_.addEventListener?.("onMessageChoiceSelect", onChoice);
    });
  }

  private enablePermutive(): void {
    if (this._consent) return;
    debug("Permutive consent: ON");
    window.permutive?.consent({
      opt_in: true,
      token: "behaviouraladsOnsite:on",
    });
    this._consent = true;
  }

  private disablePermutive(): void {
    if (!this._consent) return;
    debug("Permutive consent: OFF");
    window.permutive?.consent({ opt_in: false });
    this._consent = false;
  }
}

export { ConsentMonitor as consentMonitor };
