<div class='content'>
  <section class="pricing-table">
      <div class="container">
          <div class="block-heading">
              <h2>{dict['Our Pricing'][lang]}</h2>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc quam urna, dignissim nec auctor in, mattis vitae leo.</p>
          </div>

          <div class="row justify-content-md-center">
              {#if all_tarifs}
              {#each Object.entries(all_tarifs)  as [name,tarif]}
              <div class="col-md-5 col-lg-4">
                  <div class="item">
                      {#if tarif['Ribbon']}
                      <div class="ribbon">{dict[tarif['Ribbon']][lang]}</div>
                      {/if}
                      <div class="heading">
                          <h3>{name.toUpperCase()}</h3>
                      </div>
                      <p>{tarif['Desc'][lang]}</p>
                      <div class="features">  
                        {#if tarif.Duration}                      
                        <h4><span class="feature">{dict['Duration'][lang]}</span> : <span class="value">{tarif.Duration} {dict['Days'][lang]}</span></h4>
                        {/if}
                        <h4><span class="feature">{dict['Waiting Mode'][lang]}</span> : <span class="value">{tarif['Waiting Mode'][lang]}</span></h4>
                        <h4><span class="feature">{dict['Total Operators'][lang]}</span> : <span class="value">{tarif['Total Operators'][lang]}</span></h4>
                        <h4><span class="feature">{dict['Multi Operator Mode'][lang]}</span> : <span class="value">{dict['Multi Operator Mode'][lang]}</span></h4>
                        <h4><span class="feature">{dict['Total Depts'][lang]}</span> : <span class="value">{dict['Total Depts'][lang]}</span></h4>
                        <h4><span class="feature">{dict['Dedicated Servers'][lang]}</span> : <span class="value">{dict['Dedicated Servers'][lang]}</span></h4>                      
                        <h4><span class="feature">{dict['Full Support'][lang]}</span> : <span class="value">{dict['Full Support'][lang]}</span></h4>
                      </div>
                      <div class="price">
                          <h4>{tarif['Price'][lang]}</h4><h5>/{dict['month'][lang]}</h5>
                      </div>
                      <button class="btn btn-block btn-outline-primary" type="submit" tarif={name} on:click={onSubmit}>{dict['Choose'][lang]}</button>
                  </div>
              </div>
              {/each}
              {/if}

          </div>
      </div>
  </section>

<div style="height: 400px;"></div>
</div>

<style>
    @import url("https://fonts.googleapis.com/css?family=Montserrat");
    
    .pricing-table{
      background-color: #eee;
      font-family: 'Montserrat', sans-serif;
    }
    
    .pricing-table .block-heading {
      padding-top: 50px;
      margin-bottom: 40px;
      text-align: center; 
    }
    
    .pricing-table .block-heading h2 {
      color: #3b99e0;
    }
    
    .pricing-table .block-heading p {
      text-align: center;
      max-width: 420px;
      margin: auto;
      opacity: 0.7; 
    }
    
    .pricing-table .heading {
      text-align: center;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1); 
    }
    
    .pricing-table .item {
      background-color: #ffffff;
      box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.075);
      border-top: 2px solid #5ea4f3;
      padding: 30px;
      overflow: hidden;
      position: relative; 
    }
    
    .pricing-table .col-md-5:not(:last-child) .item {
      margin-bottom: 30px; 
    }
    
    .pricing-table .item button {
      font-weight: 600; 
    }
    
    .pricing-table .ribbon {
      width: 160px;
      height: 32px;
      font-size: 12px;
      text-align: center;
      color: #fff;
      font-weight: bold;
      box-shadow: 0px 2px 3px rgba(136, 136, 136, 0.25);
      background: #4dbe3b;
      transform: rotate(45deg);
      position: absolute;
      right: -42px;
      top: 20px;
      padding-top: 7px; 
    }
    
    .pricing-table .item p {
      text-align: center;
      margin-top: 20px;
      opacity: 0.7; 
    }
    
    .pricing-table .features .feature {
      font-weight: 600; }
    
    .pricing-table .features h4 {
      text-align: center;
      font-size: 18px;
      padding: 5px; 
    }
    
    .pricing-table .price h4 {
      margin: 15px 0;
      font-size: 45px;
      text-align: center;
      color: #2288f9; 
    }

    .pricing-table .price h5 {
      margin: 15px 0;
      font-size: 20px;
      text-align: center;
      color: grey 
    }
    
    .pricing-table .buy-now button {
      text-align: center;
      margin: auto;
      font-weight: 600;
      padding: 9px 0; 
    }

  
    .content {
        /* display: none; */
        padding: 0 18px;
        width: 100%;
        height: 100%;
        /* overflow: hidden */
        overflow-y: scroll;;
        transition: max-height 0.2s ease-out;
        background-color: #f1f1f1;
    }

    div.price{
        display: inline-flex; 
        justify-content: center;
        align-items: flex-end; 
        width:100%;
    }
    </style>

<script>
    import {onMount,onDestroy} from 'svelte'

    export let rtc;

    import {langs} from '../js/stores.js'
    let lang = 'en';
    const unsubscr_lang = langs.subscribe((data) => {
        lang = data;
    });

    import {dicts} from '../js/stores.js';
    const dict = $dicts


    let tarif = 'free';
    let all_tarifs;

    (async ()=>{
      all_tarifs = 
      (await (await fetch('/server/kolmit/tarifs/tarifs.json?')).json());
    })();
  
    onDestroy(unsubscr_lang,us_dict);



  

    async function onSubmit(el){
        // alert(el.target.attributes.tarif.value);
        if(el.target.attributes.tarif.value==='basic'){
      
            let data = await rtc.ChooseTarif(el.target.attributes.tarif.value);
            tarif = all_tarifs[el.target.attributes.tarif.value];
     
        }
    }

    </script>