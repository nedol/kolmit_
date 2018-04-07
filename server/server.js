'use strict'

var https = require('https');
var request = require('request');
var mysql = require('mysql');

let http = require("http");

let globaljs = require('./global');
let utils = require('./utils');

let Dict = require('./dict/dict');

var urlencode = require('urlencode');

var Email = require('./email/email');
let email = new Email();

var md5 = require('md5');

var isJSON = require('is-json');

const translate = require('google-translate-api');//ISO 639-1

let con_param = globaljs.con_param;//change every 8 min
global.con_obj;

let bing_api_token

process.env.upd_reserve = JSON.stringify({'data':'no data'});
process.env.upd_order =  JSON.stringify({'data':'no data'});
global.upd_order_admin ;

String.prototype.replaceAll = function(search, replace){
    return this.split(search).join(replace);
}



module.exports = {

    GetTokenLoop : function (server) {

        return;

        let headers = {
            'Accept':'application/jwt',
            'Ocp-Apim-Subscription-Key':'4ce4aa35b9c546d0beadfd95802da8d2',
            'Content-Length': 0,
            'Content-Type':'application/json',
            'Access-Control-Request-Headers':'content-type,ocp-apim-subscription-key'
        };

        let options = {
            hostname: 'api.cognitive.microsoft.com',
            path:'/sts/v1.0/issueToken',
            method: 'POST',
            headers: headers
        };

        var timerId = setTimeout(function tick() {
            utils.QueryMethod( 'https',options, null, null, function (resp) {
                if(resp==='error'){
                    timerId = setTimeout(tick, 1000);
                }else{
                    bing_api_token =  resp;
                    timerId = setTimeout(tick, 1000*60*8);
                }
            });
        }, 1000);

    },

    startConnection:function () {

        console.error('CONNECTING');
        if(!global.con_obj) {

            global.con_obj = mysql.createConnection(con_param);
            global.con_obj.connect(function (err) {
                if (err) {
                    console.error('CONNECT FAILED', err.code);
                    this.startConnection();
                }
                else
                    console.error('CONNECTED');
            });
            global.con_obj.on('error', function (err) {
                if (err.fatal)
                    this.startConnection();
            });
        }
    },

    HandleRequest:function (q, res) {

        switch (q.func) {
            case 'init':
                InitUser( q, res);
                break;
            case 'auth':
                InitAdmin(q, res);
                break;
            case 'getreserved':
                GetReserved(q, res);
                break;
            case 'updatereservation':
                UpdateReservation(q, res);
                break;
            case 'updateorder':
                if (q.admin)
                    UpdateOrderAdmin(q, res);
                else
                    UpdateOrderUser(q, res);
                break;
            case 'updatemenu':
                UpdateMenu(q, res);
                break;
            case 'translate':
                Translate(q, res);
                break;
            case 'updatedict':
                UpdateDict(q, res);
                break;
            case 'upd_reserve':
                res.writeHead(200, {'Content-Type': 'text/event-stream'});
                res.end(process.env.upd_reserve);
                break;
            case 'getorderupd':
                GetReserved(q, res);
                break;
            case 'upd_order_admin':
                let order;
                if(isJSON(q.order_data)) {
                    order = JSON.parse(q.order_data);
                }else {
                    //console.log('Wrong data format');
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end('Wrong data format');
                    return;
                }
                res.writeHead(200, {'Content-Type': 'text/event-stream'});
                if(global.upd_order_admin)
                    if(order.table===global.upd_order_admin.data.table && order.date===global.upd_order_admin.data.date) {
                        res.end(JSON.stringify(global.upd_order_admin));
                        break;
                    }
                res.end(JSON.stringify({data:'no data'}));
                break;
        }
    }
}


function SetOrderUpd(data){
    process.env.upd_order = data;
}




function InitDict(q, cb) {

    var sql = "SELECT obj.id, obj.data as data"+
        " FROM  objects as obj"+
        " WHERE obj.latitude="+q.lat+" AND obj.longitude="+q.lon;

    global.con_obj.query(sql, function (err, result) {
        if (err)
            throw err;
        if (result.length > 0) {
            if(isJSON(result[0].data)){
                cb( new Dict(JSON.parse(result[0].data)));
            }else{
                cb();
            }
        }
    });
}

