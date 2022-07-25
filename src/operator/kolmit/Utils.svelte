<script>
      function log (arg, that){
        var now = (Date.now() / 1000).toFixed(3);
        //console.log(now + ': ', arg);
        try{
            window.parent.document.getElementById("console").innerHTML += '<div>'+JSON.stringify(arg)+'<div/>';

            if(that) {
                // let par = {};
                // par.proj = 'rtc';
                // par.uid = that.uid;
                // par.func = 'log';
                // par.text = now + ': ' + arg;
                // par.role = that.role;
                // par.email = that.email.from;
                // that.signch.SendMessage(par, function (data) {
                //
                // });
                let logs = window.document.getElementById("logs");
                var data = logs.value;
                // $('#logs').focus().val('').val(data + '\n' + arg);
                //logs.value();
                logs.focus();
            }
        }catch(ex){

        }
    }
    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
</script>