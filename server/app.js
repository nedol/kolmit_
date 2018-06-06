const server= require('./server')
const qs = require('querystring');
const url = require('url');

const express = require('express');
const app = require("express")();

app.get('/', function (req, res) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    var q = url.parse(req.url, true).query;
    server.HandleRequest(req, q, res)
})

app.get("/update_reserve", (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    let data = JSON.stringify(server.GetReserveData());
    res.writeHead(200,{'Content-Type': 'text/event-stream'});
    console.log(data);
    res.end('data: ' + data + '\n\n');
    setTimeout(function () {
        server.SetReserveData(undefined);
    },1500);

});

app.get("/update_order", (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    let upd = JSON.stringify(server.GetOrderUpd());
    res.writeHead(200,{'Content-Type': 'text/event-stream'});
    console.log(upd);
    res.end('data: ' + upd + '\n\n');
    setTimeout(function () {
        server.SetOrderUpd(undefined);
    },1500);

});

// POST method route
app.post('/', function (req, res) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    processPost(req, res, function (req,res) {
        var q = url.parse(req.url, true).query;
        server.HandleRequest(req, req.post, res);
    });
})

app.listen(8081, () =>
    server.GetTokenLoop(server)
)

server.startConnection();

function processPost(request, response, callback) {
    var queryData = "";
    if(typeof callback !== 'function') return null;

    if(request.method == 'POST') {
        request.on('data', function(data) {
            queryData += data;
            if(queryData.length > 1e9) {//LIMIT!
                queryData = "";
            }
        });

        request.on('end', function() {
            request.post = qs.parse(queryData);
            callback(request,response);
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}

