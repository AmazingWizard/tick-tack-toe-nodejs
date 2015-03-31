// Tic Tac Toe Server
// Handles all game logic and chat requests
// by Tom Pomeroy http://www.pome.ro

//----------------------------------------------
// Server Functions
//----------------------------------------------

// Funtion to strip out HTML characters

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function coinFlip() {
    return Math.floor(Math.random() * 2);
}

function chatMessage(msg,color,username,user){
    data = {
        'message': htmlEntities(msg),
        'color': color,
        'username': username,
    };
    if (user === 'all') {
        for (var i in clients) {
            sendMessage(clients[i],'chat',data);
        }
    } else {
        sendMessage(user,'chat',data)
    }
}

function sendMessage(client, msgType, jsonData) {
    //send Messages to clients.
    //acceptable types are; gameState and chat
    var msg = JSON.stringify({
        type: msgType,
        data: jsonData
    });
    client.sendUTF(msg);
}

//----------------------------------------------


// Setup basic websocket server
var http = require('http');
var server = http.createServer( function(request, response) {});

// Set up server listen function on port 8675
server.listen(8675, function() {
    console.log((new Date()) + 'Server is listening on port 8675');
    console.log('Welcome to Tic Tac Toe!');
    console.log('Waiting for players...');
});

// Set up websocket server
var WebSocketServer = require('websocket').server;
wsServer = new WebSocketServer({
    httpServer: server
});

// These variables store the clients.
var count = 0;
var clients = {};


// Create the Game Grid that Tic Tac Toe is played on.

var gameGrid = [
    [0, 1, 2],
    [0, 1, 2],
    [0, 1, 2]
];
// Game States

var preGame = {
    'gamestate': 'pregame'
};
var fullGame = {
    'gamestate': 'fullgame'
};
var readyUp = {
    'gamestate': 'readyup'
};
var playGame = {
    'gamestate': 'playgame'
};
var resetGame = {
    'gamestate': 'resetgame'
};

players ={
    'player1':{},
    'player2':{}
},

// Our main listen funtion. This will help drive the Chat and our game logic.
wsServer.on('request', function(r) {

    // ---------------------------------
    // Handle Connections
    // ---------------------------------

    var connection = r.accept('echo-protocol', r.origin);
    // Check number of players
    if (count <= 1) {
        // Accept the connection if the count is less then two
        // Create the client ID and Increment the client counter
        var id = count++;
        // Store the connection to be iterated on later.
        clients[id] = connection;

        if (players.player1.connection === undefined) {
            players.player1.connection = clients[id];
        } else if (players.player2.connection === undefined) {
            players.player2.connection = clients[id];
        }

        // Change the game state to pregame for the user
        sendMessage(clients[id], 'gamestate', preGame);
        // Log the connection on the server
        console.log((new Date()) + 'connection accepted [' + id + ']');
    } else {
        // If there are two players, game is full, display error kill connection.
        // send game state "fullGame" to client. This resets the UI.
        console.log((new Date()) + ' Game Full!');
        sendMessage(connection, 'gamestate', fullGame);
        connection.close('gamefull');
    }




    // ---------------------------------
    // Wait for messages to be recieved.
    // ---------------------------------
    connection.on('message', function(message) {
        try {
            msg = JSON.parse(message.utf8Data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.utf8Data, e);
            return;
        }
        if (msg.type === 'coinflip') {

        }
        if(msg.type === 'chat'){
            if (connection === players.player1.connection) {
                chatMessage(msg.data.message,'red',players.player1.username,'all');
            }
            if (connection === players.player2.connection) {
                chatMessage(msg.data.message,'blue',players.player2.username,'all');
            }


        }
        // When submiting your username, it has a msg type of username.
        // this event handles validating the username and storing it.
        if (msg.type === 'username') {
            // regex that validates the name.
            var validName = new RegExp('[a-zA-Z][a-zA-Z0-9.\-_]{2,31}');
            // testing if the name abides by our regex
            if (validName.test(msg.data.un)) {
                // logs the acceptance
                console.log((new Date()) + ' Username ' + htmlEntities(msg.data.un) + ' Accepted');
                // runs the name through our HTML scrubing function for good mesure.
                var userName = htmlEntities(msg.data.un);
                // asign the username to the correct player.
                if (players.player1.connection === connection) {
                    console.log('adding player 1');
                    players.player1.username = userName;
                    players.player1.ready = 1;
                    console.log('Player 1\'s username is: ' + players.player1.username + 'Status is: ' + players.player1.ready);
                    sendMessage(connection, 'gamestate', readyUp);
                }
                if (players.player2.connection === connection) {
                    console.log('adding player 2');
                    players.player2.username = userName;
                    players.player2.ready = 1;
                    console.log('Player 2\'s username is: ' + players.player2.username + 'Status is: ' + players.player2.ready);
                    sendMessage(connection, 'gamestate', readyUp);
                }

            } else {
                var errorMessage = {
                    'error': 'Please enter a valid username.'
                };
                sendMessage(connection, 'error', errorMessage);
            }
        }

        if (msg.type === 'readyStatus') {

            if (players.player1.ready && players.player2.ready == 1) {
                console.log('play game!');
                sendMessage(players.player1.connection,'gamestate',playGame);
                sendMessage(players.player2.connection,'gamestate',playGame);
                var coin = coinFlip();
                if (coin === 1) {
                    var p1 = players.player1.username + ' has one the coin flip and will go first!';
                    chatMessage(p1,'gray','SYSTEM','all');
                    players.player1.turn = true;
                    sendMessage(players.player1.connection,'turn',true);
                } else {
                    var p2 = players.player2.username + ' has one the coin flip and will go first!';
                    chatMessage(p2,'gray','SYSTEM','all');
                    sendMessage(players.player2.connection);
                }

            }
        }
    });


    // ---------------------------------
    // Handle Dissconnections
    // ---------------------------------
    connection.on('close', function(reasonCode, description) {
        if (connection === players.player1.connection) {
            console.log('Player1 Leaving');
            delete players.player1.connection;
            players.player1.ready = 0;
        }
        if (connection === players.player2.connection) {
            console.log('Player2 Leaving');
            delete players.player2.connection;
            players.player2.ready = 0;
        }
        if (reasonCode == 1000) {
            delete clients[id];
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            console.log((new Date()) + ' Reason: ' + reasonCode + ' \"' + description + '\"');
        } else {
            delete clients[id];
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            console.log((new Date()) + ' Reason: ' + reasonCode + ' \"' + description + '\"');
            count = count - 1;
        }

    });

});
