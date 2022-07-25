<script>
    import { onMount } from 'svelte';

    export let display = 'block';
    export let srcObject ='';
    let lv;

    // import {posterst} from './js/stores.js'
    // let poster;
    // const us_poster = posterst.subscribe((data) => {
    //         if(data){
    //             poster = data;
    //         }
    // });

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

<video  id="localVideo" autoplay playsinline muted 
    style="
        display: {display};
        position:absolute;
        top:0px;
        width:100%;
        height: 100px;
        z-index: 20;">
</video>
<slot name="footer"></slot>
