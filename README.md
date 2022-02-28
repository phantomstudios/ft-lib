# ft-lib

[![NPM version][npm-image]][npm-url]
[![Actions Status][ci-image]][ci-url]
[![PR Welcome][npm-downloads-image]][npm-downloads-url]

A collection of Javascript utils for shareable UI and tracking functionality across Phantom FT sites

## Introduction

currently implemented:

- FTTracking - Consolidated Origami and GA/GTM event tracking for page and interaction events.
- consentMonitor - polls the FT consent cookies set by the approved FT Origami cookie banner to enable/disable the FT Permutive ad tracking
- permutiveVideoUtils - formatted permutive video progress events
- reactPlayerTracking - Video tracking for FT sites implementing videos with [react-player](https://github.com/cookpete/react-player)
- ytIframeEventHandler - Video tracking handler for FT sites with embedded Youtube Iframe API videos.

## Installation

Install this package with `npm`.

```bash
npm i @phntms/ft-lib
```

## Usage

### FTTracking

Shared Origami and GA/GTM tracking implementation that can be used across all Phantom FT sites. Tracking meta data is provided by a config object when first initiated and on subsequent route changes (only required for SPA/NextJS sites).
By default, the implementation will automatically handle FT tracking via `data-gadl` and `data-o-event` HTML attributes. The tracker instance can be added to the global window namespace if custom events are required.
Note: By default the FTTracker instance will load the `consentMonitor` poller, so sites do not need to implement this separately.

The constructor requires the config JSON object (TODO - schema) and optionally accepts an options object:

#### Default options

```
  scrollTrackerSelector: "#o_tracker_scroll",  //top level DOM element selector for scroll tracking
  isCustomGTMEvent: true, //selects between GTM and UA event formats

```

Typical usage:

```Javascript
import { FTTracking } from '@phntms/ft-lib'

//For Wagtail sites, get server-rendered o-tracking-data
const config = JSON.parse(document.getElementById('o-tracking-data').textContent)
window.FTTracker = new FTTracking(config, { scrollTrackerSelector: '#content' })
.
.
window.FTTracker.gtmEvent(`audio player`, '100% progress', window.gtmCategory)
```

### consentMonitor

Adds an FT consent cookie poller to enable/disable Permutive consent (only useful if 'consentRequired' is set as an option in the site's Permutive script - see [here](https://support.permutive.com/hc/en-us/articles/360010845519-Seeking-User-Consent#h_00327830-509b-422a-952b-1906264031f1)
There are optional constructor args for the hostname (defaults to window.location.hostname) and the dev environment host matches (defaults to ["localhost", "phq", "vercel.app"]) which are used to determine development environments in order to generate an FT banner event listener ((see [here](https://registry.origami.ft.com/components/o-cookie-message@6.0.1/readme?brand=master) for a list of banner DOM events) to set session-level cookies for development environments

```Javascript
import { consentMonitor } from "@phntms/ft-lib";

new consentMonitor("FT.staging.testsite.com". ["localhost", "phq", "staging"]);
```

### permutiveVideoUtils

emitPermutiveProgressEvents - used within a video player's progress event handler to fire Permutive video progress events at [0, 25, 50, 75, 100] percent progress.
Optional 3rd arg to pass a window.interval instance to be cleared once progress is complete.

```Javascript
import { permutiveVideoUtils } from "@phntms/ft-lib";

const permutivevideoTracker = new permutiveVideoUtils("<FT-CAMPAIGN>","<VIDEO-TITLE>","<VIDEO-ID/URL>")  //Data will be site implementation specific

player.on("progress", () => {   //event will be video player site implementation specific
   permutivevideoTracker.emitPermutiveProgressEvent(<DURATION>, <CURRENTTIME>, <OPTIONAL-WINDOW-INTERVAL>)
});
```

### reactPlayerTracking

Exports video event handlers that broadcast the required GA, oTracking and Permutive events.

The constructor takes the parent site's FTTracking instance (typically set up as window.FTTracker) and video and site meta data (as required for the tracking data).

Typical implementation:

```Javascript
import { reactPlayerTracking } from "@phntms/ft-lib";

const [videoTracker] = useState(
   new reactPlayerTracking(window.FTTracker, <VIDEO-TITLE>, <VIDEO-URL>),
)

<ReactPlayer
   onDuration={videoTracker.setDuration}
   onEnded={videoTracker.trackEnded}
   onPause={videoTracker.trackPause}
   onPlay={videoTracker.trackPlay}
   onProgress={videoTracker.trackProgress}
>
```

### ytIframeTracking

Exports a Youtube iframe event handler for sites using the Youtube Iframe API that broadcasts the required GA, oTracking and Permutive events.
The Youtube iFrame can be either generated in the site's JS or template rendered.

The constructor takes the parent site's FTTracking instance (typically set up as window.FTTracker).

NOTE: For Typescript usage as below, the @types/youtube NPM package should be added to the parent project and the YT namespace added to tsconfig.json with the `"types": ["youtube"]` compiler option.

Typical implementation:

```Javascript
import { ytIframeTracking } from '@phntms/ft-lib';

const VIDEO_IFRAME_ID = 'video-iframe';

export class YoutubeIframeLoader {
  videoTracker: ytIframeTracking;
  player?: YT.Player;

  constructor() {
   this.videoTracker = new ytIframeTracking(window.FTTracker);

   window.onYouTubeIframeAPIReady =
    (event: YT.PlayerEvent) => {
      this.player = new YT.Player(VIDEO_IFRAME_ID, {
        events: {
          'onStateChange': (event) => this.onPlayerStateChange(event)
        }
      });
    };

   onPlayerStateChange(event: YT.PlayerEvent) {
    this.videoTracker.ytIframeEventHandler(event);
   }
  }
}
```

[npm-image]: https://img.shields.io/npm/v/@phntms/ft-lib.svg?style=flat-square&logo=react
[npm-url]: https://npmjs.org/package/@phntms/ft-lib
[npm-downloads-image]: https://img.shields.io/npm/dm/@phntms/ft-lib.svg
[npm-downloads-url]: https://npmcharts.com/compare/@phntms/ft-lib?minimal=true
[ci-image]: https://github.com/phantomstudios/ft-lib/workflows/test/badge.svg
[ci-url]: https://github.com/phantomstudios/ft-lib/actions
