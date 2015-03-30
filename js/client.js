$(document).ready(function(){

    var ws = new WebSocket('ws://localhost:8675', 'echo-protocol');
    function sendMessage(type, data){
        var msg = JSON.stringify({
            'type': type,
            'data': data
            });
        ws.send(msg);
    }
    $('#submitUN').click(function(){
        var username = {
            'un': $('#username').val()
        };
        sendMessage('username', username);
    });
    // ----------------------- ----------
    // Event listener for server messages.
    // ---------------------------------
    ws.addEventListener('message', function(message){
        try {
             msg = JSON.parse(message.data);
         } catch (e) {
             console.log('This doesn\'t look like a valid JSON: ', message.data);
             return;
         }

        if (msg.type === 'error') {
            error(msg.data.error);
        }
        if (msg.type === 'gamestate') {
            if (msg.data.gamestate === 'fullgame') {
                // log the game state
                console.log('Gamestate: ' + msg.data.gamestate);
                // hide pregame window because game is full
                $('.pregame').addClass('hide');
                // show game is full message
                $('.gamefull').removeClass('hide');
            }
            if (msg.data.gamestate === 'pregame') {
                // log the game state
                console.log('Gamestate: '+ msg.data.gamestate);
                // Show the username entry field
                $('.pregame').removeClass('hide');
                // hide the game board and chat box
                $('.tic-tac-toe, .chat').addClass('hide');
            }
            if (msg.data.gamestate === 'readyup') {
                console.log('Gamestate: '+ msg.data.gamestate);
                $('.pregame').addClass('hide');
                $('.error').addClass('hide');
                $('.readyUp').removeClass('hide');
                console.log('checking status!');
                sendMessage('readyStatus','');
            }
            if (msg.data.gamestate === 'playgame') {
                $('.readyUp').addClass('hide');
                $('.tic-tac-toe').removeClass('hide');
                $('.chat').removeClass('hide');

            }
        }
        if (msg.type === 'waiting') {
            console.log('waiting...');
            if (msg.data === true) {
                var time = 30000000;
                while (time > 0) {
                    time = time - 1;
                }
                if (time === 0) {
                    sendMessage('readyStatus','');
                }
            }
        }

    });

    // ---------------------------------
    // UI Functionality
    // ---------------------------------

});

function error(msg){
    // var username = $('#username').val();
    // var validName = new RegExp ('[a-zA-Z][a-zA-Z0-9.\-_]{2,31}');
        $('.error').removeClass('hide');
        $('.error').html('<p><strong>Error: </strong>' + msg + '</p>');
}

function sendMessage(msgType, jsonData){
    //send Messages to clients.
    //acceptable types are; gameState and chat
    var msg = JSON.stringify({type: msgType, data: jsonData});
    console.log(msg);
    ws.send(msg);
}
