<script>
    import { onMount } from 'svelte';
       export let muted = false;
       export let srcObject;

       let rs; 
       onMount(async () => {
           rs = document.getElementById('remoteAudio');
       });

       $: if(rs && srcObject){
            rs.srcObject = srcObject
        }
</script>

<audio id="remoteAudio" autoplay {muted}>
   <track kind="captions">
</audio>

