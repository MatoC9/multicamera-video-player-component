<template>
  <div class="playerWrapper">
    <div class="playerContainer">
      <div class="playerElement"
           :class="{active: cameraKey === cameraActive}"
           :style="getVideoPosition(cameraKey)"
           :key="cameraKey"
           v-for="cameraKey in cameraKeys">
        <video :ref="cameraKey"
               @click="onClick($event, cameraKey)"/>
      </div>
    </div>
  </div>
</template>

<script>
    /* eslint-disable no-console */
    import * as HLS from 'hls.js';
    import Plyr from 'plyr';
    import {v4 as uuid} from 'uuid';

    export default {
        name: 'MulticameraVideoPlayer',
        props: {
            autoPlay: {
                type: Boolean,
                required: false,
                default: true,
            },
            volume: {
                type: Number,
                required: false,
                default: 50,
            },
            mute: {
                type: Boolean,
                required: false,
                default: false,
            },

            controls: {
                type: Array,
                required: false,
                default: () => ['play-large', 'play', 'mute', 'volume', 'captions', 'settings', 'fullscreen'],
            },

            cameras: {
                type: Object,
                required: true,
            }
        },
        data() {
            return {
                id: `player-${uuid()}`,

                cameraKeys: Object.keys(this.cameras),
                cameraActive: Object.keys(this.cameras)[0],
                players: {},

                controls_settings: ['captions', 'quality']
            };
        },
        computed: {},
        methods: {
            getVideoPosition(cameraKey) {
                if (this.cameraActive === cameraKey) {
                    return {};
                }

                if (!this.cameras[this.cameraActive].cameraPositions || !this.cameras[this.cameraActive].cameraPositions[cameraKey]) {
                    return {display: 'none'};
                }

                const [x, y] = this.cameras[this.cameraActive].cameraPositions[cameraKey];
                return {top: `${-50 + y}%`, left: `${-50 + x}%`};
            },

            onClick(e, cameraKey) {
                if (cameraKey === this.cameraActive) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                console.log(cameraKey);

                // TODO: Take in mind fullscreen
            },

            onLoad() {
                if (Object.keys(this.players).length === this.cameraKeys.length) {
                    this.cameraKeys.map(i => this.players[i]).forEach((player, index) => {
                        player.muted = this.muted || index > 0;

                        if (this.autoPlay) {
                            player.play();
                        }
                    });
                }
            },

            onPlay(cameraKey) {
                if (cameraKey !== this.cameraActive) {
                    return;
                }

                this.cameraKeys
                    .filter(i => i !== this.cameraActive)
                    .map(i => this.players[i])
                    .filter(i => i)
                    .forEach(p => {
                        p.play();
                    });
            },
            onPause(cameraKey) {
                if (cameraKey !== this.cameraActive) {
                    return;
                }

                this.cameraKeys
                    .filter(i => i !== this.cameraActive)
                    .map(i => this.players[i])
                    .filter(i => i)
                    .forEach(p => {
                        p.pause();
                    });
            },
            onVolumechange(cameraKey, player) {
                if (cameraKey !== this.cameraActive) {
                    return;
                }

                this.cameraKeys
                    .filter(i => i !== this.cameraActive)
                    .map(i => this.players[i])
                    .filter(i => i)
                    .forEach(p => {
                        p.volume = player.volume;
                        p.muted = true;
                    });
            },
        },
        mounted() {
            if (!HLS.isSupported()) {
                throw new Error(`HLS isn't supported`);
            }

            this.cameraKeys.forEach(cameraKey => {
                const camera = this.cameras[cameraKey];
                const video = this.$refs[cameraKey];

                const player = new Plyr(video, {
                    controls: this.controls,
                    settings: this.controls_settings,
                    autoplay: false,
                    muted: true,
                });

                player.on('ready', e => {
                    const instance = e.detail.plyr;

                    const hls = new HLS();
                    hls.loadSource(camera.src);
                    hls.attachMedia(instance.media);
                    hls.on(HLS.Events.MANIFEST_PARSED, () => {
                        this.players[cameraKey] = instance;
                        this.onLoad();
                    });
                });

                player.on('playing', () => {
                    this.onPlay(cameraKey, player);
                });
                player.on('play', () => {
                    this.onPlay(cameraKey, player);
                });
                player.on('pause', () => {
                    this.onPause(cameraKey, player);
                });

                player.on('volumechange', () => {
                    this.onVolumechange(cameraKey, player);
                });
            });
        }
    }
</script>

<style scoped
       lang="scss">
  @import 'https://cdn.plyr.io/3.5.10/plyr.css';

  div.playerWrapper {
    width: 100%;

    div.playerContainer {
      position: relative;
      height: 0;
      padding-bottom: calc(9 / 16 * 100%);

      div.playerElement {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 5;

        &:not(.active) {
          z-index: 15;
          -webkit-box-shadow: 0 0 2px 0 rgba(255, 255, 255, 0.5);
          -moz-box-shadow: 0 0 2px 0 rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 2px 0 rgba(255, 255, 255, 0.5);

          transition: 0.1s;
          transform: scale(0.1);
          transform-origin: center;

          &:hover {
            transform: scale(0.2);
          }
        }
      }

      &:not(:hover) {
        div.playerElement:not(.active) {
          display: none;
        }
      }
    }
  }
</style>
