'use strict'
export {Admin};

let utils = require('../utils');
var isJSON = require('is-json');

import {MenuAdmin} from '../menu/menu.admin';
import {Dict} from '../dict/dict.js?v=4';

var oc = require('aframe-orbit-controls-component-2');
let renderer = new THREE.WebGLRenderer();
let SSE = require('../sse/sse.js');

var urlencode = require('urlencode');

var ColorHash = require('color-hash');

require('bootstrap');
require('bootstrap-select');
var moment = require('moment');
require('bootstrap-datetimepicker-npm/build/js/bootstrap-datetimepicker.min');
require('bootstrap/js/modal.js');


class Admin{

    constructor(uObj) {

        this.uid = (window.demoMode?'e2f6cb3e58815222c734f661820df37e':uObj.uid);
        this.email = uObj.email;
        this.lat_param = utils.getParameterByName('lat');
        this.lon_param = utils.getParameterByName('lon');
        this.zoom_param = utils.getParameterByName('zoom');

        this.date = $('#datetimepicker').data("DateTimePicker").date().format('YYYY-MM-DD');

        this.menu = new MenuAdmin();

        this.order= {};

    }

    IsAuth(cb) {

        try {

            $('.dt_val').val(this.date);

            $('#datetimepicker').on('dp.change',this,this.GetReserved);

            var url = http + host_port + '/?' + //
                "proj=bm"+
                "&func=auth" +
                "&lang="+window.sets.lang+
                "&uid="+ this.uid+
                "&email="+this.email+
                "&lat="+this.lat_param+
                "&lon="+this.lon_param+
                "&date="+this.date;

            $.ajax({
                url: url,
                method: "GET",
                dataType: 'json',
                //headers: {"access-control-allow-origin": "*"},
                //data:formData,
                contentType: false,
                cache: false,
                processData: false,
                crossDomain: true,
                class_obj:this,
                date:this.date,
                // xhrFields: {
                //     withCredentials: true
                // },
                success: function (data) {

                    if(typeof data =='string')
                        data = JSON.parse(data);
                    if(data) {
                        if (data.reg =='OK') {
                            var uObj = {
                                "email": this.class_obj.email,
                                "uid": this.class_obj.uid
                            };
                            localStorage.setItem("admin", JSON.stringify(uObj));

                            window.dict = new Dict(JSON.parse(JSON.parse(data.data).dict));
                            window.dict.set_lang(window.sets.lang, $('#main_window'));

                            localStorage.setItem("lang", window.sets.lang);

                            this.class_obj.menu.menuObj = JSON.parse(data.menu);

                            cb(data);
                        }else if (data.auth =='OK') {
                            if(data.menu) {
                                let dict = JSON.parse(data.data).dict;
                                window.dict = new Dict(dict);
                                window.dict.set_lang(window.sets.lang, $('#main_window'));

                                localStorage.setItem("lang", window.sets.lang);

                                this.class_obj.menu.menuObj = JSON.parse(data.menu);
                            }

                            cb();
                            this.class_obj.DocReady();

                        }else{
                            let str = data.data;
                            let dict = JSON.parse(str).dict;
                            window.dict = new Dict(dict);
                            window.dict.set_lang(window.sets.lang, $('#main_window'));
                            this.class_obj.menu.menuObj = JSON.parse(data.menu);
                            this.class_obj.DocReady();
                        }
                    }
                },
                error: function (xhr, status, error) {
                    //let  err = eval("(" + xhr.responseText + ")");
                    console.log(error.Message);
                },
                complete: function (data) {
                    //console.log(data.responseText);
                },
            });

        }catch(ex){
            console.log(ex);
        }
    }

