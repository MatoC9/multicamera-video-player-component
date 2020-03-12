import component from './MulticameraVideoPlayer.vue';

function install(Vue) { // Function used for installing this component inside another project
    if (install.installed) { // Detect if component was already installed
        return;
    }
    install.installed = true;
    Vue.component('multicamera-video-player', component); // Install component
}

const plugin = {
    install
};

// Finding Vue reference for current website
let GlobalVue = null;
if (typeof window !== 'undefined') {
    GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
    GlobalVue = global.vue;
}

if (GlobalVue) { // Found Vue reference, initialize component
    GlobalVue.use(plugin);
}

component.install = install;

export default component;
