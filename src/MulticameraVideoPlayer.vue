<template>
  <div class="playerWrapper">
    <div class="playerContainer"
         @mouseenter="onMouseEnter()"
         @mouseleave="onMouseLeave()">
      <div class="playerElement"
           v-bind:class="{active: cameraActive === cameraKey}"
           v-bind:id="id + '-' + cameraKey"
           v-bind:key="cameraKey"
           v-for="cameraKey in cameraKeys"
           @click.stop.prevent="onClick(cameraKey)"></div>
    </div>
  </div>
</template>

<script>
    /* eslint-disable no-console */
    /* global WowzaPlayer */
    import {v4 as uuid} from 'uuid';

    export default {
        name: 'MulticameraVideoPlayer',
        props: {
            license: {
                type: String,
                required: true,
            },
            title: {
                type: String,
                required: false,
                default: '',
            },
            description: {
                type: String,
                required: false,
                default: '',
            },
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
            loop: {
                type: Boolean,
                required: false,
                default: false,
            },
            uiShowQuickRewind: {
                type: Boolean,
                required: false,
                default: false,
            },
            posterFrameURL: {
                type: String,
                required: false,
                default: '',
            },
            endPosterFrameURL: {
                type: String,
                required: false,
                default: '',
            },
            uiPosterFrameFillMode: {
                type: String,
                required: false,
                default: 'fill',
            },

            cameras: {
                type: Object,
                required: true,
            },
        },
        data() {
            return {
                id: `player-${uuid()}`,
                configShared: {
                    license: this.license,
                    title: this.title,
                    description: this.description,
                    autoPlay: this.autoPlay,
                    volume: this.volume,
                    mute: this.mute,
                    loop: this.loop,
                    audioOnly: false,
                    uiShowQuickRewind: this.uiShowQuickRewind,
                    posterFrameURL: this.posterFrameURL,
                    endPosterFrameURL: this.endPosterFrameURL,
                    uiPosterFrameFillMode: this.uiPosterFrameFillMode,
                    debugLevel: 'OFF'
                },
                cameraKeys: Object.keys(this.cameras),
                cameraActive: Object.keys(this.cameras)[0],
                players: {}
            };
        },
        computed: {
            getNonActivePlayers() {
                return Object.keys(this.players).map(i => this.players[i]).filter(p => !p.F.endsWith(`-${this.cameraActive}`));
            }
        },
        methods: {
            onMouseEnter() { // TODO: DELETE?
            },
            onMouseLeave() { // TODO: DELETE?
            },

            onClick(cameraKey) {
                if (cameraKey === this.cameraActive) {
                    return;
                }

                let playerCurrent = this.players[this.cameraActive];
                playerCurrent.mute(true);
                playerCurrent.pause();

                this.cameraActive = cameraKey;

                playerCurrent = this.players[this.cameraActive];
                playerCurrent.mute(false);
                playerCurrent.play();
            },

            onSeek(e, player) {
                if (player.F.endsWith('-' + this.cameraActive)) {
                    this.getNonActivePlayers.forEach(p => {
                        p.seek(e.time);
                    });
                }
            },
            onVolume(e, player) {
                if (player.F.endsWith('-' + this.cameraActive)) {
                    this.getNonActivePlayers.forEach(p => {
                        p.setVolume(player.getVolume());
                    });
                }
            },
        },
        created() {
            // Create players
            this.cameraKeys.forEach((cameraKey, index) => {
                const camera = this.cameras[cameraKey];

                const config = Object.assign({sourceURL: camera.sourceURL}, this.configShared);
                if (index > 0) {
                    config.mute = true;
                }

                const id = `${this.id}-${cameraKey}`;
                const player = WowzaPlayer.create(id, config);

                const onLoadListener = () => {
                    if (index > 0 || !this.autoPlay) {
                        player.pause();
                    }
                    this.players[cameraKey] = player;
                    player.removeOnLoad(onLoadListener)
                };
                player.onLoad(onLoadListener);

                // Set listeners
                player.onSeek(e => {
                    this.onSeek(e, player);
                });
                player.onVolume(e => {
                    this.onVolume(e, player);
                });
            });
        }
    }
</script>

<style lang="scss">
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
          display: none;
          width: 10%;
          height: 10%;
          z-index: 15;
          -webkit-box-shadow: 0 0 2px 0 rgba(255, 255, 255, 0.5);
          -moz-box-shadow: 0 0 2px 0 rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 2px 0 rgba(255, 255, 255, 0.5);

          &:hover {
            width: 20%;
            height: 20%;
          }

          div[id$="-UI"] {
            display: none;
          }

          div.playerOverlay {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
          }
        }
      }

      &:hover {
        div.playerElement {
          display: block;
        }
      }
    }
  }
</style>
