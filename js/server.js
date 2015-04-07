// Tic Tac Toe Server
// Handles all game logic and chat requests
// by Tom Pomeroy http://www.pome.ro

//----------------------------------------------
// Server Functions
//----------------------------------------------

function serverLog(msg){
    console.log((new Date()) + ' ' + msg );
}

// Our Wind Condition solver. This function iterates over all the player choices made, and compaires them to a list of known.
// solutions listed below. If it finds a match it reutrns True, if it doesn't it returns False.

function winCondition(list,picked){
    var isGameOver = false;
    serverLog('Calculating Game Victory...');
	solutions.forEach(function(list,listIndex){
		if(isGameOver === false){
			list.forEach(function(solution,solutionIndex){
				var matches = 0;
				if(matches < 3){
					solution.forEach(function(pair,pairIndex){
						picked.forEach(function(choice,choiceIndex){
							if(choice[0] == pair [0] && choice[1] == pair[1]){
								matches++;
								if(matches >= 3){
									isGameOver = true;
								}
							}
						});
					});
				}
			});
		}
	});
	if(isGameOver){
		return true;
	} else {
		return false;
	}
}

// Our Draw Game funtion. This function first checks to make sure the game is not over by running a WinCondition() on each character and storing the results.
// It then iterates over the Grid to see how many plays have been made. Since a draw can only happen if neither the WinCon is met and the board is full
// it will return True if all those are true. If not it reutrns False.

function isDraw(grid){
    serverLog('Calculating Draw...');
    var p1GameOverCheck = winCondition(solutions,players.player1.picked);
    var p2GameOverCheck = winCondition(solutions,players.player2.picked);
    var choices = 0;
    grid.forEach(function(row,rowIndex){
        row.forEach(function(col,colIndex){
            serverLog('checking [' + rowIndex + ',' + colIndex + ']: ' + col);
            if(col !== ''){
                choices++;
            }
        });
    });

    if(choices >= 9 && p1GameOverCheck === false && p2GameOverCheck === false){
        return true;
    } else {
        return false;

    }
}

// The big dumb turn funtion. Taking turns ended up being a huge list of things that needed to happen for both players.
// Initially I had this written out twice... for each player. Once it got to big I made it genaric and converted it to a funtion.
// This triggers when a choice is sent to the server.

function turn(connection,selection){
    //whos turn is it
    var currTurn = '';
    var nextTurn = '';

    // find out who sent the choice, and then set the approprate current player and next player.
    if (connection === players.player1.connection) {
        currTurn = players.player1;
        currTurn.symble = 'X';
        nextTurn = players.player2;

    } else if (connection === players.player2.connection) {
        currTurn = players.player2;
        currTurn.symble = 'O';
        nextTurn = players.player1;
    }

    // make sure that the grid selection isn't already taken.
    if(grid[selection[0]][selection[1]] === ''){
        // push the selection to the current players list of selections.
        currTurn.picked.push(selection);
        // place the player symble (X or O) in the grid.
        grid[selection[0]][selection[1]] = currTurn.symble;
        // Check to see if the game has ended as a result of this new selection.
        serverLog('Check for Game Over');
        var gameOverCheck = winCondition(solutions,currTurn.picked);
        if(gameOverCheck){
            //If the game is over send a message to both players.
            sendMessage(currTurn.connection,'grid',grid);
            sendMessage(nextTurn.connection,'grid',grid);
            serverLog(currTurn.username + ' Wins the game!');
            gameOver.winner = currTurn.username;
            gameOver.loser = nextTurn.username;
            sendMessage(currTurn.connection,'gamestate',gameOver);
            sendMessage(nextTurn.connection,'gamestate',gameOver);
            clearGameBoard();
        }
        //Check to see if the game is a draw.
        serverLog('Check for Draw');
        var draw = isDraw(grid);
         if(draw === false){
             // if the game does not end in a draw, send turn information to the players
             // and continue playing.
            var chatMSG = 'it is ' + nextTurn.username + '\'s turn!';

            sendMessage(nextTurn.connection,'turn',true);
            sendMessage(currTurn.connection,'turn',false);

            sendMessage(currTurn.connection,'grid',grid);
            sendMessage(nextTurn.connection,'grid',grid);

            chatMessage(chatMSG,'gray','SYSTEM','all');
        } else {
            // if not then send a Draw message.
            sendMessage(currTurn.connection,'grid',grid);
            sendMessage(nextTurn.connection,'grid',grid);
            serverLog('its a Draw!!');
        }
    }
}
// Reset the game after it is won.
function clearGameBoard() {
    grid = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];
    players ={
        'player1':{
            'picked':[]
        },
        'player2':{
            'picked':[]
        }
    };
    gameOver = {
        'gamestate': 'postgame',
        'winner': '',
        'loser': ''
    };
}
// Funtion to strip out HTML characters
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// quick funtion to flip a coin.
function coinFlip() {
    return Math.floor(Math.random() * 2);
}

