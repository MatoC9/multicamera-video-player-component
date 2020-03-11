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
    <MulticameraVideoPlayer width="640px"
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
                    abcNews: {
                        src: 'https://content.uplynk.com/channel/3324f2467c414329b3b0cc5cd987b6be.m3u8',
                        cameraPositions: {
                            Apple_2010: [20, 20]
                        }
                    },

                    Apple_2010: {
                        src: 'http://qthttp.apple.com.edgesuite.net/1010qwoeiuryfg/sl.m3u8',
                        cameraPositions: {
                            abcNews: [80, 80],
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
                            abcNews: [20, 20],
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

Add the multicamera video player component to your HTML:
```html
<MulticameraVideoPlayer width="640px"
                        :autoplay="true"
                        :muted="true"
                        :cameras="CAMERAS_OBJECT"/>
```

### Installation via CDN
TODO

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