function InitUser(q, res) {

    var sql =  "SELECT obj.id, obj.owner, obj.data as obj_data, obj.ddd as ddd, o.data as order_data, DATE_FORMAT(o.date,'%Y-%m-%d') as date"+
        " FROM  objects as obj, orders as o"+
        " WHERE obj.latitude="+q.lat+" AND obj.longitude="+q.lon+
        " AND obj.id=o.obj_id AND (o.data IS NOT NULL OR o.data='') ORDER BY o.date DESC";

    global.con_obj.query(sql, function (err, result) {
        if (err)
            throw err;

        if (result.length > 0) {

            //res.writeHead(200, {'Content-Type': 'application/json'});
            res.writeHead(200,{'Content-Type': 'text/event-stream'});
            res.end(JSON.stringify({
                data: result[0].obj_data,
                ddd: result[0].ddd,
                menu: result[0].order_data,
                maxdate:result[0].date
            }));

        }else {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({msg: 'Initialization is impossible'}));
        }
    });

}

function InitAdmin(q, res) {

    var sql = "SELECT obj.id, obj.owner, obj.data as obj_data, o.data as menu_data"+
        " FROM  objects as obj, orders as o"+
        " WHERE obj.latitude="+q.lat+" AND obj.longitude="+q.lon+
        " AND obj.id=o.obj_id AND o.data<>''  AND o.data IS NOT NULL"+
        " ORDER BY o.date DESC LIMIT 1";

    global.con_obj.query(sql, function (err, result) {
        if (err) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({err:err}));
        }
        if(result.length>0) {
            let owner;
            if(isJSON(result[0].owner)){
                owner = JSON.parse(result[0].owner);
            }else {
                //console.log('Wrong data format');
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end('Wrong data format');
                return;
            }
            let menu_data = (result[0].menu_data);//?result[0].menu_data:"{\"menu\":[\"tab_1\"]}";


            if (owner.uid == q.uid) {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({auth: 'OK', data: result[0].obj_data, menu: menu_data}));
                return;
            }
            if (!owner.uid) {
                owner.uid = q.uid;
                sql = "UPDATE objects SET owner='" + JSON.stringify(owner) + "'" +
                    " WHERE id=" + result["0"].id;

                global.con_obj.query(sql, function (err, result) {
                    if (err)
                        throw err;
                    if (result) {
                        InitAdmin(q, res);
                    }
                });
            }else{
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({msg:'Demo Mode',auth: 'ERROR',data: result[0].obj_data, menu: menu_data}));
            }

        }else{
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({"data": result[0].obj_data,"menu": "[tab_1]"}));
        }
    });
}

function select_query(q, res) {


    let sql = "SELECT DATE_FORMAT(o.date,'%Y-%m-%d') as date, o.data as order_data, o.reserved as reserved" +
        " FROM  orders as o, objects as obj" +
        " WHERE DATE_FORMAT(o.date,'%Y-%m-%d')='" + q.date + "' AND obj.latitude=" + q.lat + " AND obj.longitude=" + q.lon +
        " AND o.obj_id = obj.id" +
        " ORDER BY o.date DESC LIMIT 1";

    //console.log(sql);

    global.con_obj.query(sql, function (err, result) {
        if (err) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({err: err}));
        }
        if(result && result[0]) {
            handleMysqlResult(q, res, result);

        }else{
            //res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({"menu":'undefined'}))
        }
    });
}

function handleMysqlResult(q, res, result){

    var ColorHash = require('color-hash');
    var order = {"reseed": []};

    if(!result[0].reserved || md5(result[0].reserved) === q.order_hash){
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({"menu":md5(result[0].order_data)}));
        return;
    }

    if(!result[0].order_data) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({"menu":'undefined'}));
        return;

    }else {

        let user = (isJSON(urlencode.decode(q.user)) ? JSON.parse(urlencode.decode(q.user)) : q.admin);

        let data;
        if (!result[0].reserved){
            data = "";
        }
        else if(isJSON(result[0].reserved)) {
            data = JSON.parse(result[0].reserved);
        }else {
            //console.log('Wrong data format');
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end('Wrong data format');
            return;
        }

        let order_data = isJSON(result[0].order_data)?JSON.parse(result[0].order_data):result[0].order_data;
        var order = {"reserved": {}, "menu": order_data};
        if (result[0].reserved && result[0].reserved!=='undefined') {
            if(q.admin){
                var users = data;
                for (var u in users) {
                    order.reserved[u] = users[u];
                }
            }else if(q.user){
                for(let t in data) {
                    for (let u in data[t]) {
                        if(!order.reserved[t])
                            order.reserved[t] = {};
                        if (user && user.uid !== u) {
                            data[t][md5(u)] = Object.assign({}, (data[t][u]));
                            delete  data[t][u];
                            order.reserved[t][md5(u)] = data[t][md5(u)];
                        } else {
                            order.reserved[t][u] = data[t][u];
                        }
                    }
                }
            }
        }
        order.order_hash = md5(result[0].reserved);
        order.reserved = urlencode.encode(JSON.stringify(order.reserved));
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(order));
    }

}


