'use strict'

// require("imports-loader?this=>window! ./../../lib/jquery.mobile-1.4.5.min.js");
// require('jquery-mobile-babel-safe');

require("../global");

let utils = require('../utils');


import {User} from './user';
let Dict = require('../dict/dict.js');
const langs = require("../dict/languages");
const ISO6391 = require('iso-639-1');
var countries = require("i18n-iso-countries");

// require('bootstrap/js/dropdown.js');
require('bootstrap/js/tooltip.js');
require('bootstrap/js/tab.js');
require('bootstrap-select');
require('bootstrap-datetimepicker-npm/build/js/bootstrap-datetimepicker.min');

//import domtoimage from 'dom-to-image';

let moment = require('moment');

let md5 = require('md5');

require('aframe-orbit-controls-component-2');
// import registerClickDrag from 'aframe-click-drag-component';
// registerClickDrag(AFRAME);

let TWEEN = require('@tweenjs/tween.js');

window.demoMode = (utils.getParameterByName('dm')==='0'?false:true);

$(document).on('readystatechange', function () {

    if (document.readyState !== 'complete') {
        return;
    }

    //$('#dtp_langs').load('./dtp_langs.html', function () {
        init();
    //});

    function init() {

        if(localStorage.getItem('lang')){
            window.sets.lang = localStorage.getItem('lang');
        }else if(utils.getParameterByName('lang')){
            window.sets.lang = utils.getParameterByName('lang');
        }else if(window.navigator.userLanguage || window.navigator.language) {
            window.sets.lang = window.navigator.userLanguage || window.navigator.language;
            window.sets.lang = window.sets.lang.split('-')[0];
        }

        var supportsOrientationChange = "onorientationchange" in window,
            orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

        $('.selectpicker').selectpicker();

        // Swap languages when menu changes
        $('.selectpicker').change(function(ev) {
            let lang = Object.keys(langs)[ev.target.selectedIndex];

            let from = window.sets.lang;
            let to = lang;

            window.dict.Translate(from, to,function () {
                //$('.selectpicker').val(lang).attr("selected", "selected");
                window.sets.lang = lang;
                localStorage.setItem("lang", window.sets.lang);
                window.dict.set_lang(window.sets.lang,$('#main_window'));
                window.dict.set_lang(window.sets.lang,$('#ddd'));
            });

            // html2canvas($('#select_lang')[0]).then(function(canvas) {
            //     let img = canvas.toDataURL();
            //     $('#flag_img')[0].setAttribute('src',img);
            // });
        });

        let now = new Date();
        $('#datetimepicker').datetimepicker({
            inline: true,
            sideBySide: true,
            locale: window.sets.lang,
            format:'YYYY-MM-DD',
            defaultDate: now
            //maxDate: new Date(now + (24*60*60*1000) * 7),
            // disabledDates: [
            //     // moment("12/25/2018"),
            //     //new Date(2018, 11 - 1, 21),
            //     //"2018-01-12 00:53"
            // ]
            //,daysOfWeekDisabled: [0, 6]
        });

        $('#dt_from').datetimepicker({
            inline: true,
            sideBySide: true,
            //locale: window.sets.lang,
            format:'HH:00',
            defaultDate:  '2018-01-01 19:00',
            //maxDate: new Date(now + (24*60*60*1000) * 7),
            // disabledDates: [
            //     // moment("12/25/2018"),
            //     //new Date(2018, 11 - 1, 21),
            //     //"2018-01-12 00:53"
            // ]
            //,daysOfWeekDisabled: [0, 6]
        });
        $('#dt_to').datetimepicker({
            inline: true,
            sideBySide: true,
            //locale: window.sets.lang,
            format:'HH:00',
            defaultDate: '2018-01-01 23:00',
            //maxDate: new Date(now + (24*60*60*1000) * 7),
            // disabledDates: [
            //     // moment("12/25/2018"),
            //     //new Date(2018, 11 - 1, 21),
            //     //"2018-01-12 00:53"
            // ]
            //,daysOfWeekDisabled: [0, 6]
        });

        window.addEventListener(orientationEvent, function() {
            //console.log('HOLY ROTATING SCREENS:' + window.orientation + " " + screen.width);
            let scale = (window.innerWidth+window.innerHeight)/1000 + .3;
            $('#datetimepicker').css('transform', 'scale('+scale+','+scale+')');
        }, false);

        let scale = (window.innerWidth+window.innerHeight)/1000 + .5;
        $('#datetimepicker').css('transform', 'scale('+scale+','+scale+')');

        $('.glyphicon-calendar').on('click',function (ev) {
            $('#datetimepicker').data("DateTimePicker").toggle();
        });

        $('#datetimepicker').data("DateTimePicker").toggle();

        $('#dt_from').css('transform', 'scale('+scale+','+scale+')');
        $('#dt_from').css('top', '100px');
        $('#dt_from').data("DateTimePicker").toggle();

        $('#dt_to').css('transform', 'scale('+scale+','+scale+')');
        $('#dt_to').css('top', '100px');
        $('#dt_to').data("DateTimePicker").toggle();

        let sp = $('.sp_dlg');
        // fileExists('./node_modules/moment/locale', (err, files) => {
        //
        // });
        for (let l in langs) {
            l = countries.toAlpha3(l);
            if (true) {
                $(sp).append("<option lang='" + l + "' data-content='<span class=\"flag-icon flag-icon-" + l + "\"></span> " + langs[l] + "'>" + langs[l] + "</option>");
            }else
                langs.splice(l, 1);
        }


        let lat_param = utils.getParameterByName('lat');
        let lon_param = utils.getParameterByName('lon');

        window.user = new User(md5(JSON.stringify(now)));

        var url = http + host_port + '?' + //
            "func=init" +
            "&lang=fr"+
            "&lat="+lat_param+
            "&lon="+lon_param+
            "&date="+now;

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
            class_obj:window.user,
            date:now,
            // xhrFields: {
            //     withCredentials: true
            // },
            success: function (data) {

                if(typeof data =='string')
                    data = JSON.parse(data);
                if (data.menu) {
                    window.user.menu.menuObj = data.menu;

                    $('#datetimepicker').datetimepicker();
                    $('#datetimepicker').data("DateTimePicker").owner = $('#date');
                    $('#datetimepicker').data("DateTimePicker").maxDate(new Date(Date.parse(data.maxdate) + (24*60*60*1000) * 1));

                    let mom = new moment(new Date());
                    if($('#date')[0])
                        $('#date')[0].setAttribute('text', 'value', mom.format('DD.MM.YYYY'));

                    window.dict = new Dict(data.dict);
                    window.dict.set_lang(window.sets.lang, $('#main_window'));
                    window.dict.set_lang(window.sets.lang, $('#ddd'));
                    window.dict.set_lang(window.sets.lang, $('#auth_body'));
                    localStorage.setItem("lang", window.sets.lang);

                    Init();
                    window.user.DocReady();

                }else if (data.auth =='OK') {
                    if(data.menu) {
                        this.class_obj.menu.menuObj = JSON.parse(data.menu);
                        this.class_obj.menu_date = data.maxdate;
                    }
                    cb();
                }else {
                    if (data.msg)
                        alert(data.msg);
                }

            },
            error: function (xhr, status, error) {
                //let  err = eval("(" + xhr.responseText + ")");
                console.log(error.Message);
            },
            complete: function (data) {

            },
        });

    }
});

