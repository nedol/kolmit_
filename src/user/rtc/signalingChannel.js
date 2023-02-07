'use strict';

import {log} from './utils'


export class SignalingChannel{

    constructor(url) {

        this.url = url;
        this.cb;
        this.timeout = 10000;

        if(!this.ws)
            this.ws = new WebSocket(this.url);


            this.ws.onerror = function (error) {
                log('Connect Error: ' + error.toString());
            }

            this.ws.onopen = ()=>{
                this.keepAlive();
            }
    
            this.ws.onclose = function () {
                log('echo-protocol Connection Closed');
                this.ws = new WebSocket(this.url);
            }
    
            this.ws.onmessage =   (message) =>{
                if (message.type === 'message') {
                    // log("Received: '" + message.originalEvent.data + "'");
                    if(this.cb)
                        this.cb();
                    const data = JSON.parse(decodeURIComponent(message.data))
                    window.user.OnMessage(data);
                    // window.user.SendToComponent(data);
                }
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
                    console.log("Connection is made")
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
        that.cb = cb;
        if(that.ws.readyState!=1) {
            that.ws = new WebSocket(this.url);
            that.ws.onopen = function (connection) {
                that.waitForSocketConnection(that.ws, function(){
                    that.ws.send(encodeURIComponent(JSON.stringify(rtc_par)));

                });              
            }
            that.ws.onmessage =  function (message) {

                if (message.type === 'message') {
                    log("Received: '" + message.data + "'");
                    const data = JSON.parse(decodeURIComponent(message.data))
                    window.user.OnMessage(data);
                    // window.user.SendToComponent(data);
                }
                if(that.cb)
                    that.cb(message);
            }
            return;
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
        return true;
    }


}
