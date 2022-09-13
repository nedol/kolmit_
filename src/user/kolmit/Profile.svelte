<form  class="form-signin"  style='display:block; position:fixed;top:0' bind:this={form} use:setForm>
    <style>
        input{
            border-width:0;
        }

        .form-signin {
            background-color: white;
            max-width: 90%;
            /* max-height: 90%;            */
            border: 3px solid grey;
            padding: 10px;
            margin: 0 auto;
        }
        .form-signin .form-signin-heading,
        .form-signin .form-control {
            position: relative;
            height: auto;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            padding: 10px;
            font-size: 16px;
        }
        .form-signin .form-control:focus {
            z-index: 2;
        }
        .form-signin input[type="email"] {
            margin-bottom: -1px;
            border-bottom-right-radius: 0;
            border-bottom-left-radius: 0;
        }
    
    </style>
    <div class="row" style="border-style: groove; border-radius:2px;border-color: #cbced2;padding: 10px">
        <h2 class="form-signin-heading">{Dict.dict['How to introduce you?'][lang]}</h2>
        <div style="display:flex;flex-direction: column;">
            <div style='width:250px'>
                <input type="text" id="name" class="form-control" placeholder={Dict.dict['input user name *'][lang]} required bind:value = {name}>
            </div>
            <div style='flex: 1'>
                <input type="email" id="email" class="form-control" placeholder={Dict.dict['input email address'][lang]} required bind:value = {email} style="width:100%">  
            </div>
        </div>
        <div>  
            <img {src} class="avatar" id="avatar_img"
                alt="avatar" on:click={OnClickUpload}
                style="display: block;
                margin-left: auto;
                margin-right: auto;
                width: 40%;">
            <div>
                <span style="display: block;
                text-align: center;
                margin-left: auto;
                margin-right: auto;">Upload photo...</span>
            </div>
            <input  class="file-upload" on:change="{OnChangeFile}"
                accept="image/png, image/jpeg"
                bind:files
                id="avatar"
                name="avatar"
                type="file"  
                style="display: none"/>
        </div>
        <div for="send_form">&nbsp;</div>
        <button id="send_form" class="btn btn-primary"  on:click|preventDefault|stopPropagation={OnClickSend}>{Dict.dict['Save and Close'][lang]}</button>
    </div>
</form> 

<script>
    import { onDestroy, onMount } from 'svelte';
	// import {resizeImg} from 'resize-img'
	import loadImage from "blueimp-load-image/js/load-image.js"
    import  "blueimp-load-image/js/load-image-scale.js"

    export let profile;
    export let selected;

    let src ="../kolmit/assets/user.svg";
    let name;
    let email;
    let form;
    let files;


    onMount(()=>{
        console.log() ;
    })

    $: if (files) {
        // Переменная `files` будет типа `FileList`, а не массивом:
        // https://developer.mozilla.org/ru/docs/Web/API/FileList
        console.log(files);
    }

    import {langs} from './stores.js'
    let lang = 'en';
    const us_lang = langs.subscribe((data) => {
            lang = data;
    });

    import {dicts} from './js/dict.js';
    let Dict;
    const us_dict = dicts.subscribe(data => {
        if(data){
            Dict = data;
        }
    });

    onDestroy(us_dict);


    function OnClickSend(){
            localStorage.setItem('kolmi_abonent', JSON.stringify({id: window.id, src:src,name:name,email:email}));
            profile = false;    
            selected= '';                   
    }    

    async function setForm(form){
        // window.parent.document.body.append(document.getElementsByClassName('form-signin')[0]);
        window.parent.document.body.append(form);
        if(localStorage.getItem('kolmi_abonent')){
            let item  = JSON.parse(localStorage.getItem('kolmi_abonent'));
            name = item.name;
            email = item.email;
            src = item.src;
        }

    }

    //TODO: import { createEventDispatcher } from 'svelte'
    //      const dispatch =  createEventDispatcher()
    //  ... dispatch('custom_event')
    
    function OnClickUpload(){
        let event =  new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        });
        window.parent.document.getElementById('avatar').dispatchEvent(event);
        window.parent.document.getElementById('avatar').addEventListener("change", OnChangeFile);
    }


    async function OnChangeFile(e){

        try {

            let data = await loadImage(
            e.target.files[0],
            function (img, data) {
                if(img.type === "error") {
                    console.error("Error loading image ");
                } else {
                    src =  img.toDataURL();
                    window.parent.document.getElementById('avatar_img').src = src;
                    window.parent.document.getElementById('avatar_input').value = src;
                    // document.querySelectorAll('input[type=file]').attributes.changed = true;
                }
            },
            {
                orientation:true,
                maxWidth: 300,
                maxHeight: 300,
                minWidth: 100,
                minHeight: 50,
                canvas: true
            }
        );
        }catch(ex){

        }
    }

</script>

