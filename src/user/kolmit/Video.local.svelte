<script>
    import { onMount } from 'svelte';
    export let display = 'none';
    export let srcObject ='';
    let lv;
    onMount(async () => {
            lv = document.getElementById('localVideo');
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

<video  id="localVideo" autoplay playsinline muted style="
        display: {display};
        position: absolute;
        top:10px;
        right:0px;
        max-width: 40%;
        max-height: 40%;
        z-index: 20;">
</video>
