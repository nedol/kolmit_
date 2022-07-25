import { writable } from 'svelte/store';


export let tarif = writable();
export let editable = writable(false);


(async ()=>{

    (async ()=>{
        try{
            tarif.set((await (await fetch('/server/kolmit/tarifs/tarifs.json?')).json()));
        }catch(ex){
        }
    })();
})();

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