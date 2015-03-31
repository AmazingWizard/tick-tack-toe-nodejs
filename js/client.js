$(document).ready(function(){

    var ws = new WebSocket('ws://localhost:8675', 'echo-protocol');

    function updateScroll(){
        var element = document.getElementById("chatlog");
        element.scrollTop = element.scrollHeight;
    }
    function sendMessage(type, data){
        var msg = JSON.stringify({
            'type': type,
            'data': data
            });
        ws.send(msg);
    }

    function sendChatMessage(){
        var msg = {
            'message': $('#chatbox').val()
        };
        if ( $('#chatbox').val() !== '' ) {
            sendMessage('chat', msg);
            $('#chatbox').val('');
        }
    }

    $(document).keypress(function(e){
        if(e.which == 13 && !$('.chat').hasClass('hide') ){
            sendChatMessage();
        }
    });
    $('#submitUN').click(function(){
        var username = {
            'un': $('#username').val()
        };
        sendMessage('username', username);
    });

    $('#chat').click(function(){
        sendChatMessage();
    });
    // ----------------------- ----------
    // Event listener for server messages.
    // ---------------------------------
    ws.addEventListener('message', function(message){
        console.log(message);
        try {
             msg = JSON.parse(message.data);
         } catch (e) {
             console.log('This doesn\'t look like a valid JSON: ', message.data);
             return;
         }

        if (msg.type === 'error') {
            error(msg.data.error);
        }
        if (msg.type === 'chat'){
            $('.history').append('<p><strong style=\"color: ' + msg.data.color + ';\">' + msg.data.username + ': </strong>' + msg.data.message);
            updateScroll();
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
                console.log('Gamestate: '+ msg.data.gamestate);
                $('.readyUp').addClass('hide');
                $('.tic-tac-toe').removeClass('hide');
                $('.chat').removeClass('hide');
                sendMessage('coinflip','');

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
