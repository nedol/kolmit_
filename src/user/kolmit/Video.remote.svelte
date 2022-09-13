<script>
    import { onMount } from 'svelte';
    export let display = 'none';
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
<div style="
    display:{display};
    position: relative;
    width: 100%;
    height: 100%;
    background-color: white;
    border-radius:5px;
    z-index: 1;">
    <video  id="remoteVideo" autoplay playsinline
        style="
        position: absolute;
        /* width: 100%; */
        height: 107%;
        /* left: 0px; */
        top: 0px;
        opacity: 1;
        ">
            <track kind="captions">
    </video>
</div>
<slot></slot>