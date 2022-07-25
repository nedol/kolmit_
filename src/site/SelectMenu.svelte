<button class="button collapsible" on:click={OnCollClick}>
    <div style="padding:10px"><img src="{selected.src}" alt=''>{selected.alt}</div>
</button>

<div class="content"  bind:this={content}> 
    {#if options}
        {#each options as opt (opt.id)}
        <div style="padding:10px"><img src={opt.src} alt='' value={opt.id} on:click={OnSelect}>{opt.alt}</div>
        {/each}
    {/if}   
</div>


<style>
    
    .collapsible {
    position: absolute;  
    right: 0;
    background-color: rgb(158, 158, 158);
    color: white;
    cursor: pointer;
    padding: 1px;
    max-width: 105px;
    border: none;
    outline: none;
    }

    .content {
        position: absolute;  
        right: 0;
        padding: 0px 18px;
        max-width:100px;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.2s ease-out;
        background-color: #f1f1f1;
    }
    input, input:hover, input:focus, input:active {
        background: transparent;
        border: 0;
        border-style: none;
        border-color: transparent;
        outline: none;
        outline-offset: 0;
        box-shadow: none;
        padding:0;
        }
</style>

<script>
    import {onMount} from 'svelte'

    let options; 
    let content;
    let placeholder = 'Menu';
    let kolmi = JSON.parse(localStorage.getItem('kolmi'));
    export let lang ='en';
    if(kolmi)
        lang = kolmi.lang;

    options = [ 
            { id: 0, lang:"en", src:"https://www.sic-info.org/wp-content/uploads/2014/01/gb.png", alt:"English"}, 
            { id: 1, lang:"fr", src:"https://www.sic-info.org/wp-content/uploads/2014/01/fr.png", alt:"French"},
            { id: 2, lang:"de", src:"https://www.sic-info.org/wp-content/uploads/2014/01/de.png", alt:"Deutch"},
            { id: 3, lang:"ru", src:"https://www.sic-info.org/wp-content/uploads/2014/01/ru.png", alt:"Русский"}
        ];

    let selected =  { id: 0, src:"https://www.sic-info.org/wp-content/uploads/2014/01/gb.png", alt:"English"};

    onMount(() => {

    })


    function OnCollClick(ev){

        // this.classList.toggle("active");
        if (content.style.maxHeight){
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight +  "px";
        } 
    }

    function OnSelect(ev){
        selected = options[ev.currentTarget.attributes.value.value];
        lang = selected.lang;
        OnCollClick();
    }
  
</script>





