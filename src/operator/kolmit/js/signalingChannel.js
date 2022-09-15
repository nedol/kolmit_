'use strict';

import {log} from './utils'

import {msg_1} from './stores.js'

import {signal} from './stores.js'
// export const msg = writable(''); 

export default class SignalingChannel{

    constructor(host) {

        this.host = host;
        this.cb;
        this.timeout = 10000;
        this.cb = {};

        this.openSocket();

    }

    openSocket(){

        if(!this.ws)
            this.ws = new WebSocket(this.host.host_ws);

            this.ws.onerror = function (error) {
                log('Connect Error: ' + error.toString());
            }

            this.ws.onopen = ()=>{
                this.waitForSocketConnection(this.ws, ()=>{
                    signal.set(this)
                });
                this.keepAlive();
            }
    
            this.ws.onclose = function () {
                log('echo-protocol Connection Closed');
                this.ws = new WebSocket(this.url);
            }   

    }

    keepAlive(){
        setInterval(()=>{
            if(this.ws.readyState === 1)
                this.ws.send(encodeURIComponent('kolmit'));
        },this.timeout);
    }

    waitForSocketConnection(socket, callback){

        let that = this;
        setTimeout(
            function () {
                if (socket.readyState === 1) {
           
                    if (callback != null){
                        callback();
                    }
                } else {
                    console.log("wait for connection...")
                    that.waitForSocketConnection(socket, callback);
                }
    
            }, 5); // wait 5 milisecond for the connection...
    }

    SendMessage(rtc_par,cb){
        let that= this;
        this.cb[rtc_par.func] = cb;
        this.ws.onmessage =   (message) =>{
            if (message.type === 'message') {
                // log("Received: '" + message.originalEvent.data + "'");    
                const data = JSON.parse(decodeURIComponent(message.data));
                if(that.cb[data.func]){           
                    that.cb[data.func](data); 
                    delete that.cb[data.func];
                }                           
                
                // msg.set(data);
                msg_1.set(data);
                if(window.operator){
                    window.operator.OnMessage(data);
                }
                cb(data);
            }
        }
        try {
            if(that.ws.readyState===1)
                that.ws.send(encodeURIComponent(JSON.stringify(rtc_par)));    
            else{
                that.openSocket(); 
                that.ws.send(encodeURIComponent(JSON.stringify(rtc_par)));  
            }
        }catch(ex){
            return false;
        }   
          
    }


}


(async ()=>{
    const host = (await (await fetch('../assets/host.json')).json());
    new SignalingChannel(host);    
})();
