export function loadFtCmpScript(): Promise<void> {
  if (document.getElementById("ft-cmp-loader")) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const script: HTMLScriptElement = document.createElement("script");
    script.id = "ft-cmp-loader";
    script.async = true;
    script.src = "https://consent-notice.ft.com/cmp.js";
    script.referrerPolicy = window.location.hostname.endsWith(".ft.com")
      ? "no-referrer-when-downgrade" // production hosts
      : "origin"; // localhost / preview

    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Sourcepoint CMP script failed to load"));

    document.head.appendChild(script);
  });
}

export function enqueueCmpCallback(cb: () => void): void {
  if (!window._sp_) window._sp_ = {};
  if (!window._sp_.queue) window._sp_.queue = [];

  window._sp_.queue!.push(cb);
}
