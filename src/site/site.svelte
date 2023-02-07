<script>
  import { onMount, onDestroy, getContext, setContext } from 'svelte';
  import SelectMenu from './SelectMenu.svelte';
  import Operator from '../operator/kolmit/Operator.svelte';
  import Content from '../operator/kolmit/modal/Content.svelte';
  import Modal from 'svelte-simple-modal';
  import md5 from 'md5';

  import { pswd } from '../operator/kolmit/js/stores.js';
  let psw;

  // const us_pswd = pswd.subscribe((data) => {
  // 	if(data){
  // 		psw = data;
  // 		sendCheck();
  // 	}
  // });

  let checked = false;

  let showDialog;
  let tarif;
  let lang = 'en';

  let operator = {},
    abonent = '',
    hash = null;

  let kolmit = JSON.parse(localStorage.getItem('kolmit'));

  if (!operator && kolmit.email) {
    operator.email = kolmit.email;
  }

  if (!abonent && kolmit.abonent) {
    abonent = kolmit.abonent;
  }

  if (kolmit.psw && operator) {
    psw = kolmit.psw;
    // if(!hash){
    delete kolmit.psw;
    localStorage.setItem('kolmit', JSON.stringify(kolmit));
    // }
  }

  const url = new URL(window.location.href);
  if (url.searchParams.get('operator'))
    operator.email = url.searchParams.get('operator');
  if (url.searchParams.get('abonent'))
    abonent = url.searchParams.get('abonent');
  if (url.searchParams.get('hash')) hash = url.searchParams.get('hash');

  if (url.searchParams.get('psw')) psw = md5(url.searchParams.get('psw'));

  if (!abonent) abonent = operator.email;

  if (abonent === 'globis@globis-software.com') {
    psw = '202cb962ac59075b964b07152d234b70';
  }

  import { signal } from '../operator/kolmit/js/stores.js';
  let signch;
  const us_signal = signal.subscribe((data) => {
    if (data) {
      signch = data;

      if (operator.email && !psw) {
        psw = md5(prompt('Password'));
        pswd.set(psw);
        if (hash) {
          kolmit.psw = psw;
          localStorage.setItem('kolmit', JSON.stringify(kolmit), md5(psw));
        }
      }
      sendCheck();
    }
  });

  import { dicts } from '../operator/kolmit/js/stores.js';
  let dict = $dicts;

  onDestroy(us_signal);

  onMount(async () => {
    if (!psw) {
      if (kolmit.psw) {
        // 	psw = kolmit.psw;
        // 	//delete kolmit.psw;
        // 	//localStorage.setItem('kolmit', JSON.stringify(kolmit));
      }
    } else {
      if (psw) pswd.set(psw);
    }
  });

  function sendCheck() {
    let par = {};
    par.proj = 'kolmit';
    par.func = 'check';
    par.status = 'check';
    par.type = 'operator';
    par.em = operator.email;
    par.abonent = abonent;
    par.hash = hash;
    par.psw = psw;
    par.host = signch.host;

    if (par.psw) {
      signch.SendMessage(par, (data) => {
        if (data.check) {
          let kolmit = JSON.parse(localStorage.getItem('kolmit'));
          kolmit.email = operator.email;
          kolmit.abonent = abonent;
          kolmit.psw = psw;
          //localStorage.setItem('kolmit',JSON.stringify(kolmit));

          if (par.hash === null) {
            tarif = data.tarif;
            checked = true;
          } else {
            const url = window.location.href.split('&hash=')[0];
            //window.location.assign(url);
          }
        }
        // else{
        // 	let psw_ = prompt(dict['invalid password'][lang]) +String(data.check);
        // 	if(psw_){
        // 		psw = md5(psw_);
        // 		pswd.set(psw);
        // 		sendCheck();
        // 	}
        // else{
        // 	localStorage.removeItem('kolmit');
        // 	const url = window.location.href;
        // 	window.location.assign(url);
        // }
      });
    }
  }

  function OnEmail(params) {
    const inputs = document
      .getElementById('inputs')
      .getElementsByTagName('input');
    let vals = {};
    for (let el in inputs) {
      if (inputs[el].attributes)
        vals[inputs[el].attributes[0].nodeValue] = inputs[el].value;
    }

    let par = {};
    par.proj = 'kolmit';
    par.func = 'operator';
    par.send_mail = vals['email'];
    par.psw = md5(vals['password']);
    par.lang = lang;
    SendEmail(par);
  }

  async function SendEmail(par) {
    if (!signch) return;

    let promise = new Promise((resolve, reject) => {
      signch.SendMessage(par, (data) => {
        resolve(data);
      });
    });
    let res = await promise;

    localStorage.setItem(
      'kolmit',
      JSON.stringify({ lang: lang, psw: par.psw })
    );
    alert(res.msg);
  }
</script>

{#if checked && tarif}
  <div>
    <Operator {operator} {tarif} />
  </div>
{/if}

{#if !operator.email}
  <SelectMenu bind:lang />

  <div id="inputs">
    <input type="email" placeholder="input your email" required />
    <div>
      <input type="password" placeholder="input your password" required />
      <input
        type="password"
        placeholder="repeat your password"
        on:change={OnEmail}
        required
      />
    </div>
  </div>
{/if}

<style>
</style>
