
  
  <h2>{message}</h2>
  
  {#if hasForm}
    <div id="email_container" style="display:flex">
        <input class="psw" placeholder="type password"
        type="password" required
            bind:value={psw_0} />

        <input class="re_psw" placeholder="retype password"
        type="password" required
            bind:value={psw_1}
            on:keydown={e => e.which === 13 && _onOkay()} />
    </div>    
  {/if}
  
  <div class="buttons">
      <button on:click={_onCancel}>
          Cancel
      </button>
      <button on:click={_onOkay}>
          Okay
      </button>
  </div>


  <style>
    h2 {
          font-size: 2rem;
          text-align: center;
      }
      
      input {
          width: 100%;
      }
      
      .buttons {
          display: flex;
          justify-content: space-between;
      }
  </style>
  
<script>
    import { getContext } from 'svelte';
    
    export let message;
    export let hasForm = false;
    let psw_0, psw_1;
    //   export let onCancel = () => {};
    //   export let onOkay = () => {};
  
    const { close } = getContext('simple-modal');

    import {pswd} from '../js/stores.js'
    const us_pswd = pswd.subscribe((data) => {

    });
      

    function _onCancel() {
    //   onCancel();
        close();
    }
    
    function _onOkay() {
        if(psw_0===psw_1){
            pswd.set(psw_1);
            let kolmit = JSON.parse(localStorage.getItem('kolmit'));
            kolmit.psw = psw_1;
            localStorage.setItem('kolmit',JSON.stringify(kolmit));
            close();
        }else{
            alert('Повторите ввод данных')
        }

    }

  </script>
  
