'use strict'

window.$ = window.jQuery = require('jquery')
require('dialog-polyfill');

require("../global");

let utils = require('../utils');
import {Admin} from './admin'

const langs = require("../dict/languages");
var countries = require("i18n-iso-countries");

// require('bootstrap/js/dropdown.js');
require('bootstrap/js/tooltip.js');
require('bootstrap/js/tab.js');
require('bootstrap-select');


var isJSON = require('is-json');


// require("imports-loader?this=>window!../lib/jquery.mobile-1.4.5.min.js");
// require('jquery-mobile-babel-safe');
var md5 = require('md5');


// import registerClickDrag from 'aframe-click-drag-component';
// registerClickDrag(AFRAME);

let TWEEN = require('@tweenjs/tween.js');

window.demoMode = (utils.getParameterByName('dm')==='0'?false:true);


$(document).on('readystatechange', function () {

    if (document.readyState !== 'complete') {
        return;
    }

    $.fn.modal.Constructor.prototype.enforceFocus = function() {};

    if(localStorage.getItem('lang')){
        window.sets.lang = localStorage.getItem('lang');
    }else if(utils.getParameterByName('lang')){
        window.sets.lang = utils.getParameterByName('lang');
    }else if(window.navigator.userLanguage || window.navigator.language) {
        window.sets.lang = window.navigator.userLanguage || window.navigator.language;
        window.sets.lang = window.sets.lang.split('-')[0];
    }

    $('.selectpicker').selectpicker();

    // Swap languages when menu changes
    $('.selectpicker').change(function(ev) {
        let lang = ev.target.options[ev.target.selectedIndex].text.toLowerCase().substring(0, 2);
        $('.selectpicker').val(ev.target.options[ev.target.selectedIndex].text).attr("selected", "selected");
        window.sets.lang = lang;
        localStorage.setItem("lang", window.sets.lang);
        window.dict.set_lang(window.sets.lang,$('#main_window'));
    });

    let sp = $('.sp_dlg');
    if( utils.getParameterByName('admin')) {
        for(let l in langs) {
            let country = countries.toAlpha2(langs[l]).toLowerCase();
            let name = l;//ISO6391.default.getName(l);
            $('.selectpicker').append("<option lang='"+l+"' data-content='<span class=\"flag-icon flag-icon-"+country+"\"></span> "+name+"'>"+l+"</option>");
            $('.sp_dlg').append("<option lang='"+l+"' data-content='<span class=\"flag-icon flag-icon-"+country+"\"></span> "+name+"'>"+l+"</option>");

        }
    }

    $('#datetimepicker').datetimepicker({
        inline: true,
        sideBySide: true,
        locale: window.sets.lang,
        format:'DD.MM.YYYY',
        defaultDate: new Date(),
        disabledDates: [
            // moment("12/25/2018"),
            //new Date(2018, 11 - 1, 21),
            "2018-01-12 00:53"
        ]
    });

    let dt_w = $('#datetimepicker').css('width');
    let dt_h = $('#datetimepicker').css('height');
    let scale = window.innerWidth > window.innerHeight?(window.innerHeight)/parseFloat(dt_h):(window.innerWidth)/parseFloat(dt_w);
    $('#datetimepicker').css('transform', 'scale('+scale+','+scale+')');

    $(window).on( "resize", function( event ) {
        let dt_w = $('#datetimepicker').css('width');
        let dt_h = $('#datetimepicker').css('height');
        let scale = window.innerWidth > window.innerHeight?(window.innerHeight)/parseFloat(dt_h):(window.innerWidth)/parseFloat(dt_w);
        $('#datetimepicker').css('transform', 'scale('+scale+','+scale+')');
    });

    $('#datetimepicker').data("DateTimePicker").toggle();

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

    $('#dt_from').css('transform', 'scale('+scale+','+scale+')');
    $('#dt_from').css('top', '100px');
    $('#dt_from').data("DateTimePicker").toggle();

    $('#dt_to').css('transform', 'scale('+scale+','+scale+')');
    $('#dt_to').css('top', '100px');
    $('#dt_to').data("DateTimePicker").toggle();

    // $(window).on( "orientationchange", function( event ) {
    //     let scale = window.innerWidth > window.innerHeight?(window.innerHeight)/300:(window.innerWidth)/300;
    //     $('#datetimepicker').css('transform', 'scale('+scale+','+scale+')');
    // });

    $('.glyphicon-calendar').on('click',function (ev) {
        $('#datetimepicker').data("DateTimePicker").toggle();
    });

    let lat_param = utils.getParameterByName('lat');
    let lon_param = utils.getParameterByName('lon');


    let uObj;
    if(utils.getParameterByName('admin')) {
        let uid = md5(JSON.stringify(Date.now()));
        if(!localStorage.getItem('admin')) {
            uObj = {"email":utils.getParameterByName('admin'),"uid":uid};
            localStorage.setItem('admin',JSON.stringify(uObj));
        }else{
            uObj = localStorage.getItem('admin');
            if(!isJSON(uObj)) {
                uObj = {
                    "email": utils.getParameterByName('admin'),
                    "uid": uid
                };
                localStorage.setItem('admin', JSON.stringify(uObj));
            }else
                uObj = JSON.parse(uObj);
        }
    }

    window.admin = new Admin(uObj);
    window.admin.IsAuth(function (data) {

    });

    Init();

});

function Init() {

    $('.selectpicker').val(langs[window.sets.lang]).attr("selected", "selected");
    $('.selectpicker').selectpicker("refresh");


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

        //scene.systems['gltf-exporter'].export([$('.kolobot')[0]], null);

        //scene.renderer.render();
        // let kolobot = document.querySelector('.kolobot');
        // kolobot.addEventListener('click', function (event) {
        //     console.log('Entity event type', event.type);
        // });

        function onDocumentMouseDown(event) {
            //event.preventDefault();
            //event.stopPropagation();
        }

        document.addEventListener('touchstart', function (event) {
            //event.preventDefault();
            event.clientX = event.touches[0].clientX;
            event.clientY = event.touches[0].clientY;
            onDocumentMouseDown(event);
        }, false);

        $(window).on('mousemove', function (e) {
            e.preventDefault();
            //$('#cursor').attr('position', (e.clientX - SCREEN_WIDTH / 2) / 400 + ' ' + (SCREEN_HEIGHT / 2 - e.clientY) / 400 + ' ' + '-3');

        });

    }

}











