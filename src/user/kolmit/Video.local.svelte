<script>
    import { onMount } from 'svelte';
    export let display = 'none';
    export let srcObject ='';
    let lv;
    onMount(async () => {

    });

    $: if(lv && srcObject){
        lv.srcObject = srcObject;
    }else if(lv && lv.srcObject){
        lv.srcObject.getVideoTracks().forEach(track => {
            track.stop()
            lv.srcObject.removeTrack(track);
        });
        lv.src='';
    }

</script>

<video  bind:this = {lv} id="localVideo" autoplay playsinline muted style="
        display: {display};
        position: absolute;
        bottom:0px;
        right:0px;
        max-width: 40%;
        max-height: 40%;
        z-index: 20;">
</video>
