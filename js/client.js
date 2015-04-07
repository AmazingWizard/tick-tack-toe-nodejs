$(document).ready(function(){

    var ws = new WebSocket('ws://localhost:8675', 'echo-protocol');

    var myTurn = false;

    function updateScroll(){
        var element = document.getElementById("chatlog");
        element.scrollTop = element.scrollHeight;
    }
    function reloadGame(){
        location.reload();
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

    //action that sends turn choice

        $('[class*=col-]').click(function(){
            if (myTurn === true) {
                var myChoice = $(this).attr('class');
                sendMessage('gridchoice',myChoice);
                // sendMessage('gridChoice',$(this).attr('class'));
            }
        });


    // Send chat message on enter key press
    $(document).keypress(function(e){
        if(e.which == 13 && !$('.chat').hasClass('hide') ){
            sendChatMessage();
        }
    });

    // Submit username to server
    $('#submitUN').click(function(){
        var username = {
            'un': $('#username').val()
        };
        sendMessage('username', username);
    });

    // send chat message when send button clicked
    $('#chat').click(function(){
        sendChatMessage();
    });
    // ----------------------- ----------
    // Event listener for server messages.
    // ---------------------------------
    ws.addEventListener('message', function(message){
        console.log(message.data);
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
            if (msg.data.username === 'SYSTEM') {
                $('.history').append('<p style=\"color: ' + msg.data.color + '; font-style:italic;\"><strong>' + msg.data.username + ': </strong>' + msg.data.message);
                updateScroll();
            } else {
                $('.history').append('<p><strong style=\"color: ' + msg.data.color + ';\">' + msg.data.username + ': </strong>' + msg.data.message);
                updateScroll();
            }
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
            if (msg.data.gamestate === 'postgame') {
                $('.tic-tac-toe').addClass('hide');
                $('.chat').addClass('hide');
                $('.postgame').removeClass('hide');
                if (msg.data.winner === 'draw') {
                    $('.postgame').prepend('<h1> I\'s a Draw!');
                } else {
                    $('.postgame').prepend('<h1>' + msg.data.winner + ' has won the game!');
                }

            }
        }
        if (msg.type === 'grid'){
            var grid = msg.data;
            grid.forEach(function(row, rowIndex){
                row.forEach(function(col,colIndex){
                    $('.col-' + rowIndex + '-' + colIndex).html(col);
                });
            });
        }
        if (msg.type === 'turn') {
            console.log(myTurn);
            console.log(msg.data);
            myTurn = msg.data;
            console.log(myTurn);
            if (myTurn) {
                console.log('Its My Turn');
            } else {
                console.log('Its not my turn.');
            }
        }

    });

    // ---------------------------------
    // UI Functionality
    // ---------------------------------

});

function error(msg){
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
