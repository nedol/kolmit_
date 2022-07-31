
<div style = "position: relative;right: 0px;" on:click={OnClick}>
    <slot></slot>
</div>
<script>
    import { onMount } from 'svelte';
    export let status;
 
    export let rtc;
    export let operator;

    async function OnClick(){

        let iframe = document.querySelector("[src*='"+operator+"']");
        let cb = iframe.contentWindow.document.querySelector('.callButton');
        // cb.dispatchEvent(new Event('mute'));


        let promise = new Promise(function(resolve, reject) {
            if(rtc.DC){
                rtc.DC.SendRedirect({operator}, resolve);
                rtc.OnMessage({func: 'mute'});
            }
        });

        let data  = await promise;

        status = 'mute';     
    }


</script>