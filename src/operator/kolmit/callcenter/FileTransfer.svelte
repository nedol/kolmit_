<div style = "position: relative;right: 0px;" on:click={OnClick}>
    <slot></slot>
    <input  class="file-upload" bind:this={input} on:change={OnChangeFile}
        accept="*,*"
        bind:files
        id="file"
        name="file"
        type="file"  
        style="display: none"/>
</div>


<script>
export let status;
let files; 
export let rtc;
export let operator;
let input;

function OnClick(ev){

    // let event =  new PointerEvent('click', {
    //     bubbles: false,
    //     cancelable: true,
    //     view: window,
    //     });

    // //     input.onclick();
    // document.getElementById('file').dispatchEvent(event);

    let iframe = document.querySelector("[src*='"+operator+"']");
    if(iframe.contentWindow.user)
        iframe.contentWindow.user.TransFile(input);
  
}

async function OnChangeFile(e){
        try {
        
            let iframe = document.querySelector("[src*='"+operator+"']");

            let promise = new Promise(function(resolve, reject) {
                if(iframe.contentWindow.user)
                    iframe.contentWindow.user.DC.SendFile(e.target.files[0],e.target.files[0].name, resolve);//todo:
            });

            let data  = await promise;

        }catch(ex){

        }
    }
</script>