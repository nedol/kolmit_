export {InitFileImport,handleFileSelect};

let reader;


function InitFileImport() {

    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }


    // Setup the dnd listeners.
    // $("map").on('dragstart', handleDragStart);
    // $("map").on('dragleave', handleDragLeave);
    $('body').on('dragover', handleDragOver);
    $('body').on('drop', handleFileSelect);

    // let map = document.getElementById('map');
    // FileAPI.event.on(map, 'drop', function (evt/**Event*/) {
    //     evt.preventDefault();
    //     handleFileSelect(evt);
    // });

};

function handleDragStart(evt) {
    evt.stopPropagation();
    evt.preventDefault();
}

function handleDragLeave(evt) {
    evt.stopPropagation();
    evt.preventDefault();
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.originalEvent.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

function handleFileSelect(evt, files) {
    evt.stopPropagation();
    evt.preventDefault();

    reader = new FileReader();

    if(!files && evt.originalEvent.dataTransfer)
        files = evt.originalEvent.dataTransfer.files; // FileList object.
    // files is a FileList of File objects. List some properties.
    for (let i = 0, f; f = files[i]; i++) {
        console.log('handleFileSelect:'+f.type);
        switch (f.type) {
            case "audio/mp3": case "audio/amr": case "audio/wav":  case "video/mp4": case "ogg":

                LoadFile(f, function (obj) {
                    SetMarkerMap(obj);
                    AddToRecords(obj);
                    view.animate({
                            center: ol.proj.fromLonLat([obj.lon, obj.lat]),
                            duration: 1000
                        }, function () {

                        }
                    );
                });
                break;
            case "image/jpeg":   case "image/jpg":
            case "image/png":
            case "image/gif":
                LoadImage(f, function (obj) {
                    if(!obj)
                        return;

                });
                break;
        }
    }

    // FileList object.
    for (let i = 0; i < files.length; i++) {
        files[i].getAsString(function (link) {
            SetLinkMarker(link);
        });
    }

}

function LoadImage(f, callback){

    loadImage(
        f,
        function (img) {
            let or = (img.width >= img.height) ? 'l' : 'p';
            let options = [];
            options['canvas'] = true;
            options['orientation'] = true;
            if (or === 'l') {
                options['minWidth'] = 70;
                options['maxHeight'] = 50;
            } else if (or === 'p') {
                options['minHeight'] = 70;
                options['maxWidth'] = 50;
            }

            ProcessImg(img,f);

            function ProcessImg(img,f){

                let data = img.toDataURL(f.type);
                let coor = [];
                let ctype, func, cat;
                if (f.type.indexOf("image/") !== -1) {
                    ctype = '1';
                    func = 'InsertImage';
                    cat = '12'
                }
                let fAr = f.name.split('_');
                if (f.name.indexOf('id_') !== -1 && fAr[1].indexOf('.') !== -1 && fAr[2].indexOf('.') !== -1) {
                    coor[0] = parseFloat(fAr[2].split('h')[0]);
                    coor[1] = parseFloat(fAr[1]);

                } else {
                    let marker_pos = Marker.overlay.getPosition();
                    if ($('#mouse_pos_div').text().length > 6)
                        coor = JSON.parse("[" + $('#mouse_pos_div').text() + "]");
                    if(!coor[0] && !coor[1])
                        coor = ol.proj.toLonLat(Marker.overlay.getPosition());
                    if(!coor[0] && !coor[1])
                        coor = ol.proj.transform(ol_map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326');

                }

                let obj_id = GetObjId(coor[1],coor[0]);
                let hash = MD5(obj_id);
                window.db.setFile({hash:hash,data:data});

                LoadThmb(f, options, function (logo_data) {

                    let obj = {
                        category: cat,
                        id: obj_id,
                        longitude: coor[0],
                        latitude: coor[1],
                        ambit: 50,
                        status: '1',
                        logo_data: logo_data,//"./categories/images/ic_12.png",//icon
                        //scale: scale,
                        url: hash,
                        caption: f.name,
                        func: 'InsertImage'
                    };
                    if(obj.longitude && obj.latitude)
                        callback(obj);
                    else
                        callback(null);
                });

            }

        },
        {
            orientation:true,
            canvas:true
            //maxWidth: 600,
            //maxHeight: 300
        }// Options
    );

}

function LoadThmb(f, options, callback){

    loadImage(
        f,
        function (thmb) {
            let logo_data = thmb.toDataURL("image/jpeg");
            callback(logo_data);
        },
        options
    );
}

function LoadFile(f, callback) {

    reader.onerror = errorHandler;
    reader.onabort = function(e) {
        alert('File read cancelled');
    };
    reader.onload = (function (f) {
        return function (e) {
            console.log("data:" );
            HandleResults(reader.result);
        }
    })(f);

    reader.readAsDataURL(f);
    //reader.readAsBinaryString(f);
    //reader.readAsArrayBuffer(f);

    function errorHandler(evt) {
        switch(evt.target.error.code) {
            case evt.target.error.NOT_FOUND_ERR:
                alert('File Not Found!');
                break;
            case evt.target.error.NOT_READABLE_ERR:
                alert('File is not readable');
                break;
            case evt.target.error.ABORT_ERR:
                break; // noop
            default:
                alert('An error occurred reading this file.');
        };
    }

    function HandleResults(res){

            let coor = [];
            let ctype, func, cat;
            if (f.type.indexOf("audio/") !== -1) {
                ctype = '1';
                func = 'InsertAudio';
                cat = '0'
            }
            let fAr = f.name.split('_');
            if (f.name.indexOf('id_') !== -1 && fAr[1].indexOf('.') !== -1 && fAr[2].indexOf('.') !== -1) {
                coor[0] = parseFloat(fAr[2].split('h')[0]);
                coor[1] = parseFloat(fAr[1]);

            } else {
                if ($('#mouse_pos_div').text().length>6) {
                    coor = JSON.parse("[" + $('#mouse_pos_div').text() + "]");
                }else {
                    coor = ol.proj.toLonLat(Marker.overlay.getPosition());
                }
            }

            let obj_id = GetObjId(coor[1],coor[0]);
            let hash = MD5(obj_id);
            img_db.setFile({id:hash,data:data});


            let obj = {
                category: cat,
                type: ctype,
                filename: f.name,
                id: obj_id,
                longitude: coor[0],
                latitude: coor[1],
                ambit: 50,
                status: '1',
                image: "..src/categories/images/ic_0.png",//icon
                //scale: scale,
                url: hash,
                caption: f.name,
                func: func
            }

            if(musicmetadata)
                getMusicMetaData(obj,callback);
            else{
                callback(obj);
            }


    }
}


function success_photos(hash, logo_data, coor, cat,  func) {

    if (hash) {
        let obj = {
            category: cat,
            filename: f.name,
            hash: hash,//md(coor[1] + "_" + coor[0]),
            lon: coor[0],
            lat: coor[1],
            ambit: 50,
            status: '1',
            logo_data: logo_data,//"./categories/images/ic_12.png",//icon
            //scale: scale,
            url: hash,
            caption: f.name,
            func: func
        };

    }


}

function success_records(hash, src, coor, cat,  func){
    let obj = {
        category: cat,
        type: '1',
        filename: f.name,
        hash: hash,//md(coor[1] + "_" + coor[0]),
        lon: coor[0],
        lat: coor[1],
        ambit: 50,
        status: '1',
        image: "..src/categories/images/ic_0.png",//icon
        //scale: scale,
        url: hash,
        caption: f.name,
        func: func
    };

    view.animate({
            center: ol.proj.fromLonLat([coor[0], coor[1]]),
            duration: 1000
        }, function () {
        }
    );
}

