// 1. Declare Global Window Types for TCF API
declare global {
  interface Window {
    __tcfapi?: (
      command: string,
      version: number,
      callback: (tcData: TCFData | null, success: boolean) => void,
      parameter?: any,
    ) => void;
  }
}

interface TCFData {
  eventStatus: "tcloaded" | "useractioncomplete" | "cmpuishown";
  listenerId: number;
  purpose?: {
    consents?: Record<number, boolean>;
  };
  vendor?: {
    consents?: Record<number, boolean>;
  };
}

export interface VendorConsentResults {
  brandmetrics: boolean;
  linkedIn: boolean;
  purpose1: boolean;
}

// 2. Main Implementation Function
export function initVendorConsentListener(
  onConsentUpdate: (results: VendorConsentResults) => void,
): void {
  if (typeof window.__tcfapi !== "function") {
    console.warn("[CMP] window.__tcfapi is not defined on this page yet.");
    return;
  }

  window.__tcfapi("addEventListener", 2, (tcData, success) => {
    if (!success || !tcData) return;

    // Handles BOTH returning visitors ('tcloaded') AND live banner accepts ('useractioncomplete')
    const isConsentReady =
      tcData.eventStatus === "tcloaded" ||
      tcData.eventStatus === "useractioncomplete";

    if (isConsentReady) {
      // Brandmetrics (IAB Vendor ID: 422)
      const brandmetrics = tcData.vendor?.consents?.[422] === true;

      // LinkedIn (IAB Vendor ID: 804)
      const linkedIn = tcData.vendor?.consents?.[804] === true;

      // Purpose 1: Device storage/access (Cookies)
      const purpose1 = tcData.purpose?.consents?.[1] === true;

      const results: VendorConsentResults = {
        brandmetrics,
        linkedIn,
        purpose1,
      };

      // Trigger your callback handler with the updated states
      onConsentUpdate(results);

      // Clean up listener after handling the event
      if (typeof tcData.listenerId === "number") {
        window.__tcfapi?.(
          "removeEventListener",
          2,
          () => {},
          tcData.listenerId,
        );
      }
    }
  });
}