function GetReserved(q, res){
    select_query(q, res);
}

function UpdateOrderUser(q, res){

    var sql_select = "SELECT o.reserved, o.id as order_id" +
        " FROM  orders as o, objects as obj" +
        " WHERE obj.latitude=" + q.lat + " AND obj.longitude=" + q.lon  +
        " AND DATE_FORMAT(o.date,'%Y-%m-%d')='" + q.date + "'" ;

    global.con_obj.query(sql_select, function (err, result) {
        if (err){
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({err:err}));
            return;
        }

        let select;
        if(isJSON(result[0].reserved)) {
            select = JSON.parse(result[0].reserved);
        }else{
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end();
            return;
        }
        let order;
        if(isJSON(urlencode.decode(q.order))){
            order = JSON.parse(urlencode.decode(q.order));
        }else{
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end();
            return;
        }

        let table = q.table;
        let menu = q.menu;
        let time = q.time;
        let user;
        let duser = urlencode.decode(q.user);
        let dadmin = urlencode.decode(q.admin);
        if(dadmin!=="undefined" && isJSON(dadmin)) {
            user = JSON.parse(dadmin);
        }
        if(duser!=="undefined"  && isJSON(duser)) {
            user = JSON.parse(duser);
        }

        if(!select[time])
            select[time] = {};
        if(!select[time][user.uid])
            select[time][user.uid] = {};
        if(!select[time][user.uid][table])
            select[time][user.uid][table] = {};

        if (order[table])
            select[time][user.uid][table] = order[table];

// res.writeHead(200, {'Content-Type': 'application/json'});
// res.end();
// return;
        var sql = "UPDATE orders SET reserved='" + JSON.stringify(select) + "'" +
            " WHERE id=" + result["0"].order_id;


        global.con_obj.query(sql, function (err, result) {
            if (err){
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({err:err}));
                return;
            }
            if (result) {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({msg:'The oder was updated'}));

                SetOrderUpd(JSON.stringify({data:{date:q.date,func:'GetOrder'}}));
                setTimeout(function () {
                    process.env.upd_order = JSON.stringify({data:'no data'});
                },1500);
            }
        });
    });
}

function UpdateOrderAdmin(q, res){

    let user;
    let duser =urlencode.decode(q.user);
    let dadmin =urlencode.decode(q.admin);
    if(dadmin!=="undefined"  && isJSON(dadmin)) {
        user = JSON.parse(dadmin);
    }else{
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end();
        return;
    }
    if(duser!=="undefined"  && isJSON(duser)) {
        user = JSON.parse(duser);
    }

    var sql_select = "SELECT o.reserved, o.id as order_id" +
        " FROM  orders as o, objects as obj" +
        " WHERE obj.latitude=" + q.lat + " AND obj.longitude=" + q.lon  +
        " AND DATE_FORMAT(o.date,'%Y-%m-%d')='" + q.date + "'" ;


    global.con_obj.query(sql_select, function (err, result) {
        if (err ||  !result[0]) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({err: err}));
            return;
        }

        let order ;
        if(isJSON(urlencode.decode(q.order))){
            order = JSON.parse(urlencode.decode(q.order));
        }else{
            GetReserved(q, res);
            return;
        }

        var sql = "UPDATE orders SET reserved='" + JSON.stringify(order) + "'" +
            " WHERE id=" + result["0"].order_id;

        global.con_obj.query(sql, function (err, result) {
            if (err){
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({err:err}));
                return;
            }
            if (result) {
                GetReserved(q, res, this._connection);
                global.upd_order_admin =
                    {data:{func:'UpdateOrderAdmin',date:q.date,order:order}};
                setTimeout(function () {
                    global.upd_order_admin = null;
                }, 1100);
            }
        });
    });
}

