/* user/kolmit/RTCBase                                */
import {Peer} from './Peer'
import {DataChannelUser} from "./DataChannelUser";
import {log} from './utils';

// import {host_port, host_ws, host_server } from './host'

// const host_port = 'https://delivery-angels.com/server/';
// const host_ws = 'wss://nedol.ru/web-socket';
// let host_ws ='ws://localhost:3000/server/';// //

export class RTCBase{

    constructor(abonent,type,em,uid) {

        this.type = type;
        this.abonent = abonent;
        this.em = em;
        this.uid = uid;


        // if(!this.signch) {
        //     this.signch = new SignalingChannel(host_ws);
        // }

        this.email={'from':'','to':''}
        this.pcPull = {};
        this.main_pc;

        this.origin = location.origin;
        this.url;

        this.localStream;
        this.remoteStream;

        this.startTime;

        this.phone='';

        // this.vr = new VideoRecorder();
        // this.vr.open();

    }

    SendCheck(){
        
        let par = {};
        par.proj = 'kolmit';
        par.func = 'check';
        par.status = 'check';
        par.type = this.type;
        par.abonent = this.abonent;
        par.em = this.em;
        par.uid = this.uid;
        // par.abonent = this.abonent.toLowerCase();
        this.signch.SendMessage(par);
        this.status = 'check';
    }


    SendVideoOffer(key){
        let that = this;
        that.pcPull[key].params['loc_desc'] = '';
        that.pcPull[key].params['loc_cand'] = '';

        that.pcPull[key].con.createOffer(
            that.mode={
                offerToReceiveAudio: 1,
                offerToReceiveVideo: 1,
                iceRestart:1
            }
        ).then(
            desc => that.pcPull[key].onCreateVideoOfferSuccess(desc),
            that.pcPull[key].onCreateOfferError
        );

    }

    onIceStateChange(pc, event) {
        let that = this;
        if (pc) {

            if(pc.con.iceConnectionState==='new'){
                log(pc.pc_key +' ICE state change event: new', that);
            }

            if(pc.con.iceConnectionState==='checking'){
                log(pc.pc_key +' ICE state change event: checking', that);
                that.checking_tmr = setTimeout(function () {
                    pc.con.restartIce();
                },5000)

            }

            if(pc.con.iceConnectionState==='disconnected'){
                log(pc.pc_key +' ICE state change event: disconnected', that);
                pc.con.restartIce();

            }

            if(pc.con.iceConnectionState==='connected') {
                //that.signch.eventSource.close();
                clearTimeout(that.checking_tmr);
                log(pc.pc_key +' ICE state change event: connected', that);
                that.main_pc = pc.pc_key;

                //that.DC = new DataChannelUser(that, pc);
            }

            if(pc.con.iceConnectionState=== "failed") {
                /* possibly reconfigure the connection in some way here */
                log(pc.pc_key +' ICE state change event: failed', that);
                /* then request ICE restart */
                pc.con.restartIce();

            }

            if(pc.con.iceConnectionState==='completed') {
                log(pc.pc_key +' ICE state change event: completed', that);

            }
            log(pc.pc_key +' ICE state change event: '+ event.type, that);
        }
    }


    TransFile(fileInput) {
        let that = this;
        async function handleFileInputChange() {
            const file = fileInput.files[0];
            if (!file) {
                log('No file chosen');
            } else {
                // sendFileButton.disabled = false;
            }
            if (file.size === 0) {
                return;
            }
            dataProgress.style.display = 'block';
            dataProgress.attributes.max = file.size;

            let fileReader = new FileReader();
            fileReader.onload  =  (e) => {
                log('FileRead.onload ', e);
                that.DC.SendFile(e.target.result,file.name);
            }
            fileReader.readAsArrayBuffer(file);
        }
        fileInput.removeEventListener('change',fileInput.onchange );
        fileInput.onchange  =  handleFileInputChange;
        let event =  new PointerEvent('click', {
                bubbles: false,
                cancelable: true,
                view: window,
                });
        fileInput.dispatchEvent(event);
    }


    get RemoteStream(){
        return this.remoteStream;
    }

