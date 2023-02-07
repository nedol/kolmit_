import { writable } from 'svelte/store';

export let tarif = writable();

export let editable = writable(false);


export let langs = writable();
let lang = 'en';

(async ()=>{
    try{
        lang = JSON.parse(localStorage.getItem('kolmit'))['lang'];
    }catch(ex){
        localStorage.setItem('kolmit',JSON.stringify({"lang":lang}));
    }
    langs.set(lang);
})();

export const hosts = writable();

export const msg = writable();

export let msg_1 = writable();

export let signal = writable();

export let dicts = writable();

