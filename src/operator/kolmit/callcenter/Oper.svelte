<div bind:this={oper_admin_div} style="display:flex; flex-wrap: nowrap;justify-content: space-between;">
  <div class="user_pic_div" style="position:relative; width:85px;height:85px">
    <img
      class="user_pic is-rounded"
      src={user.picture.medium}
      alt=""
      on:click={OnClickUpload}
      style="border-radius: 5px; float:right"
    />
    {#if edited_display}
      <input
        bind:this={upload}
        class="file-upload"
        on:change={OnChangeFile}
        accept="image/png, image/jpeg"
        bind:files
        id="avatar"
        name="avatar"
        type="file"
        style="display: none"
      />
    {/if}

    <!-- src="/kolmit/user/iframe.html?em=oper@komi&abonent={user.email}" -->
    <!-- {#if edited_display} -->
      {#if user.email && operator.email !== user.email}
        <iframe
          class="user_frame"
          src="/kolmit/user/iframe.html?em={user.email}&abonent={abonent}"
          scrolling="no"
          frameBorder="0"
          style="position: absolute;
            top: 0px;
            left: -20px;
            height: 40px;
            width: 100%;"
      
          title="User Frame"
        />
      {/if}
    <!-- {/if} -->

    {#if edited_display}
      {#if (operator.email!==user.email && user.role === "operator")}
        <svg
          height="30"
          width="30"
          on:click={OnRemoveOper(user)}
          style="position: absolute;bottom: -15px;left: 0;"
        >
          <glyph
            glyph-name="minus-circle"
            unicode="&#xefc0;"
            horiz-adv-x="50"
          />
          <g class="currentLayer">
            <path
              d="M500.2 62.5c-241.8 0-437.7 195.89999999999998-437.7 437.3 0 241.8 195.89999999999998 437.7 437.7 437.7 241.40000000000003 0 437.3-195.89999999999998 437.3-437.7 0-241.40000000000003-195.89999999999998-437.3-437.3-437.3z m301.59999999999997 466.5c-0.6999999999999318 9-2.199999999999932 19.100000000000023-4.699999999999932 30.299999999999955h-593.9000000000001c-2.499999999999943-11.199999999999932-4.299999999999926-21.699999999999932-5.0999999999999375-31.399999999999977-0.6999999999999886-9.699999999999932-1.0999999999999943-19.799999999999955-1.0999999999999943-30.299999999999955 0-9 0.4000000000000057-18 1.0999999999999943-26.700000000000045 0.700000000000017-9 2.5-19.099999999999966 5.099999999999994-30.299999999999955h593.9000000000001c2.4999999999998863 11.199999999999989 3.9999999999998863 21.599999999999966 4.699999999999818 31.399999999999977 1.1000000000000227 9.699999999999989 1.400000000000091 19.80000000000001 1.400000000000091 30.30000000000001 0.09999999999990905 9.099999999999966-0.3000000000000682 17.69999999999999-1.400000000000091 26.69999999999999z"
              transform="scale(.03)"
              style="fill:lightgrey; stroke:black; stroke-width:20px"
            />
          </g>
        </svg>
      {/if}
    {/if}
  </div>

  <div style="flex:1; margin-left:10px; font-size:xx-small">
    {#if Dict}
      <input
        type="text"
        class="user_name"
        placeholder={placeholder_name}
        on:change={OnChange}
        bind:value={user.name}
        readonly  = {readonlyOper}
        style="width:80%;"
      />
      <input
        type="text"
        class="user_email"
        placeholder={placeholder_email}
        on:change={OnChange}
        bind:value={user.email}
        readonly = {readonlyAdm}
        style="width:100%; max-height: 100px;"
      />
    {/if}
    <textarea
      type="text"
      rows="3"
      class="user_desc"
      placeholder={placeholder_desc}
      on:change={OnChange}
      bind:value={user.desc}
      readonly  = {readonlyOper}
      style="width:85%;overflow:auto;max-height: 100px;resize:none"
    />
  </div>

  <div
    style="display: flex;flex-flow: row nowrap; align-items: flex-start;flex-direction: column;">

    {#if status === "talk" && (user_status === "active")  && user.email !== operator.email}
      <Forward bind:status {rtc} operator={user.email}>
        <img
          src="../assets/call-forward.svg"
          alt="call-forward"
          width="30px"
          height="30px"
        />
      </Forward>
    {/if}
    {#if  user_status === "talk" || (status === "talk" && user.email === operator.email)}
      <FileTransfer {status} {rtc} operator={user.email}>
        <img
        src="../assets/file-transfer.svg"
        alt="file-transfer"
        width="30px"
        height="30px"
        />
      </FileTransfer>
    {/if}
  </div>
</div>

<style>
  textarea:not([readonly]),
  input:not([readonly]) {
    color: rgb(35, 33, 158);
  }
  textarea:not([readonly])::placeholder,
  input:not([readonly])::placeholder {
    color: rgb(41, 128, 155);
  }

  input,
  input:hover,
  input:focus,
  input:active,
  textarea {
    background: transparent;
    border: 0;
    border-style: none;
    border-color: transparent;
    outline: none;
    outline-offset: 0;
    box-shadow: none;
    padding: 0;
  }
</style>


<script>
  import { onMount, onDestroy } from "svelte";

  import loadImage from "blueimp-load-image/js/load-image.js";
  import "blueimp-load-image/js/load-image-scale.js";
  import Forward from "./Forward.svelte";
  import FileTransfer from "./FileTransfer.svelte"
  import _ from "lodash";


  import { langs } from "../js/stores.js";
  let lang = "en";
  const us_lang = langs.subscribe((data) => {
    lang = data;
  });

  export let operator;
  export let id;
  export let status;
  export let dep;
  export let user;
  export let abonent;
  export let update;
  export let rtc;

  let files,
    user_status,
    placeholder_name,
    placeholder_email,
    placeholder_desc,
    upload;

  import { dicts } from "../js/dict.js";
  let Dict;
  const us_dict = dicts.subscribe((data) => {
    if (data) {
      Dict = data;
      placeholder_name = Dict.getValByKey(lang, "input operator name");
      placeholder_email = Dict.getValByKey(lang, "input operator email");
      placeholder_desc = Dict.getValByKey(lang, "input description");
    }
  });

  import { signal } from "../js/stores.js";
  let signalch = false;
  const us_signal = signal.subscribe((data) => {
    if (data) {
      signalch = data;
    }
  });

  import { pswd } from "../js/stores.js";
  let psw;
  const us_pswd = pswd.subscribe((data) => {
    psw = data;
  });

  onDestroy(us_signal, us_lang, us_dict, us_pswd);

    
  export let edited_display;
  let readonlyOper = true;
  let readonlyAdm = true;

  import {editable} from '../js/stores.js'
  const us_edit = editable.subscribe((data) => {
      edited_display = data;

      readonlyOper = !edited_display;  
      readonlyAdm = !edited_display;   
  });

  // $: if (readonly) {
  //   readonlyOper = readonly;

  //   if (dep.id === "0" && user.role === "admin") {
  //     readonlyAdm = true;
  //   } else {
  //     readonlyAdm = readonly;
  //   }
  // } else {
  //   if (dep.id !== "0") {
  //     readonlyAdm = readonly;
  //   }
  // }

  user.email = user.email ? user.email : "";

  const titleize = (s) =>
    s ? s.replace(/^([a-z])/, (_, r) => r.toUpperCase()) : "";

  user.name = titleize(user.name);

  import {posterst} from '../js/stores.js'
  let oper_admin_div;

  onMount(() => {

    if(user.email && operator.email === user.email){
      posterst.set(oper_admin_div)
    }

  });

   //status changed postMessage from iframe
  function OnMessage(params) {
    if(params.data.status)
      user_status = params.data.status;
  }

  function OnClickUpload(ev) {
    let event = new MouseEvent("click", {
      bubbles: false,
      cancelable: true,
      view: window,
    });

    if(upload)
      upload.dispatchEvent(event);
  }

  let width, height;
  function OnChangeFile(e) {
    try {
      loadImage(
        e.target.files[0],
        function (img, data) {
          if (img.type === "error") {
            console.error("Error loading image ");
          } else {
            width = img.width;
            height = img.height;
            user.picture.medium = img.toDataURL();
            OnChange();
          }
        },
        {
          orientation: true,
          maxWidth: 100,
          maxHeight: 100,
          minWidth: 50,
          minHeight: 50,
          canvas: true,
        }
      );
    } catch (ex) {}
  }

  async function OnChange(ev) {
    let par = {};
    par.proj = "kolmit";
    par.func = "changeoper";
    par.abonent = abonent;
    par.em = operator.email;
    par.dep_id = dep.id;
    par.psw = psw;
    par.data = user;
    par.lang = lang;
    par.host = signalch.host;

    let res = await new Promise((resolve, reject) => {
      signalch.SendMessage(par, (data) => {
        resolve(data);
      });
    });
  }

  async function OnRemoveOper(u) {
    let user = dep.staff[id];
    if (!user) {
      return;
    }

    if (confirm("Delete " + user.name)) {
      let par = {};
      par.proj = "kolmit";
      par.func = "remoper";
      par.em = operator.email;
      par.id = user.id;
      par.dep = dep.id;
      par.lang = lang;
      par.abonent = abonent;
      par.psw = psw;

      let res = await new Promise((resolve, reject) => {
        signalch.SendMessage(par, (data) => {
          resolve(data);
        });
      });

      dep.staff = res.dep.staff;
      update();
    }
  }

  function OnLoad(ev) {
    let iframe = ev.currentTarget;
    const rect = iframe.previousElementSibling.getBoundingClientRect();
    if (iframe && iframe.previousElementSibling) {
      if (iframe.previousElementSibling.tagName.toLowerCase() === "img") {
        iframe.style.width = iframe.previousElementSibling.width + "px";
        iframe.style.height = iframe.previousElementSibling.height + "px";
        // iframe.style.top =  rect.top + window.scrollY +'px';
        iframe.style.left = "0px";
      } else if (
        iframe.previousElementSibling.tagName.toLowerCase() === "svg"
      ) {
        iframe.style.width =
          iframe.previousElementSibling.width.baseVal.valueAsString + "px";
        iframe.style.height =
          iframe.previousElementSibling.height.baseVal.valueAsString + "px";
        iframe.style.top = rect.top + window.scrollY + "px";
        iframe.style.left = rect.left + window.scrollX + "px";
      } else {
        iframe.style.maxWidth = "100px";
        iframe.style.maxHeight = "100px";
      }
    }

    iframe.contentWindow.postMessage(
      JSON.stringify({ message: "this should be delivered to an iframe" })
    );

    if (iframe.contentWindow.addEventListener) {
      iframe.contentWindow.addEventListener("message", OnMessage);
    } else {
      // IE8
      iframe.contentWindow.attachEvent("onmessage", OnMessage);
    }
  }
</script>