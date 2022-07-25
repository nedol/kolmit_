    

    'use strict';

    // const express = require('express')
    // const app = express()
    // const port = 3001
    
    // app.get('/', (req, res) => {
    //   res.send('Hello World!')
    // })
    
    // app.listen(port, () => {
    //   console.log(`Example app listening at http://localhost:${port}`)
    // })

    // let fs = require('fs');
    
    // fs.writeFile('users.1.json', JSON.stringify({'POST':'data'}), function (err) {
    //     if (err)
    //         return console.log(err);
    //     console.log('Wrote file, just check it');
    // });

    const server= require('./server')
    const ws = require('ws');
    // const urlencode = require('urlencode');
    const shortid = require('shortid');
    var WebSocketServer = require('ws').Server;
    var wss = new WebSocketServer({ port: 3000 });
    
    wss.on('connection', function connection(ws) {
        ws.id = shortid.generate();
        ws.on('message', function (message) {
            try {
                var q = JSON.parse(decodeURIComponent(message));
                server.HandleRequest(q, ws);
            }catch(ex){
    
            }
        });
    });