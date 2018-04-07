'use strict'
export {AR};

// import {THREEx} from './threex.objcoord.js';

require('aframe-animation-component')

class AR{

    constructor(){

        this.scale = 100;

        this.ainim_interval;

        //for(var i=0;i<4;i++)
            this.AddFlyer(0);

        this.chk_flr__interval = setInterval(function (this_obj) {
            if($('#net').attr('status')==='0')
                this_obj.CheckFlyer();
        },200,this);
    }

    AddFlyer(id) {

        let target = {x:50,y:200,z:500};

        var anim =
            '<a-animation attribute="rotation" easing="linear" from="0 0 -40" to="0 0 -60" dur="200"  ' +
            'repeat="indefinite"></a-animation>';

        $(anim).appendTo($('#flr'));


        this.ainim_interval = setInterval(function (flyer,scale) {

//                if($('#net').attr('status')==='0')
//                    CheckFlyer();

            var pos = flyer.object3D.position;
            var anim_pos = $(flyer).find('[attribute=position]');
            if (anim_pos[0])
                anim_pos[0].remove();
            var rand_x = parseFloat(getRandomArbitrary(-scale, scale)) + parseFloat(pos.x);
            if (Math.abs(rand_x) > scale*2)
                rand_x += rand_x >= target.x ? -scale : scale;
            var rand_y = parseFloat(getRandomArbitrary(-scale, scale)) + parseFloat(pos.y);
            if (Math.abs(rand_y) > scale*2)
                rand_y += rand_y >= target.y ? -scale :scale;
            var rand_z = parseInt(getRandomInteger(-scale, scale)) + parseFloat(pos.z);
            if (Math.abs(rand_z) > scale*2)
                rand_z += rand_z >= target.z ? -scale : scale;

            var ease = getRandEasing();

            var posAr = {
                from: [(pos.x).toFixed(2), (pos.y).toFixed(2), (pos.z).toFixed(2)],
                to: [rand_x, rand_y, rand_z]
            };

            var apos = '<a-animation attribute="position" ' +
                'from="' + posAr.from[0] + ' ' + posAr.from[1] + ' ' + posAr.from[2] + '" ' +
                'to="' + posAr.to[0] + ' ' + posAr.to[1] + ' ' + posAr.to[2] +
                '" ' +
                //                    'repeat="indefinite"'+
                'dur="500"  delay="0" fill="both" easing="linear"></a-animation>';

            $(apos).appendTo(flyer);

        }, 500+id*10, $('#flr')[0], this.scale);

        function getRandomArbitrary(min, max) {
            return Math.random() * (max - min) + min;
        }

        function getRandomInteger(min, max) {
            var rand = min - 0.5 + Math.random() * (max - min + 1)
            rand = Math.round(rand);
            return rand;
        }

        function getRandEasing(){
            var easeAr = ['linear','ease','ease-in','ease-out','v'];
            var r= getRandomInteger(0,easeAr.length-1);
            var val = easeAr[r];
            return val;
        }
    }

    CheckFlyer(){

        var camera = $('a-camera')[0].components.camera;
        var rend = $('a-scene')[0].renderer;
        var flyerAr = $('a-image.flyer');
        for(var i=0;i<flyerAr.length;i++) {
            if (flyerAr[i]) {
                var pos = THREEx.ObjCoord.cssPosition(flyerAr[i].object3D, camera.camera, rend);

                var net_rect = $('#net').get(0).getBoundingClientRect();
                var b_rect = $('body').get(0).getBoundingClientRect();

//                var dist_net = Math.sqrt(
//                    Math.pow((net_rect.left+100)-pos.x,2)+
//                    Math.pow(net_rect.top-100 - (screen.height - pos.y),2));
//
//                if(dist_net<100){
//                    //MoveFlyer(flyerAr[i], net_rect);
//                }

                if (net_rect.left < pos.x && net_rect.right > pos.x && screen.height - pos.y < 200 && screen.height - pos.y > 0
                    && flyerAr[i].components.position.attrValue.z>=0.7) {
                    $('#net').attr('status', '1');
                    $('a-scene').find(flyerAr[i]).remove();
                    var flyer_new = $('#img_flyer').clone().get(0);
                    $(flyer_new).insertAfter($('#img_flyer'));
                    $(flyer_new).css('display', 'block');
                    $(flyer_new).on('click touchstart', function () {


                    });

                    // $(flyer_new).draggable({
                    //     distance: 20,
                    //     start: function () {
                    //         console.log("flyer drag");
                    //     },
                    //     drag: function () {
                    //         $(flyer_new).attr('drag', true);
                    //     },
                    //     stop: function () {
                    //         $('#net').attr('status', "0");
                    //         this.AddFlyer();
                    //     }
                    // });
                }

            }
        }
    }

    MoveFlyer(flyer, net_pos){

        var anim_pos = $(flyer).find('[attribute=position]');
        var rand_y = getRandomArbitrary(-.5, .5).toFixed(2);
        var rand_z = getRandomArbitrary(-1, 1).toFixed(2);
        var pos = flyer.object3D.position;

        if(anim_pos[0]) {

            anim_pos[0].remove();
            var anim= '<a-animation attribute="position" ' +
                'from="' + (pos.x - 1) + ' ' + pos.z + ' ' + pos.y + '"  ' +
                'to="' + (pos.x - 2) + ' ' + (pos.z - 1) + ' ' + (pos.y- 1) + '" ' +
                'dur="1000" delay="0" fill="forwards" easing="linear"></a-animation>';
            $(anim).appendTo(flyer);

        }else {

        }
    }

    AddFlyersLoop(){

        var cnt = 0;
        setInterval(function () {
            cnt++;
            var pplane = '<a-image class="flyer" id="pplane'+cnt+'" mixin="image" src="#pplane" scale="1 1 1" position="0 0 0">';
            var x = -10;
            var z = 0;
            var items = [-1,1];
            for(var i=0;i<=20;i++) {
                var sign_y = items[Math.floor(Math.random()*items.length)];
                var sign_z = items[Math.floor(Math.random()*items.length)];
                var rand_y = getRandomArbitrary(-.5,.5).toFixed(2);
                var rand_z = getRandomArbitrary(-1,1).toFixed(2);
                pplane+=
                    '<a-animation attribute="position" ' +
                    'from="'+x+' '+rand_z+' '+rand_y+'"  ' +
                    'to="'+(x+1)+' '+(parseFloat(rand_z)+parseFloat(sign_z*.5)).toFixed(2)+' '+(parseFloat(rand_y)+parseFloat(sign_y*.5)).toFixed(2)+'" ' +
                    'dur="1000" delay="'+i*1000+'" fill="forwards" easing="linear" ' +
                    'onanimationend="OnAnimationEnd();"></a-animation>';
                x++;
//                if(i<10)
//                    z++;
//                else
//                    z--;
            }
            pplane+=
                '<a-animation id="1" attribute="rotation" easing="linear" from="-65 0 -30" to="-115 0 -50" dur="200"  repeat="indefinite"></a-animation>';
//            pplane+=
//            '<a-animation id="2" attribute="rotation" easing="ease-in"  to="-90 0 -25" dur="150"  repeat="indefinite"></a-animation>';
            pplane+=
                '</a-image>';

            $(pplane).appendTo($('a-scene'));

            setTimeout(function (pplane) {
                $('a-scene').find(pplane).remove();
            }, 20000, pplane);
        }, 5000);

        setInterval(function () {
            if($('#net').attr('status')==='0')
                CheckFlyer();
        },100);
    }


}