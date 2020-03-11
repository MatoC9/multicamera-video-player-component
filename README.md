# Multicamera Video Player Component

Multicamera Video Player Component for Vue.

This component uses [Plyr](https://github.com/sampotts/plyr) as video player and [hls.js](https://github.com/video-dev/hls.js/) for playing HLS videos.

Created by Čupka Matej as part of diploma thesis.

## Screenshot

[<img src="https://github.com/MatoC9/multicamera-video-player-component/raw/master/screenshots/Screenshot.gif" title="Click to enlarge" width="320">](https://github.com/MatoC9/multicamera-video-player-component/raw/master/screenshots/Screenshot.gif)

## Example

Example Vue file:
```html
<template>
  <div id="app">
    <multicamera-video-player width="640px"
                             :autoplay="true"
                             :muted="true"
                             :cameras="cameras"/>
  </div>
</template>

<script>
    import MulticameraVideoPlayer from 'multicamera-video-player-component';

    export default {
        name: 'app',
        components: {
            MulticameraVideoPlayer
        },
        data() {
            return {
                cameras: {
                    Apple_2010: {
                        src: 'http://qthttp.apple.com.edgesuite.net/1010qwoeiuryfg/sl.m3u8',
                        cameraPositions: {
                            Apple_2019_09: [20, 80],
                            Apple_2019_06: [30, 80]
                        }
                    },
                    Apple_2019_06: {
                        src: 'https://p-events-delivery.akamaized.net/3004qzusahnbjppuwydgjzsdyzsippar/m3u8/hls_vod_mvp.m3u8',
                        cameraPositions: {
                            Apple_2010: [20, 20],
                            Apple_2019_09: [50, 40]
                        }
                    },
                    Apple_2019_09: {
                        src: 'https://p-events-delivery.akamaized.net/0208bkzcptukmgbpuqyfyqjhkxxtzwaw/m3u8/hls_vod_mvp.m3u8',
                        cameraPositions: {
                            Apple_2010: [80, 20],
                            Apple_2019_06: [70, 20]
                        }
                    }
                }
            };
        },
    }
</script>
```

## Installation
### Installation via npm
Install the package by entering this command in your project's root directory:
```sh
$ npm install multicamera-video-player-component
```

Add import to your Vue file:
```javascript
import MulticameraVideoPlayer from 'multicamera-video-player-component';
```

Add reference of MulticameraVideoPlayer to components object:
```javascript
components: {
    ...
    MulticameraVideoPlayer
}
```

Add the multicamera video player component to your HTML:
```html
<multicamera-video-player width="640px"
                         :autoplay="true"
                         :muted="true"
                         :cameras="CAMERAS_OBJECT"/>
```

### Installation via CDN
Add these script tags to your `<head>` element: 
```html
<script src="https://unpkg.com/uuid@7.0.2/dist/umd/uuid.min.js"></script>
<script src="https://unpkg.com/plyr@3.5.10/dist/plyr.min.js"></script>
<script src="https://unpkg.com/hls.js@0.13.2/dist/hls.js"></script>
<script src="https://unpkg.com/multicamera-video-player-component@0.1.2/dist/multicamera-video-player.min.js"></script>
```

Add the multicamera video player component to your HTML:
```html
<multicamera-video-player width="640px"
                         :autoplay="true"
                         :muted="true"
                         :cameras="CAMERAS_OBJECT"/>
```

## Component attributes

| Attribute | Type    | Required | Default value |
| --------- | ------- | -------- | ------------- |
| width     | String  | No       | 100%          |
| height    | String  | No       | 100%          |
| autoplay  | Boolean | No       | true          |
| volume    | Number  | No       | 50            |
| muted     | Boolean | No       | false         |
| cameras   | Object  | Yes      |               |

## Restrictions
This component currently supports only HLS videos
