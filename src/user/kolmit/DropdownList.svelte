<script>
    import { onMount } from 'svelte'; 
    import {Select, Field} from 'svelma'
    export let display;
	let options = [
        { id: 2, text: 'Open Profile'},
		{ id: 1, text: 'Transmit File' }
	];
    let profile;
    export let selected ='';
    export let status;

    onMount(()=>{
        window.parent.document.body.append(profile);
    })

    function OnBlurSelect(){
        display = false;
        selected = '';
    }
 
</script>

<div style='z-index: 30;position: absolute;top:5px;height: 70px;' bind:this={profile}>
    <Select placeholder="Options:" on:blur = {OnBlurSelect}  bind:selected={selected}>
        {#each options as opt (opt.id)}
            {#if opt.id==1 && status==='talk'}
                <option value={opt.id}>{opt.text}</option>
            {/if}
            {#if opt.id==2}
                <option value={opt.id}>{opt.text}</option>
            {/if}
        {/each}
    </Select>
</div>

<style>
    
   
</style>