    async InitRTC(pc_key, cb) {

        let that = this;

        this.conf = (await (await fetch('./assets/ice_conf.json')).json());
    //    try{
    //         this.conf = (await (await fetch(this.host.host_server+'users/'+this.em+'ice_conf.json')).json());
    //     }catch(ex){

    //     }

        let pc_config = {
            iceTransportPolicy: 'all',
            lifetimeDuration: this.conf.lifetimeDuration,
            rtcpMuxPolicy: "require",
            bundlePolicy: "balanced",
            iceServers: [
                this.conf.stun
                , this.conf.turn
            ]
        };

        if(that.pcPull[pc_key]){
            if(that.DC) {
                that.DC.dc.close();
                that.DC = null
            }
            if(that.pcPull[pc_key].con) {
                that.pcPull[pc_key].con.close();
                that.pcPull[pc_key].con = null;
            }
        }

        let params = that.pcPull[pc_key]?that.pcPull[pc_key].params:{};
        
        that.pcPull[pc_key] = null;
        that.pcPull[pc_key] = new Peer(that, pc_config, pc_key);
        that.pcPull[pc_key].signch  = null;
        that.pcPull[pc_key].signch = that.signch;
        if(params)
            that.pcPull[pc_key].params = params;

       // setTimeout(function () {
            that.DC = new DataChannelUser(that, that.pcPull[pc_key]);
        //},100);


        //log('Starting call', that);
        this.startTime = Date.now();

        cb();
    }
    

    GetUserMedia(opts,cb){
        let that = this;
        navigator.mediaDevices.getUserMedia(opts)
            .then(stream => this.gotStream(stream,cb))
            .catch(function (e) {
                if(e.name === 'NotFoundError' || e.name === 'NotReadableError') {
                    if(opts.audio)
                        alert("Something wrong with mic?");
                    if(opts.video)
                        alert("Something wrong with camera?");

                    cb(false);
                }
            });
    }

    gotStream(stream, cb) {

        //log('Received local stream', this);

        if(!this.localStream)
            this.localStream = stream;

        this.getTracks(stream,cb);
    }

    getTracks(stream, cb){
        let that = this;

        stream.getTracks().forEach(track => {
            for(let key in that.pcPull) {
                if(key==='reserve')
                     continue;
                if(that.pcPull[key].con.iceConnectionState ==='disconnected' ||
                    that.pcPull[key].con.iceConnectionState ==='closed')
                    continue;

                that.localStream.addTrack(track);
                that.pcPull[key].sender = that.pcPull[key].con.addTrack(
                    track,
                    that.localStream);

                if(track.kind==='video') {
                    window.user.SetLocalVideo(that.localStream);

                }else if(track.kind==='audio') {
                    //that.remoteAudio.srcObject = null;
                    //that.localSound.srcObject = that.localStream;
                }

            }
        });

        var videoTracks = this.localStream.getVideoTracks();
        var audioTracks = this.localStream.getAudioTracks();

        if (videoTracks.length > 0) {
            log('Using video device: ' + videoTracks[0].label, that);
        }
        if (audioTracks.length > 0) {
            log('Using audio device: ' + audioTracks[0].label, that);
        }
        cb(true);
    }


    SendStatus(status){
        let par = {};
        par.proj = 'kolmit';
        par.func = 'status';
        par.type = this.type;
        par.abonent = this.abonent.toLowerCase();
        par.uid = this.uid;
        par.em = this.em.toLowerCase();
        par.status = status;
        this.signch.SendMessage(par);
        this.status = status;
    }


    RemoveTracks(){
        let that = this;
        if (that.localStream) {
            const videoTracks = that.localStream.getVideoTracks();
            videoTracks.forEach(videoTrack => {
                if (videoTrack.readyState == 'live' && videoTrack.kind === 'video') {
                    videoTrack.stop();
                }

                that.localStream.removeTrack(videoTrack);

            });
            const audioTracks = that.localStream.getAudioTracks();
            audioTracks.forEach(audioTrack => {
                if (audioTrack.readyState == 'live' && audioTrack.kind === 'audio') {
                    audioTrack.stop();
                }
                that.localStream.removeTrack(audioTrack);
            });
        }
    }


}
