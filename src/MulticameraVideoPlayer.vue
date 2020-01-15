<template>
    <p>{{greeting}} World!</p>
</template>

<script>
    export default {
        name: 'MulticameraVideoPlayer',
        data() {
            return {
                greeting: 'Hello'
            };
        },
        mounted() {
            // eslint-disable-next-line no-console
            console.log('Mounted');
        }
    }
</script>

<style scoped>
</style>
