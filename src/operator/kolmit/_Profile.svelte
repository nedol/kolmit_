<script>
    import { onMount } from 'svelte';
	// import {resizeImg} from 'resize-img'
	import loadImage from "blueimp-load-image/js/load-image.js"
    import  "blueimp-load-image/js/load-image-scale.js"

    export let display = 'none';

    export let src ="../assets/user.svg";
    export let name = '';
    export let email= '';

    let selected ="Dep"
    let deps = ['Dep'];
    let files;

    $: if (files) {
        // Переменная `files` будет типа `FileList`, а не массивом:
        // https://developer.mozilla.org/ru/docs/Web/API/FileList
        console.log(files);

        for (const file of files) {
            console.log(`${file.name}: ${file.size} байт(а)`);
        }
    }

    onMount(async () => {


    });


    function OnClickUpload(){
        let event =  new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        });
        document.getElementById('avatar').dispatchEvent(event);
    }

    function OnChangeFile(e){
        try {

        loadImage(
            e.target.files[0],
            function (img, data) {
                if(img.type === "error") {
                    console.error("Error loading image ");
                } else {
                    src =  img.toDataURL();

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


<form id="signin_form"  style='display:{display};width:100%'>
    <div class="row" style="border-style: groove; border-radius:2px;border-color: #cbced2;padding: 10px">
        <h2 class="form-signin-heading">New User</h2>
        <div class="col-xs-6 col-sm-3 col-md-3">
            <img {src} class="avatar" id="avatar_img"
            width="200px" alt="avatar" on:click={OnClickUpload}>
            <h6>Upload your photo...</h6>
            <input  class="file-upload" on:change="{OnChangeFile}"
                accept="image/png, image/jpeg"
                bind:files
                id="avatar"
                name="avatar"
                type="file"  
                style="display: none"/>
        </div>
        <div class="col-xs-6 col-sm-9 col-md-9">
            <input type="text" id="name" class="form-control" placeholder="Last Name" required value = {name}>
            <input type="email" id="email" class="form-control" placeholder="Email address" required value = {email}>
            <select bind:value={selected} >
                {#each deps as dep}
                    <option value={dep}>
                        {dep.text}
                    </option>
                {/each}
            </select>
            <div for="send_form">&nbsp;</div>
            <button id="send_form" class="btn btn-primary"  on:click|preventDefault|stopPropagation>Сохранить и закрыть</button>
        </div>
    </div>
</form> 

<style>
    #signin_form{
        margin: auto;
        width: 30%;
        border: 3px solid #73AD21;
        padding: 10px;
    }
    .form-signin {
        max-width: 330px;
        padding: 15px;
        margin: 0 auto;
    }
    .form-signin .form-signin-heading,
    .form-signin .checkbox {
        margin-bottom: 10px;
    }
    .form-signin .checkbox {
        font-weight: normal;
    }
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
    .form-signin input[type="password"] {
        margin-bottom: 10px;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }
</style>