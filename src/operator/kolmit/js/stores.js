import { writable } from 'svelte/store';


export let editable = writable(false);

export let langs = writable();

export let pswd = writable();

let lang = 'en', psw = '';

(async ()=>{
    try{
        lang = JSON.parse(localStorage.getItem('kolmit'))['lang'];
        psw = JSON.parse(localStorage.getItem('kolmit'))['psw'];

    }catch(ex){
        localStorage.setItem('kolmit',JSON.stringify({"lang":lang}));
    }
    langs.set(lang);    
    pswd.set(psw);
})();

export let posterst = writable();

export let msg_1 = writable();

export let signal = writable();