'use strict'
export {User};
let md5 = require('md5');
var isJSON = require('is-json');
let utils = require('../utils');
var urlencode = require('urlencode');
import {MenuUser} from '../menu/menu.user';
let SSE = require('../sse/sse.js');

var moment = require('moment');

var ColorHash = require('color-hash');

require('bootstrap/js/modal.js');
require('bootstrap-datetimepicker-npm/build/js/bootstrap-datetimepicker.min');

let hammer = require('jquery-hammerjs');

// require("../../lib/aframe-orbit-controls-component.min")

require('aframe-orbit-controls-component-2');
let renderer = new THREE.WebGLRenderer();


class User{

    constructor(uid) {

       this.uid = uid;
       this.lat_param = utils.getParameterByName('lat');
       this.lon_param = utils.getParameterByName('lon');
       this.zoom_param = utils.getParameterByName('zoom');
       this.email = utils.getParameterByName('admin');

       $('body').hammer().bind("pan", this.PanHandler);

        // var mc = new Hammer($('body')[0]);
        // mc.on("panleft panright tap press", function(ev) {
        //     console.log(ev.type +" gesture detected.");
        // });

       this.date = $('#datetimepicker').data("DateTimePicker").date().format('YYYY-MM-DD');

       this.menu = new MenuUser();

       this.menu_date;

       this.order={};

        let colorHash = new ColorHash();
        this.color = colorHash.hex(uid);

        let obj = localStorage.getItem("user");

        if (isJSON(obj)) {

            let uObj = JSON.parse(obj);
            this.uname = uObj.uname;
            this.psw = uObj.psw;
            this.email = uObj.email;
            this.uid = uObj.uid;
        }
    }


