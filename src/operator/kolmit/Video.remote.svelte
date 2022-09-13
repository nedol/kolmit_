<script>
    import { onMount } from 'svelte';
    export let display = 'none';
    export let poster;
    export let srcObject;
    let rv;
    onMount(async () => {
            rv = document.getElementById('remoteVideo');
        });

        $: if(rv && srcObject){
            rv.srcObject = srcObject;
        }else if(rv && rv.srcObject){
            rv.srcObject.getVideoTracks().forEach(track => {
                track.stop()
                rv.srcObject.removeTrack(track);
            });
            rv.src = '';
        }

</script>

    <!-- <video  id="remoteVideo" autoplay playsinline  poster={poster}
        style="
        position: relative;
        left: 0;
        top: 0;
        opacity: 1;">
            <track kind="captions">
    </video> -->


    <video  id="remoteVideo" autoplay playsinline poster={poster}
        style="
            display: {display};
            position: absolute;
            height: 100px;
            max-width: 12%;
            background-color: white;
            z-index: 10;
            ">
            <track kind="captions">
    </video>

    <slot></slot>