// Chat handler function for chat messages.
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
        sendMessage(user,'chat',data);
    }
}


// Function for sending data to the clients.
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
// make it look cool! Why not... I gotta stare at this thing a whole lot...
server.listen(8675, function() {
    console.log((new Date()) + 'Server is listening on port 8675');
    console.log('');
    console.log(' _______       ______           ______        ');
    console.log('/_  __(_)___  /_  __/__ _____  /_  __/__  ___ ');
    console.log(' / / / / __/   / / / _ `/ __/   / / / _ \\/ -_)');
    console.log('/_/ /_/\\__/   /_/  \\_,_/\\__/   /_/  \\___/\\__/ ');
    console.log('');
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
var grid = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];

// Win Conditions!
var vert = [
		[[0,0],[0,1],[0,2]],
		[[1,0],[1,1],[2,1]],
		[[2,0],[2,1],[2,2]]
	];
var hor = [
		[[0,0],[1,0],[2,0]],
		[[0,1],[1,1],[2,1]],
		[[0,2],[1,2],[2,2]]
	];
var diag = [
		[[0,0],[1,1],[2,2]],
		[[2,0],[1,1],[0,2]]
	];
var solutions = [vert,hor,diag];


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
var gameOver = {
    'gamestate': 'postgame',
    'winner': '',
    'loser': ''
};

// our lovely players!
var players ={
    'player1':{
        'picked':[]
    },
    'player2':{
        'picked':[]
    }
};

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
        serverLog('connection accepted [' + id + ']');
    } else {
        // If there are two players, game is full, display error kill connection.
        // send game state "fullGame" to client. This resets the UI.
        serverLog('Game Full!');
        sendMessage(connection, 'gamestate', fullGame);
        connection.close('gamefull');
    }




    // ---------------------------------
    // Wait for messages to be recieved.
    // ---------------------------------
    connection.on('message', function(message) {
        // do some JSON validation to make sure were getting clean data.
        try {
            msg = JSON.parse(message.utf8Data);
        } catch (e) {
            serverLog('This doesn\'t look like a valid JSON: ', message.utf8Data, e);
            return;
        }

        //Handle grid selections.
        if (msg.type === 'gridchoice') {
            var selection = [];
            selection[0] = msg.data.slice(4,-2);
            selection[1] = msg.data.slice(6);
            turn(connection,selection);
        }
        //Handle chat messages.
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
                // runs the name through our HTML scrubing function for good mesure.
                var userName = htmlEntities(msg.data.un);
                // asign the username to the correct player.
                if (players.player1.connection === connection) {
                    players.player1.username = userName;
                    players.player1.ready = 1;
                    serverLog('Player 1\'s username is: ' + players.player1.username + ' Status is: ' + players.player1.ready);
                    sendMessage(connection, 'gamestate', readyUp);
                }
                if (players.player2.connection === connection) {
                    players.player2.username = userName;
                    players.player2.ready = 1;
                    serverLog('Player 2\'s username is: ' + players.player2.username + ' Status is: ' + players.player2.ready);
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
                sendMessage(players.player1.connection,'gamestate',playGame);
                sendMessage(players.player2.connection,'gamestate',playGame);
                var coin = coinFlip();
                if (coin === 1) {
                    var p1 = players.player1.username + ' has one the coin flip and will go first!';
                    chatMessage(p1,'gray','SYSTEM','all');

                    sendMessage(players.player1.connection,'turn',true);
                } else {
                    var p2 = players.player2.username + ' has one the coin flip and will go first!';
                    chatMessage(p2,'gray','SYSTEM','all');
                    sendMessage(players.player2.connection,'turn',true);
                }

            }
        }
    });


    // ---------------------------------
    // Handle Dissconnections
    // ---------------------------------
    connection.on('close', function(reasonCode, description) {
        if (connection === players.player1.connection) {
            serverLog('Player1 Leaving');
            delete players.player1.connection;
            players.player1.ready = 0;
        }
        if (connection === players.player2.connection) {
            serverLog('Player2 Leaving');
            delete players.player2.connection;
            players.player2.ready = 0;
        }
        if (reasonCode == 1000) {
            delete clients[id];
            serverLog('Peer ' + connection.remoteAddress + ' disconnected.');
            serverLog('Reason: ' + reasonCode + ' \"' + description + '\"');
        } else {
            delete clients[id];
            serverLog('Peer ' + connection.remoteAddress + ' disconnected.');
            serverLog('Reason: ' + reasonCode + ' \"' + description + '\"');
            count = count - 1;
        }

    });

});
