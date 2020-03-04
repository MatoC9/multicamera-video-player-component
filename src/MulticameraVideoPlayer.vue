<template>
  <div class="playerWrapper">
    <div class="playerContainer"
         :id="`playerContainer-${id}`"
         @dblclick="onDblclick($event)">
      <div class="playerElement"
           :class="{active: cameraKey === cameraActive}"
           :style="getVideoPosition(cameraKey)"
           :key="cameraKey"
           v-for="cameraKey in cameraKeys">
        <video :ref="cameraKey"/>
        <div class="playerOverlay"
             @click="onClick($event, cameraKey)"
             v-if="cameraKey !== cameraActive"></div>
      </div>
    </div>
  </div>
</template>

<script>
    /* eslint-disable no-console */
    import * as HLS from 'hls.js';
    import Plyr from 'plyr';
    import {v4 as uuid} from 'uuid';

    window.multiCameraVideoPlayer = {
        onFullscreenToggle(e, id) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                window.multiCameraVideoPlayer.fullscreenExit();
            } else {
                window.multiCameraVideoPlayer.fullscreenEnter(id);
            }
        },
        fullscreenEnter(id) {
            const playerSelector = `div#playerContainer-${id}`;
            const playerContainer = document.querySelector(playerSelector);
            const video = document.querySelector(`${playerSelector} video`);

            if (playerContainer.requestFullscreen) {
                playerContainer.requestFullscreen();
            } else if (playerContainer.msRequestFullscreen) {
                playerContainer.msRequestFullscreen();
            } else if (playerContainer.mozRequestFullScreen) {
                playerContainer.mozRequestFullScreen();
            } else if (playerContainer.webkitRequestFullscreen) {
                playerContainer.webkitRequestFullscreen();
            } else if (video.webkitEnterFullScreen) {
                video.webkitEnterFullScreen();
            } else {
                throw new Error(`Full screen isn't supported`);
            }
        },
        fullscreenExit() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        },
    };

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

            cameras: {
                type: Object,
                required: true,
            }
        },
        data() {
            return {
                id: uuid(),
                cameraKeys: Object.keys(this.cameras),
                cameraActive: Object.keys(this.cameras)[0],
                players: {}
            };
        },
        computed: {},
        methods: {
            getControls() {
                return `<div class="plyr__controls">
                    <button type="button" class="plyr__control" aria-label="Play, {title}" data-plyr="play" style="margin-right: auto;">
                        <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-pause"></use></svg>
                        <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-play"></use></svg>
                        <span class="label--pressed plyr__tooltip" role="tooltip">Pause</span>
                        <span class="label--not-pressed plyr__tooltip" role="tooltip">Play</span>
                    </button>

                    <button type="button" class="plyr__control" aria-label="Mute" data-plyr="mute">
                        <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-muted"></use></svg>
                        <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-volume"></use></svg>
                        <span class="label--pressed plyr__tooltip" role="tooltip">Unmute</span>
                        <span class="label--not-pressed plyr__tooltip" role="tooltip">Mute</span>
                    </button>
                    <div class="plyr__volume">
                        <input data-plyr="volume" type="range" min="0" max="1" step="0.05" value="1" autocomplete="off" aria-label="Volume">
                    </div>
                    <button type="button" class="plyr__control plyr__control" onclick="multiCameraVideoPlayer.onFullscreenToggle(event, '${this.id}')">
                        <svg class="fullscreen-show" role="presentation"><use xlink:href="#plyr-exit-fullscreen"></use></svg>
                        <svg class="fullscreen-hide" role="presentation"><use xlink:href="#plyr-enter-fullscreen"></use></svg>
                        <span class="fullscreen-show plyr__tooltip" role="tooltip">Exit fullscreen</span>
                        <span class="fullscreen-hide plyr__tooltip" role="tooltip">Enter fullscreen</span>
                    </button>
                </div>`;
            },
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

            onDblclick(e) {
                window.multiCameraVideoPlayer.onFullscreenToggle(e, this.id);
            },
            onClick(e, cameraKey) {
                if (cameraKey === this.cameraActive) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                this.players[this.cameraActive].muted = true;
                this.cameraActive = cameraKey;
                this.players[this.cameraActive].muted = false;
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
                    controls: this.getControls(),
                    settings: this.controls_settings,
                    autoplay: false,
                    muted: true,
                    fullscreen: {enabled: false}
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

                player.on('playing', (e) => {
                    this.onPlay(cameraKey, player, e);
                });
                player.on('play', (e) => {
                    this.onPlay(cameraKey, player, e);
                });
                player.on('pause', (e) => {
                    this.onPause(cameraKey, player, e);
                });

                player.on('volumechange', (e) => {
                    this.onVolumechange(cameraKey, player, e);
                });
            });
        }
    }
</script>

<style lang="scss">
  @import 'https://cdn.plyr.io/3.5.10/plyr.css';

  div.playerWrapper {
    overflow: hidden;
    width: 100%;

    div.playerContainer {
      position: relative;
      height: 0;
      padding-bottom: calc(9 / 16 * 100%);

      &:not(:hover) {
        div.playerElement:not(.active) {
          display: none;
        }
      }

      &:fullscreen {
        height: 100%;
        padding-bottom: 0;

        .fullscreen- {
          &show {
            display: block;
          }

          &hide {
            display: none;
          }
        }
      }

      &:not(:fullscreen) {
        .fullscreen- {
          &hide {
            display: block;
          }

          &show {
            display: none;
          }
        }
      }

      div.playerElement {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 5;

        &:not(.active) {
          z-index: 15;
          transition: transform 0.1s;
          transform: scale(0.1);
          transform-origin: center;

          &:hover {
            transform: scale(0.2);
          }
        }

        .playerOverlay {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }
      }
    }
  }
</style>
