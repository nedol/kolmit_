'use strict'
export {Import};


class Import{

    constructor(){
        this.reader;
        this.Init();
    }
    Init(){
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            // Great success! All the File APIs are supported.
        } else {
            alert('The File APIs are not fully supported in this browser.');
        }

        $('body').on('dragover', this.handleDragOver);
        $('body').on('drop', this.handleFileSelect);
    }

    handleFileSelect(evt, files, el, cb) {
        evt.stopPropagation();
        evt.preventDefault();

        this.reader = new FileReader();

        if(!files && evt.originalEvent.dataTransfer)
            files = evt.originalEvent.dataTransfer.files; // FileList object.
        // files is a FileList of File objects. List some properties.
        for (let i = 0, f; f = files[i]; i++) {
            console.log('handleFileSelect:'+f.type);
            switch (f.type) {
                case "audio/mp3": case "audio/amr": case "audio/wav":  case "video/mp4": case "ogg":

                this.LoadFile(f, function (obj) {
                    cb(obj, el);
                });
                break;
                case "image/jpeg":   case "image/jpg":
                case "image/png":
                case "image/gif":
                    this.LoadImage(f, function (obj) {
                        if(!obj)
                            return null;
                        cb(obj, el);
                    });
                    break;
            }
        }
    }


    LoadImage(f, callback){

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

                callback(img.toDataURL(f.type));

            },
            {
                orientation:true,
                canvas:true
                //maxWidth: 600,
                //maxHeight: 300
            }// Options
        );

    }
    LoadFile(f, callback) {

        this.reader.onerror = errorHandler;
        this.reader.onabort = function(e) {
            alert('File read cancelled');
        };
        this.reader.onload = (function (f) {
            return function (e) {
                console.log("data:" );
                HandleResults(this.reader.result);
            }
        })(f);

        this.reader.readAsDataURL(f);
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

            }

            //let obj_id = GetObjId(coor[1],coor[0]);
            // let hash = MD5(obj_id);
            // img_db.setFile({id:hash,data:data});


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

        }
    }
    LoadThmb(f, options, callback){

        loadImage(
            f,
            function (thmb) {
                let logo_data = thmb.toDataURL("image/jpeg");
                callback(logo_data);
            },
            options
        );
    }

    handleDragStart(evt) {
        evt.stopPropagation();
        evt.preventDefault();
    }

    handleDragLeave(evt) {
        evt.stopPropagation();
        evt.preventDefault();
    }

    handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.originalEvent.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }
}