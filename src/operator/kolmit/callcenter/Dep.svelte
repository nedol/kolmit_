<!-- <Collapse>     -->
  {#if dep.id!=='0'}
  <button class="collapsible" {owner} bind:this={button}  on:click={OnCollClick}> 
    <input type="text" {readonly} style="border-width: 0px;" on:change={OnDepChange({dep})} on:click={OnClickInput} 
      bind:value={dep.alias}  placeholder="input dep name"/>
   
      {@debug operator}
      {#if edited_display}

    {#if operator.email===abonent} 
    <svg height="30" width="30"  on:click={RemoveDep(dep.id)} style="position: relative;float:right">
      <glyph glyph-name="minus-circle" unicode="&#xefc0;" horiz-adv-x="50" />
      <g class="currentLayer">
        <path d="M500.2 62.5c-241.8 0-437.7 195.89999999999998-437.7 437.3 0 241.8 195.89999999999998 437.7 437.7 437.7 241.40000000000003 0 437.3-195.89999999999998 437.3-437.7 0-241.40000000000003-195.89999999999998-437.3-437.3-437.3z m301.59999999999997 466.5c-0.6999999999999318 9-2.199999999999932 19.100000000000023-4.699999999999932 30.299999999999955h-593.9000000000001c-2.499999999999943-11.199999999999932-4.299999999999926-21.699999999999932-5.0999999999999375-31.399999999999977-0.6999999999999886-9.699999999999932-1.0999999999999943-19.799999999999955-1.0999999999999943-30.299999999999955 0-9 0.4000000000000057-18 1.0999999999999943-26.700000000000045 0.700000000000017-9 2.5-19.099999999999966 5.099999999999994-30.299999999999955h593.9000000000001c2.4999999999998863 11.199999999999989 3.9999999999998863 21.599999999999966 4.699999999999818 31.399999999999977 1.1000000000000227 9.699999999999989 1.400000000000091 19.80000000000001 1.400000000000091 30.30000000000001 0.09999999999990905 9.099999999999966-0.3000000000000682 17.69999999999999-1.400000000000091 26.69999999999999z"
          transform = "scale(.03)"  style="fill:lightgrey; stroke:black; stroke-width:20px"/>
      </g>
    </svg>
    {/if}
    {/if}
  </button>
  {/if}

  <div class="content"  bind:this={content} style="max-height:0px">
      <br>
    {#if dep.admin}     
      <div>
        <Oper id={dep.admin.id}
          bind:status={status} {operator} {abonent} bind:dep={dep} bind:user={dep.admin} {update} {readonly}></Oper>
      </div>

    {/if}
    {#if dep.staff}
    {#each dep.staff as user, u} 
      {#if user.email || (!user.email && owner===operator.email)}
        <Oper id={u}
          bind:status={status} {operator} {abonent} bind:dep={dep} bind:user={user} {update} {readonly}>
        </Oper>
        <br>
      {/if}
    {/each} 
    {/if}
    {#if edited_display}
    <div class="add_oper" on:click={AddOper} style="display:{isAddOper}">
      <svg   style="position: relative;left: 45%; height:40, width=40">
        <title>add-user</title>
        <glyph glyph-name="contact-add" unicode="&#xefc0;" horiz-adv-x="50" />
        <!-- <g class="currentLayer" style="color:green; stroke:lightgrey; stroke-width:10px"> -->
        <path d="M134.1 761.6c-14.5 0-26.39999999999999-11.899999999999977-26.39999999999999-26.399999999999977v-523.5c0-14.500000000000057 11.899999999999991-26.400000000000034 26.39999999999999-26.400000000000034h639.8c14.5 0 26.399999999999977 11.899999999999977 26.399999999999977 26.399999999999977v239.40000000000003c15.800000000000068 2.3999999999999773 30.90000000000009 6.2999999999999545 45.40000000000009 11.899999999999977v-288.7c0-14.5-11.900000000000091-26.400000000000006-26.40000000000009-26.400000000000006h-730.4c-14.499999999999972 0-26.399999999999977 11.900000000000006-26.399999999999977 26.400000000000006v598.7c0 14.399999999999977 11.900000000000006 26.299999999999955 26.400000000000006 26.299999999999955h479.30000000000007c-7.400000000000091-11.899999999999977-13.700000000000045-24.59999999999991-18.700000000000045-37.69999999999993h-415.4z m164.70000000000002-245h-19.400000000000034c-41.69999999999999 0-75.39999999999998 33.799999999999955-75.39999999999998 75.39999999999998v21c0 13.100000000000023 10.699999999999989 23.799999999999955 23.80000000000001 23.799999999999955h251.7c13.100000000000023 0 23.899999999999977-10.699999999999932 23.899999999999977-23.799999999999955v-21c0-41.60000000000002-33.799999999999955-75.39999999999998-75.39999999999998-75.39999999999998h-19.600000000000023c-10.099999999999966 0-18.299999999999955-8.100000000000023-18.299999999999955-18.30000000000001 0-3.8000000000000114 1.5-7.300000000000011 4.199999999999989-10 11.300000000000011-11 20.899999999999977-25.80000000000001 27.69999999999999-41.80000000000001 1.5 1.1000000000000227 2.8999999999999773 1.8000000000000114 4.5 1.8000000000000114 10.899999999999977 0 23.80000000000001-24.19999999999999 23.80000000000001-40.80000000000001 0-16.399999999999977-1.5-29.80000000000001-12.300000000000011-29.80000000000001-1.3000000000000114 0-2.8000000000000114 0.30000000000001137-4 0.6000000000000227-0.8000000000000114-44.69999999999999-12.100000000000023-100.40000000000003-80.30000000000001-100.40000000000003-71.19999999999999 0-79.5 55.60000000000002-80.19999999999999 100.20000000000005-1-0.20000000000004547-2-0.4000000000000341-2.8999999999999773-0.4000000000000341-11 0-12.5 13.400000000000034-12.5 29.80000000000001 0 16.5 12.899999999999977 40.80000000000001 23.799999999999955 40.80000000000001 1.3000000000000114 0 2.6000000000000227-0.4000000000000341 3.8000000000000114-1.1000000000000227 6.800000000000011 15.699999999999989 16.19999999999999 30.30000000000001 27.30000000000001 41 2.8000000000000114 2.6000000000000227 4.199999999999989 6.300000000000011 4.199999999999989 10-0.19999999999998863 10.199999999999989-8.399999999999977 18.400000000000034-18.399999999999977 18.400000000000034z m381.2-189.3c0-9.699999999999989-7.899999999999977-17.80000000000001-17.799999999999955-17.80000000000001h-211.00000000000006c6 13.600000000000023 10.300000000000011 30.100000000000023 12.199999999999989 50.60000000000002 4.600000000000023 2.8999999999999773 7.900000000000034 7.399999999999977 10.700000000000045 12.799999999999955h188.10000000000002c9.699999999999932 0 17.799999999999955-7.899999999999977 17.799999999999955-17.599999999999966v-28z m-2.1000000000000227 151.09999999999997c1.1000000000000227-2.3999999999999773 2.1000000000000227-5 2.1000000000000227-7.699999999999989v-28c0-9.699999999999989-7.899999999999977-17.80000000000001-17.799999999999955-17.80000000000001h-183.80000000000007c-5 18.900000000000034-17.099999999999966 38.700000000000045-34.299999999999955 43.900000000000034l-1.6000000000000227 2.8000000000000114v16.69999999999999h213.20000000000005c7.2999999999999545-3.6999999999999886 14.699999999999932-7 22.199999999999932-9.900000000000034z m-125 125.10000000000002c8.899999999999977-23.299999999999955 21.5-44.5 37.39999999999998-63.200000000000045h-71.69999999999993c9.399999999999977 15 15.100000000000023 32.700000000000045 15.100000000000023 51.60000000000002v11.5h19.199999999999932v0.10000000000002274z m332.20000000000005-55.39999999999998c-30.700000000000045-31.100000000000023-73.10000000000002-50.60000000000002-119.70000000000005-52.400000000000034h-6.2999999999999545c-49.700000000000045 0-94 19.900000000000034-126.5 52.400000000000034-32.10000000000002 32.10000000000002-52.39999999999998 76.79999999999995-52.39999999999998 126 0 25.299999999999955 5.399999999999977 49.299999999999955 14.899999999999977 71 9 20.699999999999932 21.699999999999932 39.69999999999993 37.5 55.60000000000002 32.5 32.09999999999991 76.79999999999995 52 126.5 52 98.39999999999998 0 178.39999999999998-80 178.39999999999998-178.4000000000001 0-49.39999999999998-19.899999999999977-94.09999999999991-52.39999999999998-126.19999999999993z m-41.60000000000002 152.19999999999993h-58.700000000000045v58.30000000000007h-52v-58.30000000000007h-58.299999999999955v-52.39999999999998h58.299999999999955v-58.299999999999955h52v58.299999999999955h58.700000000000045v52.39999999999998z"
        transform = "scale(.04)"  style="fill:grey"/>
        <!-- </g> -->
      </svg>
    </div>
  <!-- {/if} -->
  {/if}
</div>
<!-- </Collapse> -->
<style>
  .collapsible {
    background-color: rgb(158, 158, 158);
    color: white;
    cursor: pointer;
    padding: 18px;
    width: 100%;
    border: none;
    text-align: left;
    outline: none;
    font-size: 15px;
  }

  .content {
    padding: 0 10px;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.2s ease-out;
    background-color: #f1f1f1;
  }


  input:not([readonly])::placeholder{
    color:rgb(35, 33, 158); 
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
    import {onDestroy, onMount } from 'svelte';
    // import { Collapse, Input  } from 'svelma';
    import Dep from './Dep.svelte';
   
    // import "https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css";
    // import { Button, Col, Row } from 'sveltestrap';

  import Oper from './Oper.svelte'
  import _  from 'lodash';

  export let status;
  export let dep;
  export let owner;
  export let operator;
  export let abonent;
  export let tarif;  

  let button;
  let isAddOper = "none";

  import {signal} from '../js/stores.js'

  const signalch = $signal;      

  (async ()=>{
    try{
      tarif.params = (await (await fetch('../assets/tarifs/tarifs.json')).json())[tarif.name];
    }catch(ex){
      console.log(ex)
    }
    if(tarif && tarif.params && dep.staff)
      tarif.deps = tarif.params['Total Depts']['en'].split('up to ')[1]>=dep.staff.length || tarif.params['Total Depts']['en']==='unlim' ;
  })();

  $:if(edited_display){
    if (
      (!operator.abonent && dep.id==='0')  
      || (!operator.abonent && !dep.admin)
      || (operator.abonent && operator.email===dep.admin.email)
      ){
      isAddOper = 'block';
    }
  }


  let readonly = false;
  let content;
  

  onMount(() => {
    if(dep.id==='0'){
      content.style.maxHeight = 200 + content.scrollHeight +  "px";              
    }

    let ar = document.getElementsByClassName('add_oper');
    for(let b in ar){
          if(!readonly){
            if(ar[b].scrollIntoView)
              ar[b].scrollIntoView(false);
            OnCollClick(new Event('expand'));
          }        
    }
  });

  export let update;
  export let edited_display;

  import {editable} from '../js/stores.js'
  const us_edit = editable.subscribe((data) => {
      edited_display = data;
      readonly = !edited_display;
    
  });

  import {langs} from '../js/stores.js'
  let lang = 'en';
  const us_lang = langs.subscribe((data) => {
    lang = data;
  });

  import {pswd} from '../js/stores.js'
  let psw;
  const us_pswd = pswd.subscribe((data) => {
    psw = data;
  });
 
  onDestroy(us_edit,us_lang,us_pswd);

  function OnClickInput(ev){
    if(edited_display)
    if(dep.admin.email===owner || !abonent){
      ev.currentTarget.readOnly = false;
    }
  }

  async function OnDepChange(ev){

    let par = {};
    par.proj = 'kolmit';
    par.func = 'changedep';
    par.abonent = abonent;
    par.em = operator.email;
    par.psw = psw;
    par.dep = dep;

    new Promise((resolve, reject)=>{
        signalch.SendMessage(par, (data)=>{
            resolve(data)
        });  
    });
  }

  export async function AddOper(ev){

    content.style.maxHeight = 100 + content.scrollHeight +  "px";       
    let res   = await  HandleOper("add", abonent);     
    
    update();
  }


  function HandleOper(func, abonent, resolve){

    let par = {};
    par.proj = 'kolmit';
    par.func = func+'oper';
    par.abonent = abonent;
    par.em = operator.email;
    par.psw = psw;
    par.lang = lang;
    par.dep_id = dep.id;

    return new Promise((resolve, reject)=>{
        signalch.SendMessage(par, (data)=>{
            resolve(data)
        });  
    });
  }
  
  export let RemoveDep;
  
  function OnCollClick(ev){

    if(content && ev.type !=='expand')  
    if (content.style.maxHeight == '0px'){
      content.style.maxHeight = content.scrollHeight +  "px";
      } else {
        content.style.maxHeight = '0px';
      } 

      console.log(content.style.maxHeight)
  }
    
    
  </script>