function Init() {

    for(let l in langs) {
        let country = countries.toAlpha2(langs[l]).toLowerCase();
        let name = l;//ISO6391.default.getName(l);
        $('.selectpicker').append("<option lang='"+l+"' data-content='<span class=\"flag-icon flag-icon-"+country+"\"></span> "+name+"'>"+l+"</option>");
    }

    if(langs[window.sets.lang])
        $('.selectpicker').val(langs[window.sets.lang]).attr("selected", "selected");
    else
        $('.selectpicker').val(langs['en']).attr("selected", "selected");
    $('.selectpicker').selectpicker("refresh");

    // window.dict.Translate('en', window.sets.lang,function () {
    //     //$('.selectpicker').val(lang).attr("selected", "selected");
    //     window.dict.set_lang(window.sets.lang,$('#main_window'));
    //     window.dict.set_lang(window.sets.lang,$('#ddd'));
    // });

    window.dict.set_lang(window.sets.lang,$('#main_window'));

    let scene = document.querySelector('#scene');
    if(scene)
        scene.addEventListener('renderstart', function (ev) {
        });

    if(scene)
        if (scene.hasLoaded) {
            runTween();
        } else {
            scene.addEventListener('loaded', function(){
                runTween();
            });
        }

    function runTween() {

        function animate(time) {

            requestAnimationFrame( animate );
            TWEEN.update(time);

        };
        animate();

        document.addEventListener('touchstart', function (event) {
            //event.preventDefault();
            event.clientX = event.touches[0].clientX;
            event.clientY = event.touches[0].clientY;

        }, false);

        $(window).on('mousemove', function (e) {
            e.preventDefault();
            //$('#cursor').attr('position', (e.clientX - SCREEN_WIDTH / 2) / 400 + ' ' + (SCREEN_HEIGHT / 2 - e.clientY) / 400 + ' ' + '-3');

        });
    }

}