    DocReady(cb) {

        let time = $('.period_list').find('a')[0].text;
        $('.sel_time').text(time);

        this.sse = new SSE();
        this.sse.SetOrderUpdLstnr("admin="+ this.uid,this, function (resp) {
            if(resp.menu!=='undefined') {
                if (resp.reserved) {
                    resp.reserved = JSON.parse(urlencode.decode(resp.reserved));
                    if (Object.keys(resp.reserved).length > 0) {

                        this.class_obj.order = resp.reserved
                        this.class_obj.menu.menuObj = resp.menu;

                        let time = $('.sel_time').text();
                        if (time==='closed') {
                            time = $('.period_list').find('a')[0].text;
                            $('.sel_time').text(time);
                        }

                        this.class_obj.order_hash = resp.order_hash;
                        this.class_obj.ClearTableReserve();
                        this.class_obj.SetTables(resp.reserved);

                        // for (let i in resp.reserved) {
                        //     if (time===i && Object.keys(resp.reserved[i])[0] === this.class_obj.menu.table_id) {
                        //         this.class_obj.menu.order[i] = resp.reserved[time][i];
                        //         $("#menu_dialog").find('.tab-pane').empty();
                        //         $("#menu_dialog").find('li.tab_inserted').empty();
                        //         $("#menu_dialog").find('.w3-button').css('color', '');
                        //         this.class_obj.menu.FillOrder();
                        //     }
                        // }
                    }
                }
            }else{
                $('.sel_time').text('closed');
            }
        });

        let scene = document.querySelector('#scene');
        let camera = document.querySelector('#camera');
        let canvasEl = scene.canvas;

        let mouse = new THREE.Vector2();
        let intersects = [];
        let vector = new THREE.Vector3();
        let raycaster = new THREE.Raycaster();
        let dir = new THREE.Vector3();
        let dbl_clk_timer = 0;
        let clk_timer = 0;
        let touch;

        $(canvasEl).dblclick(function (event) {
            console.log('On dblclick canvas ');
            event.type = 'dblclick';
            onDocumentMouseDown(event)
        });

        $(canvasEl).on('click',this,function (event) {
            onDocumentMouseDown(event)
        });
        $(canvasEl).on('mousedown',this,function (event) {
            clk_timer = new Date();
        });

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

        function onDocumentMouseDown(event) {
            //event.preventDefault();
            //event.stopPropagation();
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
                    //$.grep(intersects,function (a) {
                    let a = intersects[0];
                    let distance = camera.object3D.position.distanceTo(a.point);
                    if( $(a.object.el).attr('class') === 'wall' ||
                        $(a.object.el).attr('class') === 'table' ||
                        $(a.object.el).attr('class') === 'menu' ||
                        $(a.object.el).attr('id') === 'menu' ||
                        $(a.object.el).attr('id') === 'main_menu' ||
                        $(a.object.el).attr('class') ==='free' ||
                        $(a.object.el).attr('class') ==='floor') {
                        $(a.object.el).trigger('touch', [event, a]);
                    }
                    //});
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

        $('#dt_from').on("dp.change",this, function (ev) {

            let date_from =  new moment($('#period_1').find('.from')[0].getAttribute('text').value, 'HH:mm');
            let date = moment($(this).data("DateTimePicker").date().format('HH:mm'), 'HH:mm');
            if(date.isBefore(date_from)) {
                $(this).data("DateTimePicker").toggle();
                return true;
            }
            $('#period_1').find('.from')[0].setAttribute('text', 'value', $(this).data("DateTimePicker").date().format('HH:00'));
            //$('#period_1').find('.to')[0].setAttribute('text', 'value', mom.add(4, 'h').format('HH:00'));

            let time = $('.sel_time').text();

            ev.data.ClearTableReserve();
            ev.data.SetTables(ev.data.order[time],ev.data);
            $(this).data("DateTimePicker").toggle();


        });
        $('.sel_time').on("change",this,function (ev) {
            let from = ev.target[ev.target.selectedIndex].value.split(' ')[0];
            let to = ev.target[ev.target.selectedIndex].value.split(' ')[1];
            $('#dt_from').val(from);
            $('#dt_to').val(to);

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

        $('#datetimepicker').on("dp.change",this, function (ev) {

            ev.data.GetReserved(ev);

            $('.dt_val').val($('#datetimepicker').data("DateTimePicker").date().format('YYYY-MM-DD'));

            ev.data.ClearTableReserve();
            ev.data.order_hash = undefined;
            $('#period_1').attr('visible','false');
            $('#period_2').attr('visible','false');
            $('.sel_time').find('option').css('visibility','visible');


            $(this).data("DateTimePicker").toggle();
        });

        $('#main_menu').on('touch', this, this.OpenMenuEditor);

        $(".table").on('touch',this, this.OnClickTable);

        $('.free').on('touch', this, this.OnTouchMenu);

        $("#floor").on('touch',this, function (event, org_event, intersection) {
            let pos = intersection.point;
            // $('#camera')[0].setAttribute("orbit-controls", "autoRotate",'');
            new TWEEN.Tween($('#target')[0].object3D.position).to(
                pos
                , 1000)
                .repeat(0)//Infinity)
                .onUpdate(function () { // Called after tween.js updates
                    //renderer.render($('a-camera')[0].object3D.el.sceneEl, $('a-camera')[0].object3D.children["0"]);
                    //controls = new THREE.OrbitControls( $('a-camera')[0].object3D.children["0"]);
                })
                .easing(TWEEN.Easing.Quadratic.In).start();

            let cam_scale = new TWEEN.Tween($('a-camera')[0].object3D.scale).to(
                {z: 1}
                , 1000)
                .repeat(0)//Infinity)
                .onUpdate(function () { // Called after tween.js updates
                    //renderer.render($('a-camera')[0].object3D.el.sceneEl, $('a-camera')[0].object3D.children["0"]);
                    $('#camera')["0"].setAttribute("orbit-controls","rotateTo", '1 1 0');
                })
                .easing(TWEEN.Easing.Quadratic.In).start();

        });

    }

    OnClickTimeRange(ev){
        let from = $(ev).text().split(' - ')[0];
        let to = $(ev).text().split(' - ')[1];
        $('.sel_time').text($(ev).text());
        $('#dt_from').val(from);
        $('#dt_to').val(to);

        this.ClearTableReserve();
        if(Object.keys(this.order).length>0)
            this.SetTables(this.order,this);
    }

    OpenMenuEditor(ev) {
        ev.data.menu.OpenMenu(ev);
    }

    UpdateMenu(menu, dict, date){

        if(window.demoMode){
            this.menu.menu_obj = menu;
            return;
        }

        let data_obj={
            "proj":"bm",
            "func":"updatemenu",
            "admin":localStorage.getItem('admin'),
            "lat":this.lat_param,
            "lon":this.lon_param,
            "date":date,
            "menu":urlencode.encode(JSON.stringify(menu)),
            "dict": JSON.stringify(dict),
            "lang":window.sets.lang
        }

        // $.post(http+host_port,
        //     data_obj,
        //     function(data, status){
        //         window.admin.menu.menuObj = menu;
        //     });

        $.ajax({
            url:  http+host_port,
            method: "POST",
            dataType: 'json',
            data: data_obj,
            // async: true,   // asynchronous request? (synchronous requests are discouraged...)
            success: function (resp) {
                window.admin.menu.menuObj = menu;
            },
            error: function(xhr, status, error){

                console.log(error.Message);
                //alert(xhr.responseText);
            },

            complete: function (data) {
                if(data.status==200){

                }
            },
        });

    }

    GetReserved(ev) {

        if(ev.stopPropagation)
            ev.stopPropagation();
        if(ev.preventDefault)
            ev.preventDefault();

        var dateTimeAr = $('#datetimepicker').data("DateTimePicker").date().format('YYYY-MM-DD');

        try {

            var url = http + host_port + '?' + //
                "proj=bm"+
                "&admin="+ ev.data.uid +
                "&func=getreserved" +
                "&lat=" + window.admin.lat_param +
                "&lon=" + window.admin.lon_param +
                "&date=" + dateTimeAr +
                "&lang=" + window.sets.lang;

            console.log(url);

            $.ajax({
                url: url,
                method: "GET",
                dataType: 'json',
                processData: false,
                async: true,   // asynchronous request? (synchronous requests are discouraged...)
                cache: false,
                crossDomain: true,
                success: function (resp, msg) {

                    window.admin.ClearTableReserve();

                    if(typeof resp === 'string')
                        resp =JSON.parse(resp);

                    if(resp.msg) {
                        new TWEEN.Tween($('#target')[0].object3D.position).to({
                            y: 0,
                            x: 0,//_x * visible_width,
                            z: 0 //_y * visible_height
                        }, 1000)
                            .repeat(0)//Infinity)
                            .onUpdate(function () { // Called after tween.js updates
                                document.querySelector('#camera').setAttribute('camera', 'fov', '60');
                            })
                            .easing(TWEEN.Easing.Quadratic.In).start();
                        alert(resp.msg);
                        return;
                    }

                    // if (resp.reserved && resp.reserved.length !== 0) {
                    //     window.admin.order = resp.reserved;
                    //     window.admin.SetTables(resp.reserved);
                    // }

                    if(resp.menu && resp.menu!=='undefined')
                        window.admin.menu.menuObj = resp.menu;

                },
                error: function (xhr, status, error) {
                    //var err = eval("(" + xhr.responseText + ")");
                    for (var i = 0; i < $('.reserve').length; i++) {
                        $('.reserve')[i].object3D.el.object3D.visible = false;
                        $('.reserve')[i].object3D.el.object3D.el.setAttribute('text', 'value', 'reserved');
                    }

                    for (var i = 0; i < $('.menu').length; i++) {
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
            console.log(ex);
        }
    }

    SetTables(order) {

        let colorHash = new ColorHash();
        let time = $('.sel_time').text();
        let from = parseInt($('.sel_time').text().split(' - ')[0].replace(":", ""));
        let to = parseInt($('.sel_time').text().split(' - ')[1].replace(":", ""));
        let from_1,to_1;
        let  arr = order[time];
        if(arr){
            from_1 = parseInt(time.split(' - ')[0].replace(":", ""));
            to_1 = parseInt(time.split(' - ')[1].replace(":", ""));
        }else{
            from_1 = parseInt(Object.keys(order)[0].split(' - ')[0].replace(":", ""));
            to_1 = parseInt(Object.keys(order)[0].split(' - ')[1].replace(":", ""));
        }

        if(arr && Object.keys(arr).length>0) {

            let time = $('.period_list').find('a')[0].text;
            $('.sel_time').text(time);

            for (let u in arr) {
                for (let t in arr[u]) {
                    let menuAr = $('#' + t).find('a-entity.free').toArray();
                    for (let m in menuAr) {
                        let menu_id = $(menuAr[m]).attr('id');
                        if (arr[u][t][menu_id] && arr[u][t][menu_id]['order']) {
                            menuAr[m].setAttribute('material', 'color', colorHash.hex(u));
                            for (let d in arr[u][t][menu_id]['order']) {
                                if (arr[u][t][menu_id]['order'][d]['accepted']) {

                                }
                                if (arr[u][t][menu_id]['order'][d]['ordered']) {
                                    menuAr[m].setAttribute('text', 'color', 'red');
                                }
                            }
                        }

                    }
                }
            }
        }
    }

    ClearTableReserve() {

        $('.menu').attr('class', 'free');

        for (var i = 0; i < $('.free').length; i++) {
            $('.free')[i].object3D.el.object3D.el.setAttribute('material', 'color', '#C0C0C0');
            $('.free')[i].object3D.el.object3D.el.setAttribute('text', 'color', '#6A44FF');
            $('.free')[i].object3D.el.object3D.el.setAttribute('text', 'value', 'menu');
        }

        for (let i = 0; i < $('.reserve').length; i++) {
            if ($('.reserve')[i].object3D.visible) {
                $('.reserve')[i].setAttribute('visible', false);
                $($('.reserve')[i]).attr('class', 'free');
                i--;
            }
        }
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
            "proj=bm"+
            "&func=updatereservation"+
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

    OnClickTable(event) {
        event.stopPropagation();
        event.preventDefault();
        var pos = document.querySelector('#' + event.target.id).getAttribute('position');
        $('#camera')[0].setAttribute("orbit-controls", "dampingFactor",'0.5');
        $('#camera')[0].setAttribute("orbit-controls", "maxPolarAngle",'.05');

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
                // $('#camera')[0].setAttribute("orbit-controls", "rotateTo", {x:pos.x,y:25,z:pos.z});
                //$('#camera')[0].setAttribute("orbit-controls",'distance',5);
            })
            .easing(TWEEN.Easing.Quadratic.In);

        let cam_scale = new TWEEN.Tween($('a-camera')[0].object3D.scale).to(
            {z:4}
            , 1000)
            .repeat(0)//Infinity)
            .onUpdate(function () { // Called after tween.js updates
                //renderer.render( $('a-camera')[0].object3D.el.sceneEl, $('a-camera')[0].object3D.children["0"] );
                //controls = new THREE.OrbitControls( $('a-camera')[0].object3D.children["0"]);
            })
            .easing(TWEEN.Easing.Quadratic.In);

        to_pos.chain(cam_scale);
        to_pos.start();

        // document.querySelector('#camera').setAttribute('camera', 'fov', '40');
    }

    OnTouchMenu(event, org_event, a) {
        event.stopPropagation();
        event.preventDefault();
        new TWEEN.Tween( event.target.object3D.rotation ).to( {
            //rotation: 360
            y: THREE.Math.degToRad(225)
            //y: Math.random() * 2 * Math.PI,
            //z: Math.random() * 2 * Math.PI
        }, 2000 )
            .repeat(0)//Infinity)
            .onUpdate(function() { // Called after tween.js updates

            })
            .easing( TWEEN.Easing.Elastic.Out);//.start();

        event.data.menu.OpenOrder(event);
    }

    UpdateOrder(order, date) {

        let time = $('.sel_time').text();
        this.order[time] = order;

        if(window.demoMode){

            this.ClearTableReserve();
            this.SetTables(this.order,this);

            return;
        }

        let url = http+host_port
        let data =
            "proj=bm"+
            "&func=updateorder"+
            "&admin="+localStorage.getItem('admin')+
            "&lat="+this.lat_param+
            "&lon="+this.lon_param+
            "&date="+date+
            "&order="+JSON.stringify(this.order).replace(/'/g,'%27').replace(/\n/g,'%0D').replace(/\n/g,'%0D').replace(/"/g,'\"')+
            "&lang="+window.sets.lang;

        $.ajax({
            url: url,
            method: "POST",
            dataType: 'json',
            data: data,
            class_obj:this,
            success: function (resp) {
                let arr = resp;
                if(isJSON(resp))
                    arr = JSON.parse(resp);
                if(!arr) {

                } else {

                    if(arr.msg)
                        console.log(arr.msg);

                }
            },
            error: function(xhr, status, error){
                //let err = eval("(" + xhr.responseText + ")");
                console.log(error.Message);
                alert(xhr.responseText);
            },
            complete: function (data) {
                //alert(data.responseText);
            },
        });
    }

    UpdateDict(dict, cb){

        if(window.demoMode){
            window.dict.dict = dict;
            cb();
            return;
        }

        let data_obj = {
            "proj":"bm",
            "func": "updatedict",
            "admin": JSON.stringify({uid:this.uid,lon:this.lon_param,lat:this.lat_param}),
            "dict": JSON.stringify(dict).replace(/'/g,'%27').replace(/\n/g,'%0D').replace(/\n/g,'%0D').replace(/"/g,'\"')
        }
        $.ajax({
            url: http + host_port,
            method: "POST",
            dataType: 'json',
            data: data_obj,
            async: true,   // asynchronous request? (synchronous requests are discouraged...)
            success: function (resp) {
                //$("[data-translate='" + this.key + "']").parent().val(resp);
                cb();
            },
            error: function (xhr, status, error) {
                //let err = eval("(" + xhr.responseText + ")");
                console.log(error.Message);
                //alert(xhr.responseText);
            },

            complete: function (data) {

            },
        });
    }

}














