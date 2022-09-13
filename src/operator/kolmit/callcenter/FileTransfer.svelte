<div style = "position: absolute;right: 0px;bottom:0" on:click={OnClick}>
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

let files; 
export let operator;
let input;

function OnClick(ev){

    let event =  new PointerEvent('click', {
        bubbles: false,
        cancelable: true,
        view: window,
        });

    //     input.onclick();
    document.getElementById('file').dispatchEvent(event);

    // let iframe = document.querySelector("[src*='"+operator+"']");
    // if(iframe.contentWindow.user)
    //     iframe.contentWindow.user.TransFile(input);
  
}

async function OnChangeFile(e){
        try {
        
            let iframe = document.querySelector("[src*='"+operator+"']");

            let promise = new Promise(function(resolve, reject) {
                let fileReader = new FileReader();
                if(iframe.contentWindow.user){

                    fileReader.onload  =  (e) => {
                        // log('FileRead.onload ', e);
                        // iframe.contentWindow.user.DC.SendFile(,e.target.files[0].name, resolve);//todo:
                        iframe.contentWindow.user.DC.SendFile(e.target.result,file.name);
                    }
                    fileReader.readAsArrayBuffer(e.target.files[0]);
                }else{

                    fileReader.onload  =  (e) => {
                        // log('FileRead.onload ', e);
                        // iframe.contentWindow.user.DC.SendFile(,e.target.files[0].name, resolve);//todo:
                        window.operator.DC.SendFile(e.target.result,file.name);
                    }
                    fileReader.readAsArrayBuffer(e.target.files[0]);
                }
            });

            let data  = await promise;

        }catch(ex){

        }
    }
</script>