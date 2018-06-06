'use strict'
var isJSON = require('is-json');

module.exports = class SSE{

    constructor(){

    }


    SetOrderUpdLstnr(user, class_obj,cb){

        let url = http + host_port + '?' + //
            user +
            "&proj=bm"+
            "&func=getreserved" +
            "&order_hash="+class_obj.order_hash+
            "&lat=" + class_obj.lat_param +
            "&lon=" + class_obj.lon_param +
            "&date=" + $('#datetimepicker').data("DateTimePicker").date().format('YYYY-MM-DD') +
            "&lang=" + window.sets.lang;

        $.ajax({
            url: url,
            method: "GET",
            //dataType: 'json',
            contentType: false,
            cache: false,
            processData: false,
            crossDomain: true,
            user: user,
            this_obj:this,
            class_obj:class_obj,
            callback:cb,
            success: function (resp) {
                if(typeof resp !=='object')
                    resp =JSON.parse(resp);
                this.callback(resp,this.class_obj);
            },
            complete: function (resp) {
                setTimeout(function (user,class_obj,this_obj, cb) {
                    this_obj.SetOrderUpdLstnr(user,class_obj,cb);
                },1000,this.user,this.class_obj, this.this_obj,this.callback);
            }
        });
    }

    SetOrderAdminUpdLstnr( order_data, cb){

        var url = http + host_port + '?' + //
            "func=upd_order_admin"+
            "&order_data="+order_data;
        $.ajax({
            url: url,
            method: "GET",
            dataType: 'json',
            contentType: false,
            cache: false,
            processData: false,
            crossDomain: true,
            order_data: order_data,
            this_obj:this,
            callback:cb,
            success: function (data) {
                if(data.data.func==='UpdateOrderAdmin'){
                    this.callback(data.data);
                }
            },
            complete: function (data) {
                setTimeout(function (this_obj,order_data,cb) {
                    this_obj.SetOrderAdminUpdLstnr(order_data,cb);
                },1000, this.this_obj,this.order_data,this.callback);
            }
        });
    }

}

