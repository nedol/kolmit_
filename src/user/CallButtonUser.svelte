<div class="callObject" on:long-press|preventDefault|stopPropagation = {OnLongPress}   
    style="display: block;position:absolute;max-width: 100%; height:100%;top:0;left:6px;z-index:10">
    
    <svg 
        class="callButton" status={status}  on:click  on:mute width="35" height="35">
        <!-- <rect id="backgroundrect" width="100%" height="100%" x="0" y="0" fill="none" stroke="none"/>
        <glyph glyph-name="phone" unicode="" horiz-adv-x="1000"/>         -->
        <g class="currentLayer" style=" stroke:black; stroke-width:10px;"><title>Layer 1</title>
            <path d="M390.7 353.3c-120.30000000000001 69.5 63.19999999999999 413.59999999999997 194.90000000000003 337.59999999999997l122.10000000000002 211.39999999999998c-55.60000000000002 32.10000000000002-102.5 52.30000000000007-166.9000000000001 15.5-178.79999999999995-102.19999999999993-375.59999999999997-442.9-369.99999999999994-646.0999999999999 1.8999999999999773-70.60000000000005 43.599999999999994-98.30000000000004 97.89999999999998-129.70000000000005 23.30000000000001 40.400000000000006 98.60000000000002 170.8 122 211.3z m50.400000000000034-5.699999999999989c-13 7.5-29.700000000000045 3.099999999999966-37.30000000000001-10l-115-199.3c-7.5-13.000000000000014-3.1000000000000227-29.700000000000017 10-37.30000000000001l60.5-34.900000000000006c13-7.499999999999993 29.69999999999999-3.0999999999999943 37.30000000000001 10l115.09999999999997 199.29999999999998c7.500000000000057 13 3.099999999999966 29.700000000000045-10 37.200000000000045l-60.599999999999966 35z m314.4 544.5c-13 7.5-29.700000000000045 3.1000000000000227-37.299999999999955-10l-115-199.30000000000007c-7.5-13-3.1000000000000227-29.699999999999932 10-37.299999999999955l60.5-34.89999999999998c13-7.5 29.699999999999932-3.1000000000000227 37.299999999999955 10l115.10000000000002 199.29999999999995c7.5 13 3.1000000000000227 29.700000000000045-10 37.30000000000007l-60.60000000000002 34.89999999999998z" 
            id="svg_1" class="selected" 
            transform = "scale(.03)"/></g>
    </svg>

    <slot></slot>
    <span class="badge badge-primary badge-pill call-queue"
          style="display:none;position: absolute;right:0px;bottom:0px;color:#0e0cff;font-size: 12px;opacity:1">0</span>

</div>
        


<script>
// let status = 'talk';


import 'long-press-event';

export let status = "inactive";
export let OnLongPress;
  
</script>

<style>
    .callButton{
        margin-left: -10px;
    }
   [status='wait']{
       transform: rotate(0deg) !important;
       color: #69da12;
   }
   [status='wait'] g{
       fill:rgb(255, 255, 255);
   }

   [status='call'] g{
        fill:orange
    }
    [status='talk']{
        transform: rotate(0deg) !important;
    }
    [status='talk'] g{
        fill:green;
    }
    [status='muted']{
        transform: rotate(120deg) !important;
        color: #232323;
    }
    [status='inactive']{
        color: #dea677;
        transform: rotate(120deg);
    }
    [status='inactive'] g{
        fill: #fff0;
    }
    [status='active']{
        transform: rotate(120deg);
        color: black;
    }
    [status='active'] g{
        fill: orange;
    }
    [status='busy']{
        transform: rotate(120deg);
        opacity:0.3;
        color: indianred;
    }

   @keyframes shake {
       0% { transform: translate(1px, 1px) rotate(0deg); }
       10% { transform: translate(-1px, -2px) rotate(-1deg); }
       20% { transform: translate(-3px, 0px) rotate(1deg); }
       30% { transform: translate(3px, 2px) rotate(0deg); }
       40% { transform: translate(1px, -1px) rotate(1deg); }
       50% { transform: translate(-1px, 2px) rotate(-1deg); }
       60% { transform: translate(-3px, 1px) rotate(0deg); }
       70% { transform: translate(3px, 1px) rotate(-1deg); }
       80% { transform: translate(-1px, -1px) rotate(1deg); }
       90% { transform: translate(1px, 2px) rotate(0deg); }
       100% { transform: translate(1px, -2px) rotate(-1deg); }
   }
</style>