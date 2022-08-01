<div style="display:flex; min-height:100px; flex-wrap: nowrap;justify-content: space-between;">

        <div style="flex:1">

                <VideoRemote {...remote.video}>
                        <!-- <i class="fa fa-spinner fa-spin" style="position:relative; top:50%;left:50%;font-size:44px;"></i> -->
                </VideoRemote>

                <CallButton on:click={OnClickCallButton} bind:status={status} {OnLongPress}>
                        <!-- <i class="video icofont-ui-video-chat" on:click = {OnClickVideoButton}
                                style="display:{video_button_display};position:absolute;right:0px;top:0;color:lightgrey;font-size: 40px;z-index:20">
                        </i> -->
                        <!-- <b style="position: absolute;left:22px;top:10px;color:#0e0cff;font-size: 12px;" >{call_cnt}</b> -->
                        <b class="call_cnt"  style="display:none;position: absolute;left:22px;top:10px;color:#0e0cff;font-size: 12px;" >100</b>
                        <span class="badge badge-primary badge-pill call-queue"
                                style="display:none;position: absolute;right:0px;bottom:0px;color:#0e0cff;font-size: 12px;opacity:1">0</span>
                </CallButton>
                <div style="display:{remote.text.display};
                                position: absolute;
                                z-index: 10;
                                background-color: rgba(125, 125, 125, 0.8);
                                top: 83px;
                                left: 9px;">
                        <p style="font-size: .5em; white-space: nowrap; color:white">{remote.text.msg} {remote.text.name}</p>
                        <!-- <p style="font-size: .7em; white-space: nowrap;">{remote.text.name}</p> -->
                </div> 
        </div>

        <div style="position:absolute;flex:1 1 0%"> 
 
                        <VideoLocal {...local.video}>
                                <svelte:fragment slot="footer">
                                        <div bind:this={container}></div>                                        
                                </svelte:fragment>
                        </VideoLocal>

                {#if video_button_display}
                        <i class="video icofont-ui-video-chat"  on:click = {OnClickVideoButton}
                        style="position: absolute; right: 80px; top: 0px; color: lightgrey; font-size: 30px; z-index: 20;"></i> 
                {/if}

        </div>

     
        <div style="flex:3">
                <AudioLocal  {...local.audio} bind:paused = {local.audio.paused}/>
                <AudioRemote  {...remote.audio}  bind:srcObject={remote.audio.srcObject}/>

                <RecordedVideo />
                <Download />
        </div>
   
        <BurgerMenu padding={'25px'}>
                {#if Dict}
                {Dict.dict['Language Select'][lang]}:
                {/if}
                <div style="display: flex;">
                        <label style="flex:1">
                                <input type=radio bind:group={lang} name="lang" value={'en'} on:change={OnSelected}>
                                <img src="https://www.sic-info.org/wp-content/uploads/2014/01/gb.png" alt="English">
                        </label>
                
                        <label style="flex:1">
                                <input type=radio bind:group={lang} name="lang" value={'fr'} on:change={OnSelected}>
                                <img src="https://www.sic-info.org/wp-content/uploads/2014/01/fr.png" alt="French">
                        </label>
                
                        <label style="flex:1">
                                <input type=radio bind:group={lang} name="lang" value={'ru'} on:change={OnSelected}>
                                <img src="https://www.sic-info.org/wp-content/uploads/2014/01/ru.png" alt="Russian">
                        </label>
                </div>
                {#if Dict && (window.operator && operator.role==="admin") && isPaid}      
                {#if !edited_display}                          
                        <h2 on:click="{()=>editable.set(true)}">{Dict.dict['Edit Call Center'][lang]}</h2>                 
                {:else}
                        <h2 on:click="{()=>editable.set(false)}">{Dict.dict['Cancel Edit Call Center'][lang]}</h2>
                {/if}
                {/if}
        </BurgerMenu>
     
</div>

<progress id="dataProgress"  value={progress.value}  max="100"  duration='200' style="display:{progress.display};top:100px;width:98%;z-index:10"></progress>

{#if (!tarif || tarif.name==='free') && !abonent}
        <Landpage {tarif}></Landpage> 
{:else}
        <Callcenter bind:this={callcenter} bind:status={status} bind:operator={operator} {abonent} {tarif} {psw}/>
{/if}

<script>

import { onDestroy } from 'svelte';
import { onMount, getContext, setContext } from 'svelte';
import "../assets/icofont/icofont.min.css";

import Oper from './callcenter/Oper.svelte'

import Callcenter from './callcenter/Callcenter.svelte';
let callcenter;
import Landpage from './callcenter/Landpage.svelte';
import RTCOperator from './js/RTCOperator.js';
import MD5 from 'md5'
// import {log} from './js/utils'

import CallButton from './callbutton/CallButtonOperator.svelte'
import BurgerMenu from './menu/BurgerMenu.svelte';
import VideoLocal from './Video.local.svelte';
import VideoRemote from './Video.remote.svelte';

import Download from './Download.svelte';
import AudioLocal from './Audio.local.svelte';
import AudioRemote from './Audio.remote.svelte';

import RecordedVideo from './RecordedVideo.svelte';



const url = new URL(window.location.href);
export let operator =  {email:url.searchParams.get('operator')?url.searchParams.get('operator'):operator.email,role:'operator'};
// const admin = url.searchParams.get('admin')?url.searchParams.get('admin').toLowerCase():em.toLowerCase();
const abonent = url.searchParams.get('abonent')?url.searchParams.get('abonent'):operator.email;

export let tarif;

let isPaid = false;

if(tarif && tarif.paid){
        isPaid = new Date(tarif.paid)>Date.now();
}

// import {window.operator.} from './js/stores.js'

// const us_rtc = window.operator..subscribe((data) => {
//         window.operator.= data;
// });

let selected;
let call_cnt, status, inter;
let video_button_display = false;
let edited_display = false;



import {editable} from './js/stores.js'
const us_edit = editable.subscribe((data) => {
        edited_display = data;
});

import {langs} from './js/stores.js'
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


import {pswd} from './js/stores.js'
let psw;
const us_pswd = pswd.subscribe((data) => {
        psw = data;
});


import {signal} from './js/stores.js'
const us_signal = signal.subscribe((signalch) => {
        if(signalch){

                window.operator  = new RTCOperator("operator", operator, abonent, MD5(JSON.stringify(Date.now())+operator.email), psw, signalch);
                initRTC(signalch);  
        }
});


// import {msg} from './js/signalingChannel.js'
// const us_msg = msg.subscribe((data) => {
//         console.log();
//         if(window.operator.&& window.operator.OnMessage)
//                 window.operator.OnMessage(data);
        
//         OnMessage(data);
// });

import {msg_1} from './js/stores.js'
const us_msg_1 = msg_1.subscribe((data) => {
        console.log();
        // if(window.operator.&& window.operator.OnMessage)
        //         window.operator.OnMessage(data);
        if(data)
                OnMessage(data);
});


import {dc_msg} from './js/DataChannelOperator.js'
const us_dcmsg = dc_msg.subscribe((data) => {
        if(data)
                OnMessage(data);
});


import {posterst} from './js/stores.js'
let container;
const us_post = '';

onMount(() => {
        us_post = posterst.subscribe((child) => {
        if(container && child)
                container.appendChild(child); 
});

});

onDestroy(us_lang, us_signal,us_dict,us_msg_1,us_dcmsg,us_edit,us_pswd);


let progress ={
        display:'block',
        value:0
}

let local = {
        video:{
                display:'none',
                srcObject : '',
                poster:''
        },
        audio:{
                paused:true,
                src : ''  
        }
}

let  remote = {
        text:{
                display:'none',
                msg :'You have a call from:',
                name:'',
                email:''
        },
        video:{
                display:'none',
                srcObject : '',
                poster:''
        },
        audio:{
                muted:true,
                srcObject : ''
        }
}

let profile = {
        display:'none'
}



function onTransFile(params) {
        let event =  new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
        });
        document.getElementById('files').dispatchEvent(event);
}

$:if(selected)
switch(selected){

        case 1:          
                break;
        case 2:
                edited_display = true;
                break;
   
        case 10:

                break;

        }

// setContext('operator',{getOperator:()=>this});

window.operator.SendToComponent = OnMessage;


function OnSelected(ev){        
        langs.set(ev.target.attributes[2].nodeValue);
        localStorage.setItem('kolmit',JSON.stringify({'lang':ev.target.attributes[2].nodeValue}));
}
        
async function initRTC(){

        // window.operator..set(window.operator.;
        //window.operator.type = "operator";

        window.operator.PlayCallCnt = ()=>{    
                        
                call_cnt = 10;

                local.audio.paused = false;

                inter = setInterval(function () {
                        call_cnt--;

                        if (call_cnt === 0) {
                                clearInterval(inter);
                                local.audio.paused = true;
                        }

                },2000);
        }
        // window.operator.SendToComponent = OnMessage; 
        window.operator.GetRemoteAudio =()=>{
                return remote.audio.srcObject;
        }  
        window.operator.SetRemoteAudio = (src)=>{
                if(src)
                        remote.audio.srcObject = src;
        }
        window.operator.GetRemoteVideo =()=>{
                return remote.video.srcObject;
        }  
        window.operator.SetLocalVideo = (src)=>{
                if(src)
                        local.video.srcObject = src; 
        }

        window.operator.SetRemoteVideo = (src)=>{
                if(src){
                        remote.video.srcObject = src;
                        remote.video.display = 'block';
                        status = 'talk';
                        local.audio.paused = true;
                }
        }             
}; 


function OnLongPress(){
        select.display = true
}


function OnClickCallButton(){
try {
        // Fix up for prefixing
        if (!window.AudioContext) {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                let audioCtx = new AudioContext();
                window.operator.localSoundSrc = audioCtx.createMediaElementSource(window.user.localSound);
                window.operator.localSoundSrc.connect(audioCtx.destination);
        }
}
catch (ex) {
        log('Web Audio API is not supported in this browser');
}

        console.log();

        switch(status){

        case'inactive':
                window.operator.Offer();
                status='active'
                break;

        case 'active':  
                status = 'inactive';
                window.operator.OnInactive();              
        
                break;
        case 'call':
                status = 'talk'
                clearInterval(inter);
                local.audio.paused = true;
                remote.audio.muted = false;
                window.operator.OnTalk();
                video_button_display = true;
                remote.text.display = 'block';
                const event = new Event('talk');
                document.getElementsByTagName('body')[0].dispatchEvent(event);
                break;
        case 'talk':          
                window.operator.OnInactive();  
                remote.audio.muted = true;
                local.video.display = 'none';
                video_button_display = true;
                remote.video.display = 'none';
                remote.video.srcObject = '';
                remote.video.poster = '';  
                remote.text.display = 'none';
                remote.text.name = '';
                remote.text.email = '';  
                status='inactive';
                // local.video.poster = UserSvg;    
                break;
        case 'muted':
                status = 'inactive'
                // local.video.display = 'none';
                local.video.srcObject = '';
                remote.audio.muted = true;
                remote.video.display = 'none';
                remote.video.srcObject = '';
                remote.video.poster = '';
                remote.text.display = 'none';
                // local.video.poster = UserSvg;
                window.operator.OnInactive();  
                break;  
        default:
                return;
        }
}

function openProfile(id) {
        profile.display = 'block';
}


function OnClickVideoButton(){

        status = 'talk';
        local.audio.paused = true;
        local.video.display = 'block';  

        if(window.operator.DC.dc.readyState === 'open') {
                window.operator.GetUserMedia({audio:0,video:1}, function () {
                        window.operator.SendVideoOffer(window.operator.main_pc);
                });
        }
}

function OnMessage(data, resolve) {

        if (data.func === 'mute') {
                local.audio.paused = true;
                remote.audio.muted = true;
                video_button_display = true;
                local.video.display = 'none';
                local.video.srcObject = '';
                // local.video.display = 'block';
                remote.video.srcObject = '';
                remote.video.poster = '';
                remote.video.display = 'none'
                remote.text.name = '';
                remote.text.email = '';
                remote.text.display = 'none';
                 // local.video.poster = UserSvg;
                window.operator.OnInactive();
                if(status==='talk'){
                        status ='inactive';
                        // window.operator.OnInactive();
                }else if(status==='call'){
                        status='inactive';
                        window.operator.OnMute();
                        // callcenter.GetUsers();
                        OnClickCallButton();
                        
                }
                if(resolve)
                        resolve();
        }

        if (data.call || data.func === 'call') {
                status ='call';

                window.operator.OnCall();

                if(data.profile) {
                        let profile = JSON.parse(data.profile)
                        let avatar = profile.src;
                        remote.video.poster = avatar;
                        remote.video.display = 'block';
                        remote.text.display = 'block';
                        remote.text.name = profile.name;
                        remote.text.email = profile.email;
                }
        }


        if (data.desc) {
        // $('.callObject').css('cb_display', 'block');
                //status ='call';
        }

        if (data.camera) {
                local.video.src =  that.localStream;
        }

        if(data.status ==='wait'){
                remote.text.display ='block',
                remote.text.msg = 'You have a waiting call'
        }        
}

</script>