function UpdateMenu(q, res){

    let admin;
    if(isJSON(q.admin)){
        admin = JSON.parse(q.admin);
    }else{
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end();
        return;
    }

    var sql_select =
        "SELECT obj.id as obj_id, o.id as order_id, o.data as order_data, obj.data as obj_data, DATE_FORMAT(o.date,'%Y-%m-%d') as date" +
        " FROM  orders as o, objects as obj" +
        " WHERE o.obj_id=obj.id "+
        " AND obj.latitude=" + q.lat + " AND obj.longitude=" + q.lon+
        " ORDER BY o.id DESC";

    global.con_obj.query(sql_select, function (err, result) {
        if (err) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({err: err}));
            return;
        }

        let values;
        if(q.dict){// && result[0].obj_data.length<q.dict.length){
            let data = JSON.parse(result[0].obj_data);
            let dict = q.dict;

            data.dict = JSON.parse(dict);
            values = [JSON.stringify(data)];

            var sql ="UPDATE objects SET data=?   WHERE id="+result[0].obj_id;
            //console.log(sql);

            global.con_obj.query(sql,values, function (err, result) {
                if (result) {

                }
            });
        }

        if (q.date === result[0].date) {
            values = [urlencode.decode(q.menu),result[0].order_id ];
            var sql =
                'UPDATE orders SET  data=?, date=now(), reserved=orders.reserved '+
                ' WHERE orders.id =?';
            //' ON DUPLICATE KEY UPDATE data=\'{\"menu\":\"' + urlencode.decode(q.menu) + '\"}\'';
        }else {
            values = [result[0].obj_id,urlencode.decode(q.menu),q.date,'{"19:00 - 24:00":{},"13:00 - 17:00":{}}'];
            var sql =
                'INSERT INTO orders SET obj_id =?, data=?, date=?, reserved=?';
            //+' ON DUPLICATE KEY UPDATE data=\'{\"menu\":\"' + urlencode.decode(q.menu) + '\"}\'';
        }

        global.con_obj.query(sql, values, function (err, result) {
            if (err) {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({err: err}));
                return;
            }
            if (result) {
                res.writeHead(200, "OK", {'Content-Type': 'text/plain'});
                res.end(JSON.stringify({result: result}));
            }
        });

    });
}

function UpdateReservation(q, res){

    var sql = "SELECT *, o.id as order_id " +
        " FROM  orders as o, objects as obj" +
        " WHERE  o.obj_id=obj.id AND obj.latitude=" + q.lat + " AND obj.longitude=" + q.lon +
        " AND DATE_FORMAT(o.date,'%Y-%m-%d')='" + q.date + "'";

    global.con_obj.query(sql, function (err, result) {
        if (err){
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({err:err}));
            return;
        }

        if(!result[0]){
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({msg:'No reservation data for the date'}));
            return;
        }

        let user;
        if(isJSON(urlencode.decode(q.user))){
            user = JSON.parse(urlencode.decode(q.user));
        }else{
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end();
            return;
        }
        let menus;
        if((q.menus && isJSON(urlencode.decode(q.menus)) || q.menus==="{}")) {
            menus = JSON.parse(urlencode.decode(q.menus));
        }else{
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end();
            return;
        }
        let time = q.time;
        let query = {[time]:{[user.uid]:{email:user.email,uname:user.uname, [q.table]:menus}}};
        let cancel = false;
        let input = {};

        if(result[0].reserved && result[0].reserved!=='undefined') {
            var select;
            if(isJSON(result[0].reserved)){
                select = JSON.parse(result[0].reserved);
            }else{
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end();
                return;
            }
            input = Object.assign({}, select);
            if(!input[time])
                input[time] = {};
            if (select[time][user.uid]) {
                input[time][user.uid][q.table] = menus;
                //input[user.uid].reserved[t][q.table] = menus;

            } else {
                input[time][user.uid] = {};
                input[time][user.uid][q.table] = query[time][user.uid][q.table];
            }
        }else{
            input = query;
        }

        sql = "UPDATE orders SET reserved='" + JSON.stringify(input) + "'" +
            " WHERE id=" + result["0"].order_id;

        global.con_obj.query(sql, function (err, result) {
            if (err){
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({err:err}));
                return;
            }

            if (result) {
                if(!cancel) {
                    InitDict(q, function (dict) {
                        let user;
                        if(isJSON(urlencode.decode(q.user))) {
                            user = JSON.parse(urlencode.decode(q.user));
                        }else{
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            return;
                        }
                        //let msg = dict.getDict()['a10ccf20b9307e0a8e26ecca77a63541']['en'];
                        email.SendMail("nedol@narod.ru", user.email, "New Table Reservation", 'Test Message');
                    });
                }else{
                    //TODO
                    // InitDict(q, function (dict) {
                    //     let user = JSON.parse(urlencode.decode(q.user));
                    //     let msg = dict.getDict()['04bd09bce3173f943374c299c3b52df9']['en']
                    //     email.SendMail("nedol@narod.ru", user.email, "Table Reservation Canceled", msg);
                    // });
                }
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({user:q.user,msg: "Table reservation was succesfully updated"}));

            }else {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({msg: "No table was updated"}));
            }

            process.env.upd_reserve = JSON.stringify({data:{date:q.date,func:'GetReserved'}});
            setTimeout(function () {
                process.env.upd_reserve = JSON.stringify({data: 'no data'});
            }, 1500);

        });
    });
}