    DocReady() {

        $(window).on('touchstart', this, function (ev) {
            //ev.preventDefault();
            ev.stopPropagation();
            // if(!$("#datetimepicker").data("DateTimePicker").isHide){
            //     $("#datetimepicker").data("DateTimePicker").hide().isHide = true;
            // }
        });

        this.sse = new SSE();
        this.sse.SetOrderUpdLstnr('user='+localStorage.getItem('user'),this, function (resp,this_obj) {

            if (resp.reserved) {
                let time = $('.period_list').find('a')[0].text;
                $('.sel_time').text(time);

                this_obj.order_hash = resp.order_hash;
                this_obj.order=resp.reserved;
                this_obj.ClearTableReserve();
                this_obj.SetTables(resp.reserved,this_obj);
                $('#period_1').attr('visible','true');
                $('#period_2').attr('visible','true');

                // $('.sel_time').find('option').css('visibility','visible');
                //$('.sel_time').val($('.period_list').find('a')[0].value);
                //$('.sel_time').find('.closed').remove();

                //this.class_obj.menu.menuObj = JSON.parse(resp.menu);
                // for(let i in resp.tables){
                //     this_obj.menu.order[i] = resp.tables[i];
                //     this_obj.menu.FillMenu();
                // }
            }
        });

        let scene = document.querySelector('#scene');
        let camera = document.querySelector('#camera');
        let canvasEl = scene.canvas;

        $(canvasEl).on('dblclick',this,function (event) {
            console.log('On dblclick canvas ');
            onDocumentMouseDown(event)
        });

        $(canvasEl).on('click',this,function (event) {
            onDocumentMouseDown(event)
        });
        $(canvasEl).on('mousedown',this,function (event) {
            clk_timer = new Date();
        });

        let dbl_clk_timer = 0;
        let clk_timer = 0;
        let touch;
        canvasEl.addEventListener('touchstart', function(event) {
            clk_timer = new Date();
            //event.preventDefault();
            if(dbl_clk_timer == 0) {
                dbl_clk_timer = 1;
                touch = event.touches[0];
                dbl_clk_timer = setTimeout(function(){
                    dbl_clk_timer = 0;
                }, 400);
            }
            else {
                event.clientX = (event.touches[0].clientX+touch.clientX)/2;
                event.clientY = (event.touches[0].clientY+touch.clientY)/2;
                onDocumentMouseDown(event);
                dbl_clk_timer = 0;
            }
        })

        $(canvasEl).on('mouseup', this, function (event) {
            if((new Date() - clk_timer)>1000) {
                var e = $.Event( "lngtouch" );
                e.clientX = event.clientX;
                e.clientY = event.clientY;
                onDocumentMouseDown(e);
            }
            else if((new Date() - clk_timer)<150) {
                var e = $.Event( "shrttouch" );
                e.clientX = event.clientX;
                e.clientY = event.clientY;
                onDocumentMouseDown(e);
            }
            clk_timer = 0;
        });

        canvasEl.addEventListener('touchend', function (event) {
            if((new Date() - clk_timer)>1000) {
                var e = $.Event( "lngtouch" );
                e.clientX = event.changedTouches[0].clientX;
                e.clientY = event.changedTouches[0].clientY;
                onDocumentMouseDown(e);
            }else if((new Date() - clk_timer)<150){
                var e = $.Event( "shrttouch" );
                e.clientX = event.changedTouches[0].clientX;
                e.clientY = event.changedTouches[0].clientY;
                onDocumentMouseDown(e);
            }
            clk_timer = 0;
        });

        let mouse = new THREE.Vector2();
        let intersects = [];
        let vector = new THREE.Vector3();
        let raycaster = new THREE.Raycaster();
        let dir = new THREE.Vector3();

        function onDocumentMouseDown(event) {
            //event.preventDefault();
            //event.stopPropagation();
            let class_obj = event.data;
            intersects = [];

            mouse.x = ( event.clientX / scene.renderer.domElement.clientWidth ) * 2 - 1;
            mouse.y = -( event.clientY / scene.renderer.domElement.clientHeight ) * 2 + 1;
            raycaster.setFromCamera(mouse, camera.object3D.children[0]);

            let ToIntersect = [];
            scene.object3D.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    ToIntersect.push(child);
                }
            });

            intersects = raycaster.intersectObjects(ToIntersect, true);

            if (intersects.length > 0) {
                if (event.type === 'dblclick' || event.type === 'touchstart') {
                    $.grep(intersects, function (a) {
                        if ($(a.object.el).attr('id') === 'main_menu' ||
                            $(a.object.el).attr('class') === 'canvas' ||
                            $(a.object.el).attr('class') === 'menu' ||
                            $(a.object.el).attr('class') === 'table' ||
                            $(a.object.el).attr('class') === 'free' ||
                            $(a.object.el).attr('class') === 'reserve') {
                            $(a.object.el).trigger('dbltouch', [event, a]);
                        }
                    });
                }
                if (event.type === 'lngtouch') {
                    $.grep(intersects, function (a) {
                        let el = a.object.el;
                        if($(a.object.el).attr('class') ==='free') {
                            $(el).trigger('lngtouch', [event, a]);
                            return false;
                        }
                    });
                }

                if(event.type==='click'){
                    $.grep(intersects,function (a) {
                        if( $(a.object.el).attr('id')==='menu' ||
                            $(a.object.el).attr('id')==='lang_text' ||
                            $(a.object.el).attr('class')==='period') {
                            $(a.object.el).trigger('touch', [event, a]);
                        }
                    });
                }

                if (event.type === 'shrttouch') {
                    $.grep(intersects,function (a) {
                        //let a = intersects[0];
                        let distance = camera.object3D.position.distanceTo(a.point);
                        if( $(a.object.el).attr('class') === 'wall' ||
                            $(a.object.el).attr('class') === 'table' ||
                            $(a.object.el).attr('class') === 'menu' ||
                            $(a.object.el).attr('id') === 'menu' ||
                            $(a.object.el).attr('class') ==='free' ||
                            $(a.object.el).attr('class') ==='plane') {
                            $(a.object.el).trigger('touch', [event, a]);
                        }
                    });
                }

                //}
                //
                // if($(intersects[0].object.el).attr('class')==='menu') {
                //     let menu = $(intersects[0].object.el).attr('id');
                //     let table = $(intersects[0].object.el).parent().attr('id');
                //     $.grep(class_obj.order, function (item, i) {
                //         if (item[table] && item[table][menu]){
                //             $('#from_val').text(item[table][menu].from);
                //             $('#to_val').text(item[table][menu].to);
                //         }
                //     });
                // }
            }
        }

        $("#lang_text").on('touch',this, function (event){
            event.preventDefault();
            event.stopPropagation();
            $('#select_lang').css('visibility', 'visible');
            $('.selectpicker').selectpicker('toggle');

        });

        $('#datetimepicker').on("dp.change",this, function (ev) {

            ev.data.GetReserved(ev);

            $('.dt_val').val($('#datetimepicker').data("DateTimePicker").date().format('YYYY-MM-DD'));

            if($('#date')[0])
                $('#date')[0].setAttribute('text', 'value', $(this).data("DateTimePicker").date().format('DD.MM.YYYY'));
            ev.data.ClearTableReserve();
            ev.data.order_hash = undefined;
            $('#period_1').attr('visible','false');
            $('#period_2').attr('visible','false');

            if( $('.sel_time').find('.closed').length===0){
                $('.sel_time').text("closed");
            }

            $(this).data("DateTimePicker").toggle();

        });

        $('#dt_from').on("dp.change",this, function (ev) {

            let date_from =  new moment($('#period_1').find('.from')[0].getAttribute('text').value, 'HH:mm');
            let date = moment($(this).data("DateTimePicker").date().format('HH:mm'), 'HH:mm');
            if(date.isBefore(date_from)) {
                $(this).data("DateTimePicker").toggle();
                return true;
            }
            $('#period_1').find('.from')[0].setAttribute('text', 'value', $(this).data("DateTimePicker").date().format('HH:00'));
            //$('#period_1').find('.to')[0].setAttribute('text', 'value', mom.add(4, 'h').format('HH:00'));

            ev.data.ClearTableReserve();
            ev.data.SetTables(ev.data.order,ev.data);
            $(this).data("DateTimePicker").toggle();
        });
        $('.sel_time').on("change",this,function (ev) {
            let from = ev.target[ev.target.selectedIndex].value.split(' ')[0];
            let to = ev.target[ev.target.selectedIndex].value.split(' ')[1];
            $('#dt_from').val(from);
            $('#dt_to').val(to);
            $('#period_1').find('.from')[0].setAttribute('text', 'value', from);
            $('#period_1').find('.to')[0].setAttribute('text', 'value', to);
            ev.data.ClearTableReserve();
            ev.data.SetTables(ev.data.order,ev.data);
        });
        $('#dt_to').on("dp.change",this, function (ev) {

            let date_to = new moment($('#period_1').find('.to')[0].getAttribute('text').value, 'HH:mm');//;
            let date_from = new moment($('#period_1').find('.from')[0].getAttribute('text').value, 'HH:mm');
            if(date_to.isBefore(date_from)) {
                $(this).data("DateTimePicker").toggle();
                return true;
            }
            $('#period_1').find('.to')[0].setAttribute('text', 'value', date_to.format('HH:00'));

            ev.data.ClearTableReserve();
            ev.data.SetTables(ev.data.order,ev.data);

            $(this).data("DateTimePicker").toggle();
        });
        $('#date').on("click touchstart",this,function (ev) {
            $('#datetimepicker').data("DateTimePicker").toggle();
        });
        $('.period').find('.from').on("click touchstart",this,function (ev) {
            if($(ev.delegateTarget.parentEl).attr('id')==='period_1')
                $('#dt_from').data("DateTimePicker").toggle();
        });
        $('.period').find('.to').on("click touchstart", this,function (ev) {
            if($(ev.delegateTarget.parentEl).attr('id')==='period_1')
                $('#dt_to').data("DateTimePicker").toggle();
        });

        $(".free").on('touch',this, function(event, org_event, a) {

            if(a.distance/camera.object3D.scale.z>10){
                return;
            }
            //console.log('On click table '+event.target.id);
            if (event) {
                if($(event.target).attr('class')!=='table')
                    event.target =  $(event.target).closest('.table')[0];
                if (event.data.order) {
                    let table = event.target.id;

                    if( $('#datetimepicker').data("DateTimePicker").defaultDate() > $('#datetimepicker').data("DateTimePicker").maxDate()
                        && !event.data.order_hash)
                        return;//TODO

                    if (event.data.order[event.data.uid] && event.data.order[event.data.uid][table]) {
                        // } else {
                        //     let reserve =
                        //         '{"menu_1": {"order": {},"from":"'+$('#period_1').find('.from')[0].getAttribute('text').value+'","to":"'+$('#period_1').find('.to')[0].getAttribute('text').value+'"},' +
                        //         '"menu_2": {"order": {},"from":"'+$('#period_1').find('.from')[0].getAttribute('text').value+'","to":"'+$('#period_1').find('.to')[0].getAttribute('text').value+'"}' +
                        //         '}';
                        //     event.data.ConfirmReservation(event, event.target.id, reserve);
                        // }
                    }
                    let time = $('.sel_time').text();
                    let reserve = Object.assign({}, event.data.order[time]);
                    if(!reserve[event.data.uid])
                        reserve[event.data.uid]= {};
                    if(!reserve[event.data.uid][table])
                        reserve[event.data.uid][table] = {};

                    let res = $('#' + event.target.id + '>.free');
                    if (res.length === 1) {
                        reserve[event.data.uid][table][res[0].id] =
                            {"order": {},"from":$('#period_1').find('.from')[0].getAttribute('text').value,"to":$('#period_1').find('.to')[0].getAttribute('text').value};

                        event.data.ConfirmReservation(event, event.target.id,reserve);

                    }else if(res.length===2){

                        reserve[event.data.uid][table]['menu_1'] = {"order": {},"from":$('#period_1').find('.from')[0].getAttribute('text').value,"to":$('#period_1').find('.to')[0].getAttribute('text').value};
                        reserve[event.data.uid][table]['menu_2'] = {"order": {},"from":$('#period_1').find('.from')[0].getAttribute('text').value,"to":$('#period_1').find('.to')[0].getAttribute('text').value};

                        event.data.ConfirmReservation(event, event.target.id, reserve);
                    }
                }
            }

        });

        $("a-plane#main_menu").on('dbltouch',this, function(event, org_event, intersection){
            let pos = $(this)["0"].object3D.position;

            let targ_pos = new TWEEN.Tween($('#target')[0].object3D.position).to(
                pos
                , 1000)
                .repeat(0)//Infinity)
                .onUpdate(function () { // Called after tween.js updates
                   
                    //controls = new THREE.OrbitControls( $('a-camera')[0].object3D.children["0"]);
                })
                .easing(TWEEN.Easing.Quadratic.In);

            let cam_scale = new TWEEN.Tween($('a-camera')[0].object3D.scale).to(
                {z:5}
                , 1000)
                .repeat(0)//Infinity)
                .onUpdate(function () { // Called after tween.js updates
                   
                    //controls = new THREE.OrbitControls( $('a-camera')[0].object3D.children["0"]);
                })
                .easing(TWEEN.Easing.Quadratic.In);

            $('a-camera')[0].setAttribute('orbit-controls','autoRotate','false');

            //cam_pos.start();
            targ_pos.chain(cam_scale);
            targ_pos.start();

        });

        $("a-plane#main_menu").on('touch',this, function (event){
            event.preventDefault();
            event.stopPropagation();

            if(event)
                event.data.menu.OpenMenu(event);
        });

        $(".period").on('touch',this, function (event, org_event, el) {
            let period_1_pos =  Object.assign({}, $('#period_1')[0].object3D.position);
            let period_2_pos =  Object.assign({}, event.currentTarget.object3D.position);
            let to_p1 = new TWEEN.Tween(event.currentTarget.object3D.position).to(
                period_1_pos
                , 1000)
                .onUpdate(function () { // Called after tween.js updates

                })
                .easing(TWEEN.Easing.Quadratic.In);

            let to_p2 = new TWEEN.Tween($('#period_1')[0].object3D.position).to(
                period_2_pos
                , 1000)
                .onUpdate(function () { // Called after tween.js updates
                    $('#period_1').find('.from')[0].setAttribute('text','color','gray');
                    $('#period_1').attr('id','period_2');
                    $(event.currentTarget).find('.from')[0].setAttribute('text','color','black');
                    $(event.currentTarget).attr('id','period_1');

                })
                .easing(TWEEN.Easing.Quadratic.In);

            to_p1.chain(to_p2);
            to_p1.start();
        });

        $(".table").on('touch',this, function(event, org_event, a ) {

            // if(a.distance/camera.object3D.scale.z<10){
            // }

            var pos = a.point;

            $('#camera')[0].setAttribute("orbit-controls", "dampingFactor",'0.5');
            $('#camera')[0].setAttribute("orbit-controls", "maxPolarAngle",'.05');
            $('#camera')[0].setAttribute("orbit-controls", "autoRotate",'false');


            var to_pos = new TWEEN.Tween($('#target')[0].object3D.position).to({
                y: pos.y,
                x: pos.x,//_x * visible_width,
                z: pos.z //_y * visible_height
            }, 1000)
                .repeat(0)//Infinity)
                .onUpdate(function () {

                    $('#camera')[0].setAttribute("orbit-controls", "dampingFactor",'0.05');
                    $('#camera')[0].setAttribute("orbit-controls", "distance",'.5');
                    setTimeout(function () {
                        $('#camera')[0].setAttribute("orbit-controls", "maxPolarAngle",'1.2');
                    },1000);
                    // $('#camera')[0].setAttribute("orbit-controls", "maxPolarAngle",'1.2');
                    //$('#camera')[0].setAttribute("orbit-controls", "rotateTo", {x:pos.x,y:25,z:pos.z});
                    //$('#camera')[0].setAttribute("orbit-controls",'distance',5);
                })
                .easing(TWEEN.Easing.Quadratic.In);




            new TWEEN.Tween($('a-camera')[0].object3D.scale).to(
                $('a-camera')[0].object3D.scale.z+=.5
                , 1000)
                .repeat(0)//Infinity)
                .onUpdate(function () { // Called after tween.js updates
                    //renderer.render($('a-camera')[0].object3D.el.sceneEl, $('a-camera')[0].object3D.children["0"]);
                    $('#camera')["0"].setAttribute("orbit-controls","rotateTo", '1 1 0');
                })
                .easing(TWEEN.Easing.Quadratic.In).start();


            // to_pos.chain(cam_scale);
            // to_pos.start();

            // document.querySelector('#camera').setAttribute('camera', 'fov', '40');
        });

        $("#plane").on('touch',this, function (event, org_event, intersection) {

            let pos = intersection.point;
            $('#camera')[0].setAttribute("orbit-controls", "autoRotate",'true');
            new TWEEN.Tween($('#target')[0].object3D.position).to(
                pos
                , 1000)
                .repeat(0)//Infinity)
                .onUpdate(function () { // Called after tween.js updates
                    //renderer.render($('a-camera')[0].object3D.el.sceneEl, $('a-camera')[0].object3D.children["0"]);
                    //controls = new THREE.OrbitControls( $('a-camera')[0].object3D.children["0"]);
                })
                .easing(TWEEN.Easing.Quadratic.In).start();




        });

        $(".wall").on('touch',this, function (event, org_event, intersection) {
            event.data.toOrigin();
        });

    }

    OnClickTimeRange(ev){
        let from = $(ev).text().split(' - ')[0];
        let to = $(ev).text().split(' - ')[1];
        $('.sel_time').text($(ev).text());
        $('#dt_from').val(from);
        $('#dt_to').val(to);
        $('#period_1').find('.from')[0].setAttribute('text', 'value', from);
        $('#period_1').find('.to')[0].setAttribute('text', 'value', to);
        this.ClearTableReserve();
        this.SetTables(this.order,this);
    }

    toOrigin(){
        let targ_pos = new TWEEN.Tween($('#target')[0].object3D.position).to(
            {x:0,y:0,z:0}
            , 1000)
            .onUpdate(function () { // Called after tween.js updates
               
            })
            .easing(TWEEN.Easing.Quadratic.In);

        let cam_scale = new TWEEN.Tween($('a-camera')[0].object3D.scale).to(
            {z:1}
            , 1000)
            .repeat(0)//Infinity)
            .onUpdate(function () { // Called after tween.js updates
               
            })
            .easing(TWEEN.Easing.Quadratic.In);

        cam_scale.chain(targ_pos);
        cam_scale.start();
        
        $('a-camera')[0].setAttribute('orbit-controls','autoRotate','true');
    }

    SetTables(order, class_obj) {

        let tween;
        $('.free').attr('visible', true);

        let time = $('.sel_time').text();
        let  arr = order[time];

        if(arr && Object.keys(arr).length>0) {

            for(let u in arr) {
                for (let t in arr[u]) {
                    for (let m in arr[u][t]) {
                        if (arr[u][t][m]) {
                            let menu_1 = $('#' + t).find('#' + m);
                            if (menu_1[0] && arr[u][t][m]['order']) {
                                //do I have the same table search
                                if (u === class_obj.uid) {

                                    $(menu_1).attr('class', 'menu');
                                    menu_1[0].setAttribute('text', 'value', 'menu');
                                    menu_1[0].setAttribute('text', 'color', 'gray');
                                    menu_1[0].setAttribute('text', 'zOffset', '.1');
                                    if (arr[u][t][m]['order'] && arr[u][t][m]['order']['ordered']) {
                                        menu_1[0].setAttribute('color', 'red');
                                    }
                                    //$(menu_1[0]).on('click touch', this, this.OnTouchMenu);
                                } else {
                                    $(menu_1).attr('class', 'reserve');
                                    menu_1[0].setAttribute('text', 'value', 'reserved');
                                    menu_1[0].setAttribute('text', 'color', 'blue');
                                    menu_1[0].setAttribute('text', 'width', '5');
                                    menu_1[0].setAttribute('text', 'zOffset', '.1');
                                    menu_1[0].setAttribute('text', 'wrapCount', '8');
                                }

                                //class_obj.toOrigin();

                            }
                        }
                    }
                    }
                }
            }
            if(arr[class_obj.uid]) {
                // let pos = $('#' + Object.keys(arr[class_obj.uid])[0]).attr('position');//table position
                // if (pos) {
                //     tween = new TWEEN.Tween($('#target')[0].object3D.position).to({
                //         y: pos.y,
                //         x: pos.x,//_x * visible_width,
                //         z: pos.z //_y * visible_height
                //     }, 1000)
                //         .repeat(0)//Infinity)
                //         .onUpdate(function () { // Called after tween.js updates
                //
                //         })
                //         .easing(TWEEN.Easing.Quadratic.In).start();
                // }
                //class_obj.toOrigin();
                $('a-camera')[0].setAttribute('orbit-controls','autoRotate','true');
            }


        $('.menu').off();
        $('.menu').on('touch',class_obj, function(event, org_event,a) {

            if(a.distance/camera.object3D.scale.z>10){
                return;
            }
            if($(event.currentTarget).attr('class')==='menu') {
                new TWEEN.Tween(event.target.object3D.rotation).to({
                    //rotation: 360
                    y: THREE.Math.degToRad(225)
                    //y: Math.random() * 2 * Math.PI,
                    //z: Math.random() * 2 * Math.PI
                }, 2000)
                    .repeat(0)//Infinity)
                    .onUpdate(function () { // Called after tween.js updates

                    })
                    .easing(TWEEN.Easing.Elastic.Out);

                event.data.menu.OpenOrder(event);
            }
        });
    }

    PanHandler(ev){

    }

    GetReserved(ev) {

        if(ev.stopPropagation)
            ev.stopPropagation();
        if(ev.preventDefault)
            ev.preventDefault();

        ev.data.date = $('#datetimepicker').data("DateTimePicker").date().format('YYYY-MM-DD');

        try {

            let url = http + host_port + '?' + //
                "user="+ localStorage.getItem('user')+
                "&func=getreserved" +
                "&lat=" + (ev?ev.data.lat_param:this.lat_param) +
                "&lon=" + (ev?ev.data.lon_param:this.lon_param) +
                "&date=" + ev.data.date +
                "&lang=" + window.sets.lang;

            //console.log(url);

            $.ajax({
                url: url,
                method: "GET",
                dataType: 'json',
                processData: false,
                async: true,   // asynchronous request? (synchronous requests are discouraged...)
                cache: false,
                crossDomain: true,
                class_obj:ev?ev.data:this,
                success: function (resp, msg) {

                    if(isJSON(resp))
                        resp =JSON.parse(resp);

                    if(resp.msg) {
                        // new TWEEN.Tween($('#target')[0].object3D.position).to({
                        //     y: 0,
                        //     x: 0,//_x * visible_width,
                        //     z: 0 //_y * visible_height
                        // }, 1000)
                        //     .repeat(0)//Infinity)
                        //     .onUpdate(function () { // Called after tween.js updates
                        //         document.querySelector('#camera').setAttribute('camera', 'fov', '60');
                        //     })
                        //     .easing(TWEEN.Easing.Quadratic.In).start();

                        return;
                    }

                    if(isJSON(resp.menu))
                        this.class_obj.menu.menuObj = JSON.parse(resp.menu);

                },
                error: function (xhr, status, error) {
                    //let err = eval("(" + xhr.responseText + ")");
                    for (let i = 0; i < $('.reserve').length; i++) {
                        $('.reserve')[i].object3D.el.object3D.visible = false;
                        $('.reserve')[i].object3D.el.object3D.el.setAttribute('text', 'value', 'reserved');
                    }

                    for (let i = 0; i < $('.menu').length; i++) {
                        if ($('.menu')[i].object3D.visible) {
                            $($('.menu')[i]).detach();
                            i--;
                        }
                    }
                    console.log(error.Message);
                    console.log(xhr.responseText);

                },
                complete: function (data) {
                    //alert(data.responseText);
                },
            });

        } catch (ex) {
            console.log();
        }
    }

    ConfirmReservation(event,table_id,reserve) {

        if (localStorage.getItem("user")) {
            let isConfirm = confirm("Confirm your reservation");
            if (isConfirm) {
               event.data.UpdateReservation(event,table_id, reserve );
            }
        } else {
            event.data.OpenUserDialog(event.target.id);
        }

    }

    UpdateOrder(order, table_id,menu_id, date) {

        let time = $('.sel_time').text();
        if (this.order[time][this.uid][table_id])
            this.order[time][this.uid][table_id][menu_id] = order[table_id][menu_id];

        if(window.demoMode) {

            this.ClearTableReserve();
            this.SetTables(this.order,this);
            return;
        }

        let url = http+host_port;
        let data =
            "func=updateorder"+
            "&user="+localStorage.getItem('user')+
            "&lat="+this.lat_param+
            "&lon="+this.lon_param+
            "&time="+time+
            "&date="+ date+
            "&order="+urlencode.encode(JSON.stringify(order))+
            "&table="+table_id+
            "&menu="+menu_id+
            "&lang="+window.sets.lang;

        $.ajax({
            url: url,
            method: "POST",
            dataType: 'json',
            data: data,
            crossDomain: true,
            class_obj:this,
            success: function (resp) {

                let arr = resp;
                if(isJSON(resp))
                    arr = JSON.parse(resp);
                if(!arr) {
                    new TWEEN.Tween($('#target')[0].object3D.position).to({
                        y: 0,
                        x: 0,//_x * visible_width,
                        z: 0 //_y * visible_height
                    }, 1000)
                        .repeat(0)//Infinity)
                        .onUpdate(function () { // Called after tween.js updates
                            document.querySelector('camera').setAttribute('camera', 'fov', '60');
                        })
                        .easing(TWEEN.Easing.Quadratic.In).start();
                } else {

                    if(arr.msg)
                        console.log(arr.msg);
                }
            },
            error: function(xhr, status, error){
                //let err = eval("(" + xhr.responseText + ")");
                console.log(error.Message);
                //alert(xhr.responseText);
            },
            complete: function (data) {
                //alert(data.responseText);
            },
        });
    }

    UpdateReservation(event, table_id, data_obj,cb) {

        let time = $('.sel_time').text();
        if(!this.order[time])
            this.order[time]={};
        if (!this.order[time][this.uid])
            this.order[time][this.uid] = {};
        if (!this.order[time][this.uid][table_id])
            this.order[time][this.uid][table_id] = data_obj?data_obj[this.uid][table_id]:
                {'menu_1':{'order':{}},'menu_2':{'order':{}}};

        if(window.demoMode) {
            this.ClearTableReserve();
            this.SetTables(this.order,this);
            return;
        }
        let url = http+host_port;
        let data =
            "func=updatereservation"+
            "&user="+localStorage.getItem('user')+
            "&lat="+event.data.lat_param+
            "&lon="+event.data.lon_param+
            "&time="+time+
            "&date="+event.data.date+
            "&table="+table_id+
            "&menus="+urlencode.encode(JSON.stringify(this.order[time][this.uid][table_id]))+
            "&lang="+window.sets.lang;
//'{"'+res[0].id + '":{"order": {},"from":"'+$('#period_1').find('.from')[0].getAttribute('text').value+'","to":"'+$('#period_1').find('.to')[0].getAttribute('text').value+'"}}';

        $.ajax({
            url: url,
            method: "POST",
            dataType: 'json',
            data: data,
            class_obj:event.data,
            cb:cb,
            success: function (resp) {
                let arr = resp;
                if(isJSON(resp))
                    arr = JSON.parse(resp);
                if(resp.user) {
                    localStorage.setItem("user", resp.user);//
                }
                if(!arr) {
                    new TWEEN.Tween($('#target')[0].object3D.position).to({
                        y: 0,
                        x: 0,//_x * visible_width,
                        z: 0 //_y * visible_height
                    }, 1000)
                        .repeat(0)//Infinity)
                        .onUpdate(function () { // Called after tween.js updates
                            //document.querySelector('#camera').setAttribute('camera', 'fov', '60');
                        })
                        .easing(TWEEN.Easing.Quadratic.In).start();
                } else {

                }
            },
            error: function(xhr, status, error){
                //let err = eval("(" + xhr.responseText + ")");
                localStorage.removeItem("user");//
                console.log(error.Message);
                //alert(xhr.responseText);
            },
            complete: function (data) {
                //alert(data.responseText);
                if(this.cb)
                    this.cb();
            },
        });
    }

    ClearTableReserve() {

        $('.menu').attr('class', 'free');
        $('.reserve').attr('class', 'free');

        for (let i = 0; i < $('.free').length; i++) {
            if ($('.free')[i].object3D.visible) {
                $('.free')[i].setAttribute('visible', false);
                $('.free')[i].setAttribute('text', 'value', 'click to reserve');
                $('.free')[i].setAttribute('text', 'color', '#808080');
                $('.free')[i].setAttribute('text', 'wrapCount', '8');
                $('.free')[i].setAttribute('material', 'color', 'white');
                i--;
            }
        }

    }

    OpenUserDialog(table_id) {

        $('#registry_but').click(this,function(event) {
            event.preventDefault(); // avoid to execute the actual submit of the form.
            event.stopPropagation();
            event.data.uid = md5(JSON.stringify(Date.now()));
            event.data.uname = $('#auth_body').find('input[type="text"]').val();
            event.data.email = $('#auth_body').find('input[type="email"]').val();

            if(!event.data.uname || !event.data.email)
                return true;
            let str = JSON.stringify({"uid":event.data.uid,"email": event.data.email,"uname": event.data.uname});//
            localStorage.setItem("user", str);//
            event.data.UpdateReservation(event,table_id, event.data.order[event.data.uid]);
            $('#auth_dialog').modal('toggle');
        });

        $('#auth_dialog').modal();
    }

}


