/* user.kolmit.RTCUser.svelte*/
import { writable } from 'svelte/store';
import  {RTCBase} from "./RTCBase";
import {getParameterByName, log} from './utils';

import {SignalingChannel} from './signalingChannel.js';

export const msg = writable('');

export default class RTCUser extends RTCBase {

    constructor(abonent,type, em, uid) {

        super(abonent,type, em, uid);

        this.redirected = false;
   
        this.component = '';

        this.abonent = getParameterByName('abonent');

        this.checking_tmr;

        this.fileInput = document.getElementsByClassName('fileInput')[0]?document.getElementsByClassName('fileInput')[0]:'';
        this.dataProgress = document.getElementById('dataProgress')?document.getElementById('dataProgress'):'';
                
        (async ()=>{
            this.host = (await (await fetch('../assets/host.json')).json());
                
            if(!this.signch) {
                this.signch = new SignalingChannel(this.host.host_ws);
            }

            window.user.SendCheck();

        })();


        this.EventsHandlers();    
    }


    Init(cb){
        let that = this;
        this.mode = '';
        let transAr=[/*'relay',*/this.abonent];
        that.main_pc = '';
        for (let i in transAr) {
            that.InitRTC(transAr[i],function () {
                cb();
            });
        }
    }

    Call(){

        
        this.Init(() => {
            this.GetUserMedia({audio: 1, video: 0}, ()=> {
                // document.getElementsByClassName('browser_container')[0].style.display = 'none';
                let par = {};
                par.proj = 'kolmit';
                par.func = 'call';
                par.status = 'call';
                par.type = this.type;
                par.abonent = this.abonent.toLowerCase();
                par.em = this.em.toLowerCase();
                par.uid = this.uid;
                this.signch.SendMessage(par);
                this.status = 'call';    
            });
        });

    }

    Hangup(){
        if (this.DC) {
            this.DC.SendDCHangup(()=> {
 
            });

            this.Init(() => {
                this.SendCheck();
            });
        }
    }

    EventsHandlers() {

        // let that = this;     
        // try{
        //     window.addEventListener("message", function (e) {
        //         if (JSON.parse(e.data)['onclose'] === 'profile') {
        //             that.Call();
        //         }
        //     });
        // }catch(ex){
            
        // }
    }

    OnMessage(data) {

        let that = this;

        if (data.operators) {
            if (data.operators[that.abonent] &&
                data.operators[that.abonent].abonent=== that.abonent) {
                if (data.operators[that.abonent].status === 'offer') {

                    // that.pcPull[data.operators[that.abonent].abonent].params['rem_desc'] = data.operators[that.abonent].desc;
                    // that.pcPull[data.operators[that.abonent].abonent].params['rem_cand'] = data.operators[that.abonent].cand;
                }
                else if (data.operators[that.abonent].status === 'close'           
                    && data.operators[that.abonent].uid ===that.oper_uid) {
                    // $('.callObject').css('display', 'none')
                    that.RemoveTracks();

                    that.Hangup();                   

                }
            }
        }

        if (data.operator && data.operator.em === that.abonent) {

            // that.pcPull[data.operator.abonent].params['rem_desc'] = data.operator.desc;
            // that.pcPull[data.operator.abonent].params['rem_cand'] = data.operator.cand;
        }

        if (data.func === 'mute') {

            that.RemoveTracks();
            that.Init(() => {
                that.SendCheck();
            });
        }


        if (data.call || data.func === 'call') {
            log("received call: " + data.call + " from " + that.type, that);

            //window.parent.$('img.kolmit').parent().append(that.remoteVideo);

        }

        if (data.func === 'redirect') {
            
            that.em =  data.abonent.operator;
            // that.pcPull['all'].params = data.abonent.pcPull;
            that.InitRTC(data.abonent.operator,async  ()=> {
                let promise = new Promise((resolve, reject) => {
                    that.Call(resolve);          
                });

                let result = await promise;
            });

        }


        if(data.oper_uid){
            that.oper_uid = data.oper_uid;
        }

        if (data.desc) {
            if(that.pcPull[data.abonent].con.connectionState==="failed")
                that.pcPull[data.abonent].con.restartIce();

            if (that.pcPull[data.abonent]) {
                that.pcPull[data.abonent].params['rem_desc'] = data.desc;
                that.pcPull[data.abonent].setRemoteDesc(data.desc);
            }
        }
        if (data.cand) {
            if (that.pcPull[data.abonent]) {
                if (that.pcPull[data.abonent].con.signalingState === 'closed') {
                    return;
                }
                try {
                    that.pcPull[data.abonent].params['rem_cand'] = data.cand;
                    if (Array.isArray(data.cand)) {
                        for (let c in data.cand) {
                            that.pcPull[data.abonent].con.addIceCandidate(data.cand[c]);
                            //log(' Remote ICE candidate: \n' + (data.cand[c] ? JSON.stringify(data.cand[c]) : '(null)'), that);
                        }
                    } else {
                        that.pcPull[data.abonent].con.addIceCandidate(data.cand);
                        //log(' Remote ICE candidate: \n' + (data.cand ? JSON.stringify(data.cand) : '(null)'), that);
                    }

                } catch (ex) {
                    log(ex);
                }
            }
        }

        msg.set(data);
    }
}