function UpdateDict(q, res){

    var sql_select = "SELECT obj.id as obj_id, obj.data as data" +
        " FROM objects as obj" +
        " WHERE obj.latitude=" + admin.lat + " AND obj.longitude=" + admin.lon;

    global.con_obj.query(sql_select, function (err, result) {

        if (result.length > 0) {



        }else{

        }
    });
}

function Translate(q, res) {

    let data = JSON.parse(q.data);
    let to = q.to;
    let cnt = 0;
    res.writeHead(200, "OK", {'Content-Type': 'text/plain'});

    var curriedDoWork = function(obj,trans) {
        cnt++;
        console.log(trans.text + obj.key);
        obj.data[obj.key][obj.to] = trans.text;
        obj.data[obj.key][trans.from.language.iso] = obj.src;
        if(obj.length===cnt) {
            obj.res.end(JSON.stringify(obj.data));
        }

    };

    for(let w=0; w<Object.keys(data).length; w++) {
        let key = Object.keys(data)[w];
        let from = Object.keys(data[key])[0];
        let obj = {res:res,key:key, data:data, to:to, from:from, src:data[key][from],length:Object.keys(data).length};
        //https://github.com/matheuss/google-translate-api

        new translate(data[key][from], {to: to}).then(curriedDoWork.bind(null, obj),function (ev) {
            console.log(ev);
        });

    }



}

function TranslateMicrosoft(q, res) {

    let data = "Hello";
    let from = q.from;
    let to = q.to;

    translate('Ik spreek Engels', {to: 'en'}).then(res => {
        console.log(res.text);
        //=> I speak English
        console.log(res.from.language.iso);
        //=> nl
    }).catch(err => {
        console.error(err);
    });

    var options = {
        hostname: 'api.microsofttranslator.com',
        path:'/V2/Http.svc/TranslateArray?texts='+encodeURIComponent(data)+'&to='+to+'&contentType=text/plain',
        method: 'POST',
        headers: {'Authorization': 'Bearer '+bing_api_token, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data)}
    };

    let body = String("<TranslateArrayRequest>" +
        "<AppId />" +
        "<From>{0}</From>" +
        "<Options>" +
        " <Category xmlns=\"http://schemas.datacontract.org/2004/07/Microsoft.MT.Web.Service.V2\" />" +
        "<ContentType xmlns=\"http://schemas.datacontract.org/2004/07/Microsoft.MT.Web.Service.V2\">{1}</ContentType>" +
        "<ReservedFlags xmlns=\"http://schemas.datacontract.org/2004/07/Microsoft.MT.Web.Service.V2\" />" +
        "<State xmlns=\"http://schemas.datacontract.org/2004/07/Microsoft.MT.Web.Service.V2\" />" +
        "<Uri xmlns=\"http://schemas.datacontract.org/2004/07/Microsoft.MT.Web.Service.V2\" />" +
        "<User xmlns=\"http://schemas.datacontract.org/2004/07/Microsoft.MT.Web.Service.V2\" />" +
        "</Options>" +
        "<Texts>" +
        "<string xmlns=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">{2}</string>" +
        "<string xmlns=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">{3}</string>" +
        "<string xmlns=\"http://schemas.microsoft.com/2003/10/Serialization/Arrays\">{4}</string>" +
        "</Texts>" +
        "<To>{5}</To>" +
        "</TranslateArrayRequest>");

    // request({
    //     method: 'POST',
    //     url: 'http://api.microsofttranslator.com/V2/Http.svc/TranslateArray',
    //     headers: {
    //         'Authorization': 'Bearer '+bing_api_token,
    //         'Content-Type': 'application/xml', 'Content-Length': Buffer.byteLength(data)
    //     },
    //     json: data //put your JSON here
    // }, function(err, res, body) {
    //     console.log(res);
    // });
    let appId = '';

    // utils.QueryMethod('https',options, body, res, function (trans) {
    //    if(trans!=='error') {
    //        trans = parse(trans);
    //        res.writeHead(200, {'Content-Type': 'application/json'});
    //        res.end(JSON.stringify(trans.root.content));
    //    }
    // });

}
