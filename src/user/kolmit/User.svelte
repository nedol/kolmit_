{#if profile}
  <Profile bind:profile bind:selected />
{/if}
<!-- <Window /> -->

<CallButtonUser
  on:click={OnClickCallButton}
  on:mute={OnMute}
  bind:status
  {OnLongPress}
>
  <!-- <b style="position: absolute;left:22px;top:10px;color:#0e0cff;font-size: 12px;" >{call_cnt}</b> -->
</CallButtonUser>

<AudioLocal {...local.audio} bind:paused={local.audio.paused} />

<AudioRemote {...remote.audio} bind:srcObject={remote.audio.srcObject} />

<VideoLocal slot="local" {...local.video} />

{#if video_button_pos}
  <i
    class="video icofont-ui-video-chat"
    on:click={OnClickVideoButton}
    style="display:{video_button_display};position:absolute;right:0px;top:0;color:lightgrey;margin:0px;font-size:30px;z-index:20"
  />
{/if}

<VideoRemote slot="remote" {...remote.video}>
  <i
    class="fa fa-spinner fa-spin"
    style="position:absolute;top:50%;left:50%;font-size:44px;"
  />
</VideoRemote>

<RecordedVideo />
<Download />

<div
  class="call_text"
  style="cb_display: block; position:absolute;top:30px; overflow: hidden;overflow-y: auto; left:0;
        widht:100%;max-height:300px;z-index:101"
/>

{#if select.display}
  <DropdownList
    bind:display={select.display}
    bind:selected
    bind:list
    bind:status
  />
{/if}
<input
  class="file-upload"
  on:change={OnChangeFile}
  accept=".*|audio/*,video/*,image/*"
  bind:files
  id="files"
  name="files"
  type="file"
  style="display: none"
/>


<progress
  id="dataProgress"
  class=""
  value={progress.value}
  max="100"
  duration="200"
  style="display:{progress.display};position:absolute;top:50%;width:100px;"
/>

<script>
  import { onMount } from "svelte";
  import { onDestroy } from "svelte";
  import "../assets/icofont/icofont.min.css";
  import _ from "lodash";

  import RTCUser from "./js/RTCUser";

  import { msg } from "./js/RTCUser.js";
  const unsubscribe = msg.subscribe((data) => {
    OnMessage(data);
  });

  import Profile from "./Profile.svelte";
  import CallButtonUser from "./CallButtonUser.svelte";
  import DropdownList from "./DropdownList.svelte";
  import Video from "./Video.svelte";
  import VideoLocal from "./Video.local.svelte";
  import VideoRemote from "./Video.remote.svelte";

  import Download from "./Download.svelte";
  import AudioLocal from "./Audio.local.svelte";
  import AudioRemote from "./Audio.remote.svelte";

  import RecordedVideo from "./RecordedVideo.svelte";

  import MD5 from "md5";

  const url = new URL(window.location.href);
  let em = url.searchParams.get("em")
    ? url.searchParams.get("em"): "user@kolmit"; //getParameterByName('em')?getParameterByName('em'):'user@kolmit';

  let selected;
  let name, email, src, profileSrc, call_cnt, status, inter;
  let video_button_display = "none";
  let video_button_pos = false;

  let files;
  let list;

  let profile = false;

  $: if (status) window.postMessage({ status: status }, "*");

  let progress = {
    display: "none",
    value: 0,
  };

  let video = {
    display: "none",
  };

  let local = {
    video: {
      display: "none",
      srcObject: "",
    },
    audio: {
      paused: true,
      src: "",
    },
  };

  let remote = {
    video: {
      display: "none",
      srcObject: "",
    },
    audio: {
      muted: true,
      srcObject: "",
    },
  };

  let select = {
    display: false,
  };

  window.uid = MD5(JSON.stringify(Date.now()) + em);

  $: if (selected)
    switch (selected) {
      case 2:
        profile = true;
        break;
      case 1:
        let event = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        document.getElementById("files").dispatchEvent(event);
        break;
      case 10:
        select.display = false;
        selected = 0;
        break;
    }

  onMount(async () => {
    if (window.frameElement.previousElementSibling)
      // if(window.frameElement.previousElementSibling.tagName==='svg'
      // || window.frameElement.previousElementSibling.tagName==='img')
      video_button_pos = true;

    let ab = url.searchParams.get("abonent");
    window.user = new RTCUser(ab, "user", em, window.uid);

    window.user.PlayCallCnt = () => {
      call_cnt = 10;

      local.audio.paused = false;

      inter = setInterval(function () {
        call_cnt--;
        if (call_cnt === 0) {
          clearInterval(inter);
          local.audio.paused = true;
        }
      }, 2000);
    };
    window.user.GetRemoteAudio = () => {
      return remote.audio.srcObject;
    };
    window.user.SetRemoteAudio = (src) => {
      remote.audio.srcObject = src;
    };
    window.user.SendToComponent = OnMessage;

    window.user.SetLocalVideo = (src) => {
      local.video.srcObject = src;
    };

    window.user.SetRemoteVideo = (src) => {
      remote.video.srcObject = src;
      remote.video.display = "block";
      status = "talk";
      local.audio.paused = true;
    };
    //window.user.SendCheck();
  });

  function OnChangeFile(e) {
    try {
      let file = e.target.files[0];
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (file) {
        window.user.DC.SendFile(file);
      };
    } catch (ex) {}
  }

  onDestroy(unsubscribe);

  function OnLongPress() {
    select.display = true;
  }

  function OnMute() {
    status = "talk";
    OnClickCallButton();
  }

  async function OnClickCallButton() {
    try {
      // Fix up for prefixing
      if (!window.AudioContext) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        let audioCtx = new AudioContext();
        window.user.localSoundSrc = audioCtx.createMediaElementSource(
          window.user.localSound
        );
        window.user.localSoundSrc.connect(audioCtx.destination);
      }
    } catch (ex) {
      log("Web Audio API is not supported in this browser");
    }

    console.log();

    switch (status) {
      case "inactive":
        status = "wait";
        window.user.Call();
        remote.video.srcObject = null;
        break;

      case "wait":
        status = "inactive";
        window.user.SendCheck();
        break;
      case "active":
        if (!localStorage.getItem("kolmit")) {
          profile = true;
        }

        window.user.Call();
        status = "call";
        remote.video.srcObject = null;
        video_button_pos = true;

        break;
      case "call":
        status = "inactive";
        local.audio.paused = true;
        local.video.display = "none";
        video_button_display = "none";
        clearInterval(inter);
        window.user.Hangup();
        break;
      case "talk":
        status = "inactive";
        remote.audio.muted = true;
        local.video.display = "none";
        remote.video.display = "none";
        video_button_display = "none";
        window.user.Hangup();
        break;
      case "muted":
        status = "inactive";
        //window.user.abonent = url.searchParams.get('abonent');
        video_button_display = "none";
        break;
      case "busy":
        window.user.Call();
        status = "wait";
        break;
      default:
        return;
    }
  }


  function OnClickVideoButton() {
    status = "talk";
    local.audio.paused = true;
    local.video.display = "block";
    video_button_pos = false;

    if (window.user.DC.dc.readyState === "open") {
      window.user.GetUserMedia({ audio: 0, video: 1 }, function () {
        window.user.SendVideoOffer(window.user.main_pc);
      });
    }
  }

  function OnMessage(data) {
    if (data.operators && data.operators[window.user.em]) {
      let res = _.groupBy(data.operators[window.user.em], "status");
      if (res["offer"]) {
        if (status !== "call" && status !== "wait") {
          status = "active";
          const event = new Event("display");
          event.data = "block";
        }
      } else if (res["busy"]) {
        if (status !== "call") {
          status = "busy";
          const event = new Event("display");
          event.data = "none";
          window.frameElement.dispatchEvent(event);
        }
      } else if (
        res["close"]
        //  && res["close"].length === Object.keys(data.operators[window.user.abonent]).length 
          && status !== "wait"
      ) {
        local.video.display = "none";
        remote.video.display = "none";
        local.audio.paused = true;
        remote.audio.muted = true;
        //window.user.abonent = url.searchParams.get('abonent');
        status = "inactive";

        if (window.frameElement) {
          const event = new Event("display");
          event.data = "none";
          window.frameElement.dispatchEvent(event);
        }
      }
    }

    if (data.operator && data.operator.em === window.user.em) {
      status = "active";
      if (window.frameElement) {
        //window.frameElement.parentElement.nextElementSibling.firstElementChild.SetVisible('block');
        const event = new Event("display");
        event.data = "block";
        window.frameElement.dispatchEvent(event);
      }
    }

    if (data.desc && data.cand) {
      if (status === "talk") 
        status = "talk";
      else 
        status = "call";
    }

    if (data.func === "mute") {
      local.audio.paused = true;
      remote.audio.muted = true;
      video_button_display = "none";
      local.video.display = "none";
      remote.video.display = "none";
      // window.user.abonent = url.searchParams.get('abonent');
      status = "inactive";

      const event = new Event("inactive");
      window.frameElement.dispatchEvent(event);

      // if(url.searchParams.get("em")!==window.user.em)
      //   location.reload();

      // window.frameElement.style.width = '60px'
      // window.frameElement.style.height = '60px'
    }

    if (data.func === "talk") {
      status = "talk";
      clearInterval(inter);
      video_button_pos = true;
      local.audio.paused = true;
      remote.audio.muted = false;
      video_button_display = "block";
      local.video.display = "block";
      video.display = "block";
      // window.frameElement.style.maxWidth = "200px";
      // window.frameElement.style.maxHeight = "100px";
    }

    if (data.func === "redirect") {
      status = "call";
      local.audio.paused = true;
      remote.audio.muted = true;

      remote.video.srcObject = null;
      remote.video.display = "none";

    }

    if (data.status === "wait") {
      status = "wait";
    }
  }
</script>
