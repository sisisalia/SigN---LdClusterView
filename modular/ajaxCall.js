ip_address = '192.168.56.101';
port = '9001';

function ajaxCall(url){
    $.ajax({
        'async' : false,
        'url' : 'http://' + ip_address + ':' + port + url,
        'dataType' : 'json',
        'success' : function(data){
            ajax_result = data;
        }
    });
    return ajax_result;
}
