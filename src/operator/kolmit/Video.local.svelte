<script>
    import { onMount } from 'svelte';

    export let display = 'block';
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

<video bind:this={lv} id="localVideo" autoplay playsinline muted 
    style="
        display: {display};
        position:absolute;
        top:0px;
        width:130%;
        height: 100px;
        z-index: 20;">
</video>
<slot name="footer"></slot>
