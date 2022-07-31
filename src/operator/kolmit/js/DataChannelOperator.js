import {DataChannel} from "./DataChannel";
import { writable } from 'svelte/store';

export const dc_msg = writable(); 

export class DataChannelOperator extends DataChannel{
    constructor(rtc,pc){
        super (rtc, pc);

        let that = this;
        that.cnt_call = 0;
        // this.dc.onopen = () => {
        //     console.log('OnOpenDataChannel');
        // }

        this.dc.onclose = () => {
            // rtc.OnMessage({func:'mute'});
        };

        pc.StartEvents();


        pc.con.ondatachannel = (event)=> {
            console.log('Receive Channel Callback');

            this.dc = event.channel;//change dc

            this.dc.onopen = () => {
                //this.dc.onopen = null;
                if (that.dc.readyState==='open') {
                    console.log(that.pc.pc_key+" datachannel open");
                }


                return true;
            }
        };
        let data = '';
        let receiveBuffer = [];
        let receivedSize = 0;
        this.dc.removeEventListener("message",this.dc.onmessage);
        this.dc.onmessage = function (event) {
            try {
                let parsed = JSON.parse(event.data);
                if (parsed.type==="eom") {               

                    if(data){
                        that.rtc.SendToComponent(JSON.parse(data));
                        that.rtc.OnMessage(JSON.parse(data), that);
                        dc_msg.set(JSON.parse(data));
                    }
                    data = '';
                    return;
                }
                data += parsed.slice;
                if (parsed.file) {
                    // document.getElementById('dataProgress').attributes.max = parsed.length;
                }
                if (parsed.type==="eof") {
                    const received = new Blob(receiveBuffer);
                    receiveBuffer = [];

                    receivedSize = 0;
                    if(confirm("Получен файл: "+parsed.file+". Размер: "+parsed.length+" Сохранить?")){
                        let download_href = document.getElementById('download_href');
                        download_href.text("Получен файл: "+parsed.file+". Размер: "+parsed.length+" Сохранить?");
                        download_href.attributes.href = 'URL.createObjectURL(received)';
                        download_href.attributes.download = parsed.file;
                        download_href.click();
                    }
                    setTimeout(function () {
                        document.getElementById('dataProgress').style.display = 'none';
                    },2000)

                    return;
                }
            }catch(ex){
                data = '';
                if(!event.data.byteLength)
                    return;

            }

        };
    }

    SendFile(data, name){
        // if(this.forward){
        //     data.email = this.forward;
        //     this.forward = '';
        //     data.func = 'answer';
        // }
        try {
            if(this.dc.readyState==='open') {
                let size = 16384;
                const numChunks = Math.ceil(data.byteLength / size);

                this.dc.send(JSON.stringify({file:name,length:data.byteLength}), function (data) {
                    console.log(data);
                });
                for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
                    const slice = data.slice(o, o + size);
                    document.getElementById('dataProgress').attributes.value =  o + size;
                    this.dc.send(slice, function (data) {
                        console.log(data);
                    });
                }
                setTimeout(function () {
                    document.getElementById('dataProgress').style.display = 'none';
                },2000);

                this.dc.send(JSON.stringify({type:'eof',file:name,length:data.byteLength}), function (data) {
                    console.log(data);
                });
            }
        }catch(ex){
            console.log(ex);
        }
    }

    SendData(data, cb){
        // if(this.forward){
        //     data.email = this.forward;
        //     this.forward = '';
        //     data.func = 'answer';
        // }
        try {

            if(this.dc.readyState==='open') {
                data = JSON.stringify(data);
                let size = 16384;
                const numChunks = Math.ceil(data.length / size)

                for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
                    this.dc.send(JSON.stringify({slice:data.substr(o, size)}));
                }
                this.dc.send(JSON.stringify({type:'eom'}));
            }

            if(cb)
                cb();
        }catch(ex){
            console.log(ex);
    
        }
    }


    // SendDCCnt(){
    //     let that = this;
    //     let par = {};
    //     par.proj = 'kolmit';
    //     par.uid = that.rtc.uid;
    //     par.func = 'cnt';
    //     par.call = that.rtc.call_num;
    //     par.type = that.rtc.type;
    //     par.email = that.rtc.email.from;
    //     par.profile = localStorage.getItem("kolmi_abonent");

    //     if(that.dc.readyState==='open') {
    //         that.SendData(par);

    //         //that.rtc.pcPull[that.rtc.main_pc].params['loc_cand'] = [];
    //     }

    //     that.rtc.PlayCallCnt();
    // }

    SendDCHangup(cb){
        let par = {};
        par.proj = 'kolmit';
        par.func = 'mute';
        par.type = this.rtc.type;

        this.SendData(par,cb);
    }

    SendDCClose(cb){
        let par = {};
        par.proj = 'kolmit';
        par.func = 'close';
        par.type = this.rtc.type;

        this.SendData(par, cb);
    }


    SendDCTalk(cb){
        let par = {};
        par.proj = 'kolmit';
        par.func = 'talk';
        par.type = this.rtc.type;

        this.SendData(par, cb);
    }

    SendDCCand(cand,key,msg) {

        let par = {};
        par.proj = 'kolmit';
        par.func = 'offer';
        par.cand = cand;
        par.trans = key;
        par.abonent = this.rtc.abonent;
        par.msg = msg;

        this.SendData(par);
    }


    SendDCDesc(desc,key,msg) {

        let par = {};
        par.proj = 'kolmit';
        par.func = 'offer';
        par.desc = desc;
        par.trans = key;
        par.abonent = this.rtc.abonent;
        par.msg = msg;

        this.SendData(par);
    }

    SendDCOffer(key,msg) {

        let par = {};
        par.proj = 'kolmit';
        par.func = 'offer';
        par.desc = this.pc.params['loc_desc'];
        par.cand = this.pc.params['loc_cand'];
        par.trans = key;
        par.abonent = this.rtc.abonent;
        par.msg = msg;

        this.SendData(par);

    }

    SendDCVideoOK(cb){
        let par = {};
        par.proj = 'kolmit';
        par.func = 'video';
        par.type = this.rtc.type;

        this.SendData(par, cb);
    }

    SendRedirect(abonent, resolve) {

        let par = {};
        par.proj = 'kolmit';
        par.func = 'redirect';
        par.abonent = abonent;

        if(this.dc.readyState==='open') {
            this.SendData(par);
            // this.rtc.OnMessage({func: 'mute'});
            let date_str = new Date().toLocaleString("es-CL");
            resolve(date_str);
        }
    }

}
