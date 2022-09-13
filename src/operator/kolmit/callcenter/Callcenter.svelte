<div class="deps_div" style="height: 100vh; overflow-y: scroll;" >
  {#each cc_data as dep, i}  
    <br>
        <Dep {dep} bind:tarif={tarif} {status}  {rtc} bind:edited_display={edited_display} owner={dep.admin.email} 
        {operator} {abonent} update={GetUsers} RemoveDep={RemoveDep}/>

  {/each}
  {#if edited_display }
    {#if addDep}
      <svg class="add_dep" height="50" width="50" on:click={AddDep} style="float:right">
        <title>add dep</title>
        <glyph glyph-name="plus-circle" unicode="&#xefc0;" horiz-adv-x="50" />
        <!-- <g class="currentLayer" style="color:green; stroke:lightgrey; stroke-width:10px"> -->
        <path d="M500.2 62.5c-241.8 0-437.7 195.89999999999998-437.7 437.3 0 241.8 195.89999999999998 437.7 437.7 437.7 241.40000000000003 0 437.3-195.89999999999998 437.3-437.7 0-241.40000000000003-195.89999999999998-437.3-437.3-437.3z m301.59999999999997 466.5c-0.6999999999999318 9-2.199999999999932 19.100000000000023-4.699999999999932 30.299999999999955h-237.70000000000005v237.80000000000007c-11.199999999999932 2.5-21.600000000000023 4.2999999999999545-31.399999999999977 5.100000000000023-9.700000000000045 0.6999999999999318-19.80000000000001 1.099999999999909-30.30000000000001 1.099999999999909-9 0-17.69999999999999-0.39999999999997726-26.69999999999999-1.099999999999909-9-0.7000000000000455-19.100000000000023-2.5-30.30000000000001-5.100000000000023v-237.70000000000005h-237.5c-2.5-11.199999999999932-4.299999999999983-21.699999999999932-5.099999999999994-31.399999999999977-0.6999999999999886-9.700000000000045-1.0999999999999943-19.80000000000001-1.0999999999999943-30.30000000000001 0-9 0.4000000000000057-17.69999999999999 1.0999999999999943-26.69999999999999 0.700000000000017-9 2.5-19.100000000000023 5.099999999999994-30.30000000000001h237.40000000000003v-237.5c11.199999999999989-2.5 21.599999999999966-4 31.399999999999977-4.699999999999989 9.699999999999989-1.0999999999999943 19.80000000000001-1.4000000000000057 30.30000000000001-1.4000000000000057 9 0 17.999999999999943 0.4000000000000057 26.69999999999999 1.4000000000000057 9 0.6999999999999886 19.100000000000023 2.1999999999999886 30.299999999999955 4.699999999999989v237.40000000000003h237.80000000000007c2.5 11.199999999999989 4 21.599999999999966 4.699999999999932 31.399999999999977 1.1000000000000227 9.699999999999989 1.400000000000091 19.80000000000001 1.400000000000091 30.30000000000001 0.09999999999990905 9.099999999999966-0.3000000000000682 18.099999999999966-1.400000000000091 26.69999999999999z"
        transform = "scale(.03)"  style="fill:lightgrey"/>
        <!-- </g> -->
      </svg>
    {/if}
  {/if}
  <div class="empty" style="height:200px"></div>
</div>

<style>

  ::-webkit-scrollbar {
      display:none;
  } 
  
  </style>

<script>
  import RTCOperator from '../js/RTCOperator.js';
  import { onDestroy, onMount } from 'svelte';
  import Dep from './Dep.svelte';
  import _  from 'lodash';

  export let operator
  export let abonent;
  export let status;
  
  let rtc = window.operator;
  $: if(signalch) 
      GetUsers();

  let cnt;
  $:if(cc_data && cc_data.length>0){

    _.forEach(cc_data, (dep,k)=>{  

      if(dep.admin && dep.admin.email===operator.email){
          operator.role = dep.admin.role;
      }
      cnt = k;
    }); 
  }

  let dep = {title:''};

  const url = new URL(window.location.href);  

  import {pswd} from '../js/stores.js'
  let psw = $pswd;

  import {signal} from '../js/stores.js'
  let signalch = $signal;

  import {langs} from '../js/stores.js'
  let lang = 'en';
  lang= $langs;



  onDestroy();

  let edited_display = false;
  let addDep = false;
  export let tarif; 

  let cc_data = [];

  $:if(cc_data && cc_data.length>0){

    _.forEach(cc_data, (dep,k)=>{    

      if(dep.admin && dep.admin.email===operator.email){
        // if(!abonent) 
          addDep = true;  
        operator.role = "admin";
      }

      cnt = k;
    }); 
  }

export async function GetUsers() {
  let par = {};
  par.proj = 'kolmit';
  par.func = 'getusers';
  par.type = rtc.type;
  par.abonent = abonent;
  par.em = operator.email;
  par.uid = rtc.uid;
  par.psw = psw;

  cc_data  = (await new Promise((resolve, reject)=>{
      signalch.SendMessage(par, (data)=>{
          resolve(data)
      });  
  }))['users'] 
}

async function AddDep(){
  if(operator.role==='admin'){    

    let par = {};
    par.proj = 'kolmit';
    par.func = 'adddep';
    par.em = operator.email;
    par.lang = lang;
    par.abonent = abonent;
    par.uid = rtc.uid;
    par.psw = rtc.psw;
    par.id = cnt+1;

    let res = (await new Promise((resolve, reject)=>{
      signalch.SendMessage(par, (resp)=>{
        resolve(resp)
      });  
    }))['dep'] ;

    cc_data[res.id] = res;
  }
}

async function RemoveDep(id){

  let ind = _.findIndex( cc_data, {"id":id}); 
  if(confirm("Delete Dep "+ (cc_data[ind].alias?cc_data[ind].alias:'')+"?")){ 

    let par = {};
    par.proj = 'kolmit';
    par.func = 'remdep';
    par.role = operator;
    par.dep = id;
    par.em = operator.email;
    par.lang = lang;
    par.abonent = abonent;
    par.uid = rtc.uid;
    par.psw = psw;

    cc_data  = (await new Promise((resolve, reject)=>{
          signalch.SendMessage(par, (data)=>{
          resolve(data)
        });  
    }))['users'];    
  }
}

</script>




