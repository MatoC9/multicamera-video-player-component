<template>
  <div class="playerWrapper"
       :style="{width, height}">
    <div class="playerContainer"
         :id="`playerContainer-${id}`">
      <!-- Create div.playerElement for every available camera -->
      <div class="playerElement"
           :class="{active: cameraKey === cameraActive}"
           :style="getVideoStyle(cameraKey)"
           :key="cameraKey"
           v-for="cameraKey in cameraKeys">
        <video :ref="cameraKey"
               @dblclick="onDblclick($event)"/>
        <!-- playerOverlay for non-active players -->
        <div class="playerOverlay"
             @click="onClick($event, cameraKey)"
             v-if="cameraKey !== cameraActive"></div>
      </div>
    </div>

    <div class="playerLoading"
         v-if="loading">
      <div class="loader"></div>
    </div>
  </div>
</template>

<script>
    // Import all required libraries from dependencies
    import * as Hls from 'hls.js';
    import Plyr from 'plyr';
    import * as uuid from 'uuid';

    // Register some functions that have to be global
    window.multiCameraVideoPlayer = {
        /**
         * Toggle fullscreen of a player
         * @param {Event} e
         * @param {string} id UUID generated id of player
         */
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
        /**
         * Enter fullscreen
         * @param {string} id UUID generated id of player
         */
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
        /**
         * Exit fullscreen
         */
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

    export default { // Export Vue component
        name: 'multicamera-video-player', // HTML tag of component
        props: { // HTML tag attributes
            width: { // Width of player
                type: String,
                required: false,
                default: '100%',
            },
            height: { // Height of player
                type: String,
                required: false,
                default: '', // defaults to 16/9 ratio equivalent
            },

            autoplay: { // Whether videos start playing after loading all of them
                type: Boolean,
                required: false,
                default: true,
            },
            volume: { // Default volume
                type: Number,
                required: false,
                default: 50,
            },
            muted: { // Whether main video is muted after loading
                type: Boolean,
                required: false,
                default: false,
            },

            cameras: { // Object containing details about cameras
                type: Object,
                required: true,
            }
        },
        data() { // Data used in component
            return {
                id: uuid.v4(), // Every player needs to have unique ID generated
                cameraKeys: Object.keys(this.cameras), // List of camera keys
                cameraActive: Object.keys(this.cameras)[0], // Active camera key
                players: {}, // Object of Plyr instances
                loading: true // Whether or not video streams are still loading
            };
        },
        methods: { // Methods used in components
            /**
             * Returns HTML code of player controls
             * @returns {string} HTML code for player controls
             */
            getControls() {
                return `<div class="plyr__controls">
                    <button type="button" class="plyr__control" aria-label="Play, {title}" data-plyr="play">
                        <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-pause"></use></svg>
                        <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-play"></use></svg>
                        <span class="label--pressed plyr__tooltip" role="tooltip">Pause</span>
                        <span class="label--not-pressed plyr__tooltip" role="tooltip">Play</span>
                    </button>

                    <button type="button" class="plyr__control" aria-label="Mute" data-plyr="mute" style="margin-left: auto;">
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
            /**
             * Returns css styling for video player
             * @param {string} cameraKey ID of player
             * @returns {{}} Object representation of CSS styling
             */
            getVideoStyle(cameraKey) {
                if (this.cameraActive === cameraKey) {
                    return {};
                }

                if (!this.cameras[this.cameraActive].cameraPositions || !this.cameras[this.cameraActive].cameraPositions[cameraKey]) {
                    return {display: 'none'};
                }

                const [x, y] = this.cameras[this.cameraActive].cameraPositions[cameraKey];
                return {top: `${-50 + y}%`, left: `${-50 + x}%`};
            },
            /**
             * double-click event listener
             * @param {Event} e
             */
            onDblclick(e) {
                window.multiCameraVideoPlayer.onFullscreenToggle(e, this.id);
            },
            /**
             * click event listener
             * @param {Event} e
             * @param {string} cameraKey ID of player clicked on
             */
            onClick(e, cameraKey) {
                if (cameraKey === this.cameraActive) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                const isMuted = this.players[this.cameraActive].muted;

                this.players[this.cameraActive].muted = true;
                this.cameraActive = cameraKey;
                this.players[cameraKey].muted = isMuted;
            },
            /**
             * HLS' load event listener
             */
            onLoad() {
                if (Object.keys(this.players).length === this.cameraKeys.length) {
                    this.cameraKeys.map(i => this.players[i]).forEach((player, index) => {
                        player.hideControls = index > 0;
                        player.muted = this.muted || index > 0;

                        if (this.autoplay) {
                            player.play();
                        }
                    });

                    this.loading = false;
                }
            },
            /**
             * play event listener
             * @param {string} cameraKey ID of player that started playing
             */
            onPlay(cameraKey) {
                if (cameraKey !== this.cameraActive) {
                    return;
                }

                this.cameraKeys
                    .filter(i => i !== this.cameraActive)
                    .map(i => this.players[i])
                    .filter(i => i)
                    .forEach(p => p.play());
            },
            /**
             * pause event listener
             * @param {string} cameraKey ID of player that has been paused
             */
            onPause(cameraKey) {
                if (cameraKey !== this.cameraActive) {
                    return;
                }

                this.cameraKeys
                    .filter(i => i !== this.cameraActive)
                    .map(i => this.players[i])
                    .filter(i => i)
                    .forEach(p => p.pause());
            },
            /**
             * volumechange event listener
             * @param {string} cameraKey ID of player that volume has been changed
             * @param {Object} player Plyr player instance
             */
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
        // Vue lifecycle hook called after mounting component into HTML
        mounted() {
            // Check whether HLS is supported by browser
            if (!Hls.isSupported()) {
                throw new Error(`HLS isn't supported`);
            }

            // Look through all cameras and initiate them
            this.cameraKeys.forEach(cameraKey => {
                const camera = this.cameras[cameraKey];
                const video = this.$refs[cameraKey];

                // Create Plyr player instance
                const player = new Plyr(video, {
                    controls: this.getControls(),
                    settings: this.controls_settings,
                    autoplay: false,
                    volume: this.volume,
                    muted: true,
                    fullscreen: {enabled: false}
                });

                // After Plyr player is ready load HLS
                player.on('ready', e => {
                    const instance = e.detail.plyr;

                    const hls = new Hls();
                    hls.loadSource(camera.src);
                    hls.attachMedia(instance.media);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        this.players[cameraKey] = instance;
                        this.onLoad();
                    });
                });

                // Add event listeners for Plyr player
                player.on('playing', () => {
                    this.onPlay(cameraKey);
                });
                player.on('play', () => {
                    this.onPlay(cameraKey);
                });
                player.on('pause', () => {
                    this.onPause(cameraKey);
                });
                player.on('volumechange', () => {
                    this.onVolumechange(cameraKey, player);
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
    position: relative;

    &:not([style~="height:"]):not([style^="height:"]) div.playerContainer {
      height: 0;
      padding-bottom: calc(9 / 16 * 100%);
    }

    div.playerContainer {
      position: relative;
      height: 100%;

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
          z-index: 10;
          @include prefix(transform, scale(0.1));
          @include prefix(transform-origin, center);
          @include prefix(box-shadow, 0 0 32px 0 rgba(255, 255, 255, 0.5));

          &:hover {
            transform: scale(0.2);
            z-index: 15;
          }

          div.plyr__controls {
            display: none;
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

    div.playerLoading {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 15;

      $loaderSize: 128px;
      $loaderColor: #ffffff;
      $loaderColorOpacity: 0.25;

      div.loader {
        border-top: $loaderSize/10 solid rgba($loaderColor, $loaderColorOpacity);
        border-right: $loaderSize/10 solid rgba($loaderColor, $loaderColorOpacity);
        border-bottom: $loaderSize/10 solid rgba($loaderColor, $loaderColorOpacity);
        border-left: $loaderSize/10 solid $loaderColor;
        @include prefix(transform, translateZ(0));
        @include prefix(animation, loader 1s infinite linear);

        &, &:after {
          width: $loaderSize;
          height: $loaderSize;
          @include prefix(border-radius, 50%);
        }
      }
    }
  }

  @-webkit-keyframes loader {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }

  @keyframes loader {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }

  @mixin prefix($property, $parameters...) {
    @each $prefix in -webkit-, -moz-, -ms-, -o-, "" {
      #{$prefix}#{$property}: $parameters;
    }
  }
</style>
