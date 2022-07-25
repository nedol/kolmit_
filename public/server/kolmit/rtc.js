'use strict'

const fs = require('fs');
const os = require("os");
let path = require('path');
let Email = require( "../email/email");
let moment = require('moment');
let _ = require('lodash');

let log4js = require('log4js');
const { forEach } = require('lodash');
const md5 = require('md5');

const tarifs = require('../kolmit/tarifs/tarifs.json')

log4js.configure({
    appenders: { users: { type: 'file', filename: 'users.log' }},
    categories: { default: { appenders: ['users'], level: 'all' } }
});
const logger = log4js.getLogger('users');

global.rtcPull = {'user':{}, 'operator':{}};


module.exports = class RTC {

    constructor() {

    }

    async dispatch(q , ws, mysql) {
        this.mysql = mysql;
        // if(q.em)
        //     console.log("func:"+q.func+" email:"+q.em);
        let vals = '';
        this.sql = '';
        switch (q.func) {
            case 'operator':
                if(q.send_mail && q.psw){

                    const ab = q.abonent?q.abonent:q.send_mail;
                    vals = [q.psw, q.send_mail, ab, '{"name": "free", "start": "2021-12-14"}'];
                    this.sql = "INSERT INTO operators SET psw=?, operator=?, abonent=?, tarif=?";

                    mysql.query(this.sql, vals, async (err, result)=> {
                        if (err) {
                            if(err.errno===1062)
                                ws.send(encodeURIComponent(JSON.stringify({func:q.func, msg:err.errno})));
                        }else{
                            this.SendEmail(q);   
                            ws.send(encodeURIComponent(JSON.stringify({func:q.func, msg:'Kolmit operator link was sent to '+q.send_mail})));
                        }
                    });
                }
                break;

            case 'check':
                this.SetParams(q, ws);

                if(q.type==='user'){
                    let cnt_queue = 0;
                    let item = _.find(global.rtcPull[q.type][q.abonent][q.em],{uid:q.uid})
                    try {
                        // for (let uid in global.rtcPull[q.type][q.abonent]) {
                        //     if (global.rtcPull[q.type][q.abonent][q.em][uid])
                        //         if (global.rtcPull[q.type][q.abonent][q.em][uid].status === 'call' ||
                        //             global.rtcPull[q.type][q.abonent][q.em][uid].status === 'wait')
                        //             if (global.rtcPull[q.type][q.abonent][q.em][uid].uid === q.uid) {
                        //                 cnt_queue++;
                        //             }
                        // }

                    }catch(ex){

                    }
                    item.ws.send(encodeURIComponent(JSON.stringify({
                        func:q.func,
                        check: true,
                        queue: String(cnt_queue)
                    })));

                    this.SendOperatorStatus(q);

                }else if(q.type==='operator'){
// console.log(q.em)
                    let prom = new Promise((resolve, reject)=>{

                        if(q.psw && q.hash && this.getHash(q.em)=== q.hash){

                            vals = [q.psw, q.em, q.abonent, JSON.stringify({name:'free'})];
                            this.sql = "REPLACE INTO operators SET psw=?, operator=?, abonent=?, tarif=?";

                            mysql.query(this.sql, vals, async (err, result)=> {
                                if (err) {

                                }else{ 

                                }

                                resolve();
                            });
                        }else{
                            resolve();
                        }
                    });

                    await prom;
            
                    if(q.em){
                        if(q.abonent){
                            vals = [ q.abonent, q.em, q.abonent, q.psw];
                            this.sql = "SELECT *, (SELECT tarif FROM operators WHERE operator=? AND abonent=operator) as tarif FROM  operators WHERE operator=? AND abonent=? AND psw=?";
                        }else{
                            vals = [q.em, q.abonent, q.psw];
                            this.sql = "SELECT * FROM  operators WHERE operator=? AND abonent=? AND psw=?";
                        }
                        mysql.query(this.sql, vals,  (err, result)=> {
                            if (err) {

                            }else{
                     
                                if(result[0]) {  
                                    if(q.psw==result[0].psw){
                                        if(result[0].tarif && JSON.parse(result[0].tarif).paid && new Date(JSON.parse(result[0].tarif).paid)>=Date.now() ) {
                                            ws.send(encodeURIComponent(JSON.stringify({func:q.func,check: true, tarif:JSON.parse(result[0].tarif)})));
                                        }else
                                            ws.send(encodeURIComponent(JSON.stringify({func:q.func,check: true, tarif:JSON.parse(result[0].tarif)})));
                                    }else{
                                        ws.send(encodeURIComponent(JSON.stringify({func:q.func,check: false})));
                                    }
                                }else{
                                    ws.send(encodeURIComponent(JSON.stringify({func:q.func, check: false}))); 
                                }
                            
                            }  
                        });            
                    }else{
                        vals = [q.email];
                        this.sql = "SELECT * FROM  operators WHERE operator=?";
                        mysql.query(this.sql, vals,  (err, result)=> {
                            if (err) {
                            }
                        });

                        ws.send(encodeURIComponent(JSON.stringify({func:q.func,check: true})));     
                    }                  
                    
                }

                break;

            case 'getusers':

                this.SetParams( q, ws);

                if( q.abonent){
                    vals = [q.abonent, q.em, q.abonent, q.psw];
                    
                    this.sql = "SELECT (SELECT tarif FROM operators WHERE operator=?) as tarif, users "+
                    "FROM operators, users "+ 
                    "WHERE operators.operator=? AND operators.abonent=? AND operators.psw=?";
                }else{
                    vals = [q.em, q.psw];
                    
                    this.sql = "SELECT tarif, users "+
                    "FROM operators, users "+ 
                    "WHERE operators.operator = users.operator AND operators.operator=? AND operators.psw=? AND operators.abonent=''";
                }

                mysql.query(this.sql, vals, async function (err, result) {
                    if (err) {

                    }else{
                        if(result[0]){
                            let res = false;
                            let users =JSON.parse(result[0].users);
                            for(let d in users){
                                if(users[d].admin.email=== q.em){
                                    res = true;
                                    break;
                                }
                                for(let s in users[d].staff) {
                                    if(users[d].staff[s].email === q.em){
                                        res = true;
                                        break;                                    
                                    }
                                }   
                            }
                            if(res){
                                ws.send(encodeURIComponent(JSON.stringify({func:q.func,users:JSON.parse(result[0].users)})));                                
                            }
                        }else{
                            ws.send(encodeURIComponent(JSON.stringify({func:q.func,users:[]})));
                        }
                    }
                });

                break;
    

            case 'offer':
                this.SetParams( q, ws);
                this.BroadcastOperatorStatus(q, 'offer');

                break;
            case 'call':
                this.SetParams( q, ws);
                this.HandleCall( q);

                break;

            case 'status':
                if(q.status==='call'){
                    if(q.type==='operator') {
                        let item = _.find(global.rtcPull[q.type][q.abonent][q.em],{uid:q.uid});
                        if(item)
                            item.status = 'busy';
                        this.BroadcastOperatorStatus(q, 'busy');
                        // global.rtcPull['operator'][q.abonent][q.em].shift();
                    }
                    break;
                }
                if(q.status==='close') {
                    let item = _.find(global.rtcPull[q.type][q.abonent][q.em],{uid:q.uid});
                    if(item)
                        item.status = q.status;
                    if(q.type==='operator')
                        this.BroadcastOperatorStatus(q, 'close');
                    //this.RemoveAbonent(q);
                    break;
                }

                this.SetParams(q, ws);

                break;

            case 'addoper':    
         
                vals = [q.abonent?q.abonent:q.em, q.em, q.abonent?q.abonent:'', q.psw];
                this.sql = "SELECT *, (SELECT users FROM users WHERE operator=?) as users "+
                "FROM  operators as oper "+ 
                "WHERE oper.operator=?  AND abonent=? AND psw=?";

                mysql.query(this.sql, vals,  (err, result)=> {
                    if (err) {
                        ws.send(encodeURIComponent(JSON.stringify({func:q.func, msg: 'error'})));
                    }else{
                        let usrs  = [];
                        if(result[0]){
                            usrs = JSON.parse(result[0].users); 
                            let dep  =   _.find(usrs, {'id':q.dep_id});          

                            let item =  {"id": dep.staff.length+1,"desc": "", "name": "", "role": "operator", "email": "", "picture": {"medium": "../assets/operator.svg"}};                        
                                
                            dep.staff.push(item);

                            vals = [JSON.stringify(usrs),  q.em, q.abonent || q.em];
                            this.sql = "UPDATE users SET users=?, last=CURRENT_TIMESTAMP(), editor=? WHERE  operator=?";
        
                            mysql.query(this.sql, vals, async (err, result)=> {
                                if (err) {
                                    ws.send(encodeURIComponent(JSON.stringify({func:q.func, msg: 'error'})));
                                }else{
                                    ws.send(encodeURIComponent(JSON.stringify({func:q.func,dep: usrs[q.dep_id]})));
                                }
                            });                        
                        }
                    }
                });

                break;

            case 'changeoper':    
         
                vals = [q.abonent?q.abonent:q.em, q.em, q.abonent?q.abonent:'', q.psw];
                this.sql = "SELECT *, (SELECT users FROM users WHERE operator=?) as users "+
                "FROM  operators as oper "+ 
                "WHERE oper.operator=?  AND abonent=? AND psw=?";

                mysql.query(this.sql, vals,  (err, result)=> {
                    if (err) {
                        ws.send(encodeURIComponent(JSON.stringify({func:q.func, msg: 'error'})));
                    }else{
                        let usrs  = [];
                        if(result[0]){
                            usrs = JSON.parse(result[0].users);                        
                            let dep = _.find(usrs, {'id':q.dep_id});    
                            let user;
                            if(q.data.role==='admin'){
                                user = dep['admin']
                            }else{
                                let ind = _.findIndex(dep.staff, {id:q.data.id});
                                user = dep.staff[ind]
                            }
                 
                            if(q.data.alias)
                                user.alias = q.data.alias; 
                            if(q.data.picture)
                                user.picture = q.data.picture;
                            if(q.data.email){
                                if(q.data.email!==user.email)
                                    this.SendEmail(q,q.data.email);  
                                user.email = q.data.email;
       
                            }
                            if(q.data.name)
                                 user.name = q.data.name;                            
                            if(q.data.desc)
                                user.desc = q.data.desc;       
                                
                            vals = [JSON.stringify(usrs),  q.em, q.abonent || q.em];
                            this.sql = "UPDATE users SET users=?, last=CURRENT_TIMESTAMP(), editor=? WHERE  operator=?";
        
                            mysql.query(this.sql, vals, async (err, result)=> {
                                if (err) {
                                    ws.send(encodeURIComponent(JSON.stringify({func:q.func, msg: 'error'})));
                                }else{
                                    ws.send(encodeURIComponent(JSON.stringify({func:q.func,dep: dep})));
                                }
                            }); 
                            
                        }                
                    }
                });

                break;
            case 'remoper':    
         
                vals = [q.abonent?q.abonent:q.em, q.em, q.abonent?q.abonent:'', q.psw];
                this.sql = "SELECT *, (SELECT users FROM users WHERE operator=?) as users "+
                "FROM  operators as oper "+ 
                "WHERE oper.operator=?  AND abonent=? AND psw=?";

                mysql.query(this.sql, vals,  (err, result)=> {
                    if (err) {
                        ws.send(encodeURIComponent(JSON.stringify({func:q.func, msg: 'error'})));
                    }else{
                        let usrs  = [];
                        if(result[0]){
                            usrs = JSON.parse(result[0].users);
                            let dep  = _.find(usrs, {'id':q.dep});    
                            let ind = _.findIndex(dep.staff, {id:q.id});
                            dep.staff.splice(ind,1);
                      
                            vals = [JSON.stringify(usrs),  q.em, q.abonent || q.em];
                            this.sql = "UPDATE users SET users=?, last=CURRENT_TIMESTAMP(), editor=? WHERE  operator=?";
        
                            mysql.query(this.sql, vals, async (err, result)=> {
                                if (err) {
                                    ws.send(encodeURIComponent(JSON.stringify({func:q.func, msg: 'error'})));
                                }else{
                                    ws.send(encodeURIComponent(JSON.stringify({func:q.func,dep: dep})));
                                }
                            });    
                        }                    
                    }
                });

                break;
  
            case 'adddep':    
           
                vals = [q.abonent?q.abonent:q.em, q.em, q.abonent?q.abonent:'', q.psw];
                this.sql = "SELECT *, (SELECT users FROM users WHERE operator=?) as users "+
                "FROM  operators as oper "+ 
                "WHERE oper.operator=?  AND abonent=? AND psw=?";
                mysql.query(this.sql, vals,  (err, result)=> {
                    if (err) {
                        ws.send(encodeURIComponent(JSON.stringify({func:q.func, msg: 'error'})));
                    }else{
                        let usrs  = [];
                        if(result[0]){
                            usrs = JSON.parse(result[0].users); 

                            usrs[q.id] =  {"id": String(q.id), "alias":"",
                                "admin": {"desc": "", "name": "", "role": "admin", "email": "", "picture": {"medium": "../assets/operator.svg"}}, 
                                "staff": []};
                            vals = [JSON.stringify(usrs),  q.em, q.abonent || q.em];
                            this.sql = "UPDATE users SET users=?, last=CURRENT_TIMESTAMP(), editor=? WHERE  operator=?";
                            mysql.query(this.sql, vals, async (err, result)=> {
                                if (err) {
                                    ws.send(encodeURIComponent(JSON.stringify({func:q.func, msg: 'error'})));
                                }else{
                                    ws.send(encodeURIComponent(JSON.stringify({func:q.func,dep: usrs[q.id] })));
                                }
                            }); 
                        }
                    }
                });
                
    
                break;

            case 'changedep':
                vals=[q.em, q.psw];
                this.sql = "SELECT users FROM operators as oper, users as usr WHERE oper.operator=usr.operator AND oper.operator=? AND oper.psw=?"
                mysql.query(this.sql, vals, async (err, result)=> {
                    if (err) {
    
                    }else{
                        if(result[0]){
                            let users = JSON.parse(result[0].users);     
                            users[q.dep.id] = q.dep;                       
                            vals = [JSON.stringify(users), q.em, q.abonent||q.em ];
                            this.sql = "UPDATE users SET users=?, last=CURRENT_TIMESTAMP(), editor=? WHERE  operator=? ";
            
                            mysql.query(this.sql, vals, async (err, result)=> {
                                if (err) {
            
                                }else{
                                    ws.send(encodeURIComponent(JSON.stringify({func:q.func,users: users})));
                                }
                            });
                        }
                    }
                }); 
                break;
            case  'remdep':

                vals=[q.em, q.psw];
                this.sql = "SELECT users FROM operators as oper, users as usr WHERE oper.operator=usr.operator AND oper.operator=? AND oper.psw=?"

                mysql.query(this.sql, vals, async (err, result)=> {
                    if (err) {
    
                    }else{
                        if(result[0]){
                            let users = JSON.parse(result[0].users);                            
                            _.remove(users, (n)=>{
                                return n.id==q.dep;
                            });
                            vals = [JSON.stringify(users), q.em, q.abonent||q.em ];
                            this.sql = "UPDATE users SET users=?, last=CURRENT_TIMESTAMP(), editor=? WHERE  operator=? ";
            
                            mysql.query(this.sql, vals, async (err, result)=> {
                                if (err) {
            
                                }else{
                                    ws.send(encodeURIComponent(JSON.stringify({func:q.func,users: users})));
                                }
                            });
                        }
                    }
                });                  
                
            break;


           case 'tarif':

                let tarif = tarifs[q.tarif];
                let users = 
                [
                    {
                        "id": "0",
                        "admin": {
                            "desc": "Admin of admins",
                            "name": "",
                            "alias":"",
                            "role": "admin",
                            "email":  q.em,
                            "picture": {
                                "medium": "../assets/operator.svg"
                            }        
                        },
                        "staff":[]
                    }
                ];

                let paid = moment().add(tarif.trial, 'days').format('YYYY-MM-DD'); 
                let start =  moment().format('YYYY-MM-DD'); 

                vals = [q.tarif, start, paid, q.em, q.psw, JSON.stringify(users)];
                
                this.sql = "call ADD_NEW_TARIF(?,?,?,?,?,?)";

                mysql.query(this.sql, vals, async (err, result)=> {
                    if (err) {

                    }else{

                    }      
                });

                ws.send(encodeURIComponent(JSON.stringify({func:q.func,msg: 'empty'})));
                break;

            case 'datach':
                this.SetParams( q, ws);
                this.HandleCall( q, ws);
                ws.send(encodeURIComponent(JSON.stringify({func:q.func,msg: 'empty'})));
                break;
        }

    }

    RemoveAbonent(q){
        global.rtcPull[q.type][q.abonent][q.em][q.uid]= _.omit(global.rtcPull[q.type][q.abonent][q.em][q.uid], q.uid);
    }

    SetParams(q, ws){
        let that = this;

        if(!global.rtcPull[q.type][q.abonent])
            global.rtcPull[q.type][q.abonent] = {};

        if(!global.rtcPull[q.type][q.abonent][q.em])
            global.rtcPull[q.type][q.abonent][q.em] = [];

        let item;
        if(q.type==='user')
            item = _.find(global.rtcPull[q.type][q.abonent][q.em],{uid:q.uid});
        else
            item = global.rtcPull[q.type][q.abonent][q.em][0];

        if(!item) {
            item = {};
            item.cand = [];
            global.rtcPull[q.type][q.abonent][q.em].push(item);
        }

        item.uid = q.uid;
        item.ws = ws;
        item.status = q.status;
        item.abonent = q.abonent;
        // item.oper_uid = q.oper_uid;
        if (q.desc)
            item.desc = q.desc;
        if (Array.isArray(q.cand)){
            q.cand.forEach((cand, index)=>{
                item.cand.push(cand);
            });
            
        }else if(q.cand)
            item.cand.push(q.cand);

        ws.onclose = function (ev) {
            if(q.type==='operator') {
                let item = _.find(global.rtcPull[q.type][q.abonent][q.em],{uid:q.uid});
                if(item)
                    item.status = 'close';
                that.BroadcastOperatorStatus(q, 'close');
                const ind = _.findIndex(global.rtcPull[q.type][q.abonent][q.em],{uid:q.uid});
                global.rtcPull[q.type][q.abonent][q.em].splice(ind,1);

            }else if(q.type="user"){
                if(global.rtcPull[q.type][q.abonent]){
                    that.SendUserStatus(q);
                    const index = _.findIndex(global.rtcPull[q.type][q.abonent][q.em],{uid:q.uid});
                    global.rtcPull[q.type][q.abonent][q.em].splice(index,1);
                }
            }
        };
    }

    BroadcastOperatorStatus(q, status){

        try {
            let queue = 0;
            if(!global.rtcPull['user'][q.abonent])
                return;
            for (let uid in global.rtcPull['user'][q.abonent][q.em]) {
                if (q.uid && global.rtcPull['user'][q.abonent][q.em][uid]) {
                    queue++;
                }
            }
            let type = (q.type === 'operator' ? 'user' : 'operator');

            let operators = {[q.em]:{}};
            for (let uid in global.rtcPull['operator'][q.abonent][q.em]) {
                operators[q.em][uid] = {
                    type: q.type,
                    abonent: q.abonent,
                    em: q.em,
                    uid: q.uid,
                    status: global.rtcPull['operator'][q.abonent][q.em][uid].status,
                    queue: queue
                }
            }

            for (let em in global.rtcPull[type][q.abonent]) {
                if(em!==q.em)//not to send to yourself
                    continue;
                for (let uid in global.rtcPull[type][q.abonent][em]) {
                    let item = global.rtcPull[type][q.abonent][em][uid];
                    let offer = _.find(operators[q.em],{status:'offer'});
                    if (offer
                        // && item.abonent === q.em
                        && item.uid !== q.uid) {
                        if(item.status==='wait') {
                            let oper = _.find(global.rtcPull['operator'][q.abonent][q.em], {uid: q.uid});
                            let remAr = {
                                func:q.func,
                                abonent: q.abonent,
                                oper_uid: q.uid,
                                desc: oper.desc,
                                cand: oper.cand
                            }
                            item.ws.send(encodeURIComponent(JSON.stringify(remAr)));
                        }else {
                            item.ws.send(encodeURIComponent(JSON.stringify({func:q.func, operators: operators})));
                        }

                    }else {
                        item.ws.send(encodeURIComponent(JSON.stringify({func:q.func, operators: operators})));
                    }
                }
            }

            operators = '';
        }catch(ex){
            console.log(ex)
        }
    }

    SendOperatorStatus(q){
        if (global.rtcPull['operator'] && global.rtcPull['operator'][q.abonent]
            && global.rtcPull['operator'][q.abonent][q.em]){

            for(let uid in global.rtcPull['operator'][q.abonent][q.em]){
                if(global.rtcPull['operator'][q.abonent][q.em][uid].status==='offer') {
                    let operator = {
                        abonent: q.abonent,
                        em: q.em,
                        uid:uid,
                        status: global.rtcPull['operator'][q.abonent][q.em][uid].status,
                        desc:global.rtcPull['operator'][q.abonent][q.em][uid].desc,
                        cand:global.rtcPull['operator'][q.abonent][q.em][uid].cand
                    }

                    if (q.type === 'user') {
                        let item = _.find(global.rtcPull['user'][q.abonent][q.em],{uid:q.uid})
                        item.ws.send(encodeURIComponent(JSON.stringify({operator: operator})));
                    }
                }
            }
        }
    }

    SendUserStatus(q){
        let item = _.find(global.rtcPull[q.type][q.abonent][q.em],{uid:q.uid});
        let user = {
            func:'mute',
            uid:q.abonent,
            abonent:q.abonent
        };
        if(global.rtcPull['operator'][q.abonent]) {
            let oper = _.find(global.rtcPull['operator'][q.abonent][q.abonent], {uid: q.oper_uid});
            if (oper)
                oper.ws.send(encodeURIComponent(JSON.stringify(user)));
        }
    }


    HandleCall( q){
        if(q.type === 'user'){
            if(q.desc || q.cand){
                let remAr = {
                    "desc": q.desc,
                    "cand": q.cand,
                    "abonent": q.abonent,
                    // "abonent": q.em
                }
                let item = _.find(global.rtcPull['operator'][q.abonent][q.em],{uid:q.oper_uid});
                if(item)
                    item.ws.send(encodeURIComponent(JSON.stringify(remAr)));

            }else{
                let item = _.find(global.rtcPull['user'][q.abonent][q.em],{uid:q.uid})
                if (item) {

                    let oper_check = _.find(global.rtcPull['operator'][q.abonent][q.em],{status:'check'});
                    let oper_offer = _.find(global.rtcPull['operator'][q.abonent][q.em],{status:'offer'});

                    if(oper_offer && oper_offer.ws.readyState === 1) {
                        const remAr = {
                            func:q.func,
                            abonent: q.abonent,
                            oper_uid: oper_offer.uid,
                            desc: oper_offer.desc,
                            cand: oper_offer.cand
                        }
                        item.ws.send(encodeURIComponent(JSON.stringify(remAr)));
                        //console.log('after HandleCall:user '+JSON.stringify(remAr));
                    }else{
                        item.status='wait';
                        const remAr = {
                            func:q.func,
                            abonent: q.abonent,
                            status:'wait'
                        }
                        item.ws.send(encodeURIComponent(JSON.stringify(remAr)));

                        if(oper_check  && oper_check.ws.readyState === 1){
                            const remAr = {
                                func:q.func,
                                abonent: q.abonent,
                                user_uid: item.uid,
                                status:'wait'
                            }
                            oper_check.ws.send(encodeURIComponent(JSON.stringify(remAr)));
                        }
                    }
                }
            }
        }
    }

    SendEmail(q, new_email){
        let em = new Email();
        const abonent = q.abonent?"&abonent="+q.abonent:'';
        const mail = (q.send_mail || new_email);
        const hash = this.getHash(mail);
        let text = {ru:"<h1>Присоединиться к сети</h1></a>",en:"<h1>Join network</h1></a>",fr:"<h1>Rejoindre le réseau</h1></a>"}[q.lang];
        let html = "<div><a href='http://localhost:5000/kolmit/site/operator.html?operator="+ (q.send_mail || new_email)+abonent+"&hash="+hash+"'>"+text+"</a></div>";

        em.SendMail("nedol@narod.ru", (q.send_mail || new_email), {
                ru:"Новый оператор сети Колми",
                en:"New Kolmi network operator",
                fr:"Le nouvel opérateur de Kolmi"}[q.lang],
            html,
            (result)=> {
                console.log();
            });
    }

    getHash(par){
        return md5((par+par));
    }

}