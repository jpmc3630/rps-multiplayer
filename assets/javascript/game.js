  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyC3B-cvfyULAA7Jmt2A-1xy6ooYvcPbaEk",
    authDomain: "rps-multiplayer-26ddc.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-26ddc.firebaseio.com",
    projectId: "rps-multiplayer-26ddc",
    storageBucket: "rps-multiplayer-26ddc.appspot.com",
    messagingSenderId: "760105777171",
    appId: "1:760105777171:web:7ac972cb5408a6689627e6",
    measurementId: "G-3TNJ21W323"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
  var database = firebase.database();
  
  let myKey;
  let gameKey;
  let imHosting;
  let playerInfo = {};

  let nickname;
  let nickcolor;
  
  let targetMove = `none`;
  let hostMove = `none`;
  let hostScore = 0;
  let targetScore = 0;


$('document').ready(function() {
    $('#nickname-text').select();
});

$('#join-chat-button').on("click", function() {
    event.preventDefault();


    $('.nickname-card').css('display', 'none')
    $('.chat-card').css('display', 'block')

    nickname = $('#nickname-text').val().trim();
    nickcolor = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
    
    if (nickname == "") {
        nickname = "Anonymous" + (Math.floor(Math.random() * 1000) + 1);
    }

        $('#message-text').select();

        database.ref('users').push(
            {
                nickname : nickname,
                nickcolor : nickcolor,
                created : moment().format('HH:mm:ss'),
                last : moment().format('HH:mm:ss')
            });


        database.ref('chat').push({
            time: moment().format('HH:mm:ss'),
            color: nickcolor,
            nickname: nickname,
            message: ` has joined the lobby.`,
            type: `message`
            });
       
        
        // sets up the pinger to update FB with current time
        // pinger = setInterval(function() {
        //     console.log('timer runs');
        //         database.ref('users/' + myKey).update({
        //            last: moment().format('HH:mm:ss')
        //         })           
        //     }, 60000);


});
  
// on close
window.addEventListener('beforeunload', function (e) {
    // remove myself as user
    database.ref('users/' + myKey).remove();
    // send departing message to chat room
    database.ref('chat').push({
        time: moment().format('HH:mm:ss'),
        color: nickcolor,
        nickname: nickname,
        message: ` has left the lobby.`,
        type: `message`
        });
});



// listen for new users
database.ref('users').on("child_added", function(childSnapshot) {
    //prepare the USER to be added to the list
    let userToAppend = $('<option>');
    userToAppend.attr('id', childSnapshot.ref.key);
    userToAppend.attr('value', childSnapshot.val().nickname);
    userToAppend.css('color', childSnapshot.val().nickcolor);
    userToAppend.attr('data-color', childSnapshot.val().nickcolor);
    if (childSnapshot.val().nickname == nickname) {
        // grab myKey when it comes past and add bold to MY name
        myKey = childSnapshot.ref.key;
        userToAppend.css('font-weight', 'bold')
        }
    
    // append append
    $(userToAppend).append(childSnapshot.val().nickname);
    $('#users-list').append(userToAppend);
});

database.ref('users').on("child_removed", function(childSnapshot) {
    // when a user is removed from database, remove them from the list
    $(`#${childSnapshot.ref.key}`).remove();
});


// listen for new messages
database.ref('chat').on("child_added", function(childSnapshot) {
    
    // if type is a message, display it in the chat window
    if (childSnapshot.val().type == `message`) {
        $('#chat-text').append(
            `${childSnapshot.val().time} <font color="${childSnapshot.val().color}">${childSnapshot.val().nickname}</font> ${childSnapshot.val().message}<br>`
            );
    }


    // scrolls chat div down to new message
    $('#chat-text').animate({scrollTop: $('#chat-text').prop("scrollHeight")}, 0);
    
    // if the new message is mine, remove it
    if (childSnapshot.val().nickname == nickname) {
        database.ref('chat').child(childSnapshot.ref.key).remove();
    }
});

// send new message button
$('#message-button').on("click", function(event) {
    event.preventDefault() 

    // push message object to chat node in database
    database.ref('chat').push({
    time: moment().format('HH:mm:ss'),
    color: nickcolor,
    nickname: nickname,
    message: $('#message-text').val(),
    type: `message`
    });

    //update user's last activity
    database.ref('users/' + myKey).update({
        last: moment().format('HH:mm:ss')
     })   

     // set selection back to the message input field
    $('#message-text').val('');
    $('#message-text').select();
});

$('#game-button').on("click", function(event) {

    $('.game-card').css('display', 'block');
    $('#game-button').css('display', 'none');
});

$('#rps-quit-button').on("click", function(event) {


    database.ref('games/' + gameKey).remove();
    $('#game-button').css('display', 'block');
});

$('#rps-button').on("click", function(event) {

    let opponentKey = $('#users-list option:selected').attr('id');
    let opponentNickname = $('#users-list option:selected').val();
    let opponentColor = $('#users-list option:selected').attr('data-color');

    if (opponentKey == undefined) {
        $('.game-display').html(``);
        $('.game-display').append(`<br>Please choose an opponent first!`);
        
    } else {
        initiateGame(opponentKey, opponentNickname, opponentColor);
    }
});

function initiateGame(opponentKey, opponentNickname, opponentColor) {

    $('.game-card').css('display', 'none');
    $('.rps-card').css('display', 'block');
    $('#rps-content').append(`Waiting for <font color="${opponentColor}">${opponentNickname}</font> to accept game!`)

    database.ref('games').push({
        time: moment().format('HH:mm:ss'),
        hostColor: nickcolor,
        hostNickname: nickname,
        hostKey: myKey,
        game: `rps`,
        status: `invite`,
        target: opponentKey,
        targetNickname: opponentNickname,
        targetColor: opponentColor,
        hostMove: `none`,
        targetMove: `none`

        });

}

database.ref('games').on("child_added", function(childSnapshot) {
    playerInfo = childSnapshot.val();

    if (childSnapshot.val().target == myKey && childSnapshot.val().status == `invite`) {
        $('#game-button').css('display', 'none');
        imHosting = false;
        gameKey = childSnapshot.ref.key;
        $('.rps-card').css('display', 'block');
        $('#rps-content').append(
            `<font color="${childSnapshot.val().hostColor}">${childSnapshot.val().hostNickname}</font> has challenged you to a game of Rock Paper Scissors!<br><br>
            <button class="btn btn-sm btn-dark" onClick="acceptGame()">Accept</button>
            <button class="btn btn-sm btn-dark" onClick="declineGame()">Decline</button>
            `);
        RPS();
    } else if (childSnapshot.val().hostKey == myKey) {
        gameKey = childSnapshot.ref.key;
        imHosting = true;
        RPS();
    }

});


function acceptGame() {
    database.ref('games/' + gameKey).update({
        time: moment().format('HH:mm:ss'),
        status: `connected`
     })  


        database.ref('chat').push({
            time: moment().format('HH:mm:ss'),
            color: nickcolor,
            nickname: nickname,
            message: `and <font color="${playerInfo.hostColor}">${playerInfo.hostNickname}</font> are playing Rock Paper Scissors!`,
            type: `message`
            });


            
}

function declineGame() {
     database.ref('games/' + gameKey).remove();
     
}


database.ref('games').on("child_removed", function(childSnapshot) {

    if (childSnapshot.ref.key == gameKey) {
        $('#rps-content').html(``);
        $('.rps-card').css('display', 'none');
        $('#game-button').css('display', 'block');
        
        if (imHosting) {
            database.ref('chat').push({
                time: moment().format('HH:mm:ss'),
                color: nickcolor,
                nickname: nickname,
                message: `and <font color="${playerInfo.targetColor}">${playerInfo.targetNickname}</font> have finished playing RPS. Final score: <font color="${nickcolor}">${nickname}</font>: ${hostScore} - <font color="${playerInfo.targetColor}">${playerInfo.targetNickname}</font>: ${targetScore}`,
                type: `message`
                });
        }

        targetMove = `none`;
        hostMove = `none`;
        hostScore = 0;
        targetScore = 0;

    }
    
});

function RPS() {

    database.ref('games/' + gameKey).on("child_changed", function(snapshot) {
        if (snapshot.val() == "connected") {
            $('#rps-content').html(``);
            $('#rps-content').html(`Make your selection!<br><br>
            <button class="btn btn-sm btn-dark" onClick="myPick('rock')">Rock</button>
            <button class="btn btn-sm btn-dark" onClick="myPick('paper')">Paper</button>
            <button class="btn btn-sm btn-dark" onClick="myPick('scissors')">Scissors</button>
            `);
            
        } 

        if (snapshot.ref.key == `targetMove`) {
            targetMove = snapshot.val();
        }
    
        if (snapshot.ref.key == `hostMove`) {
            hostMove = snapshot.val();
        }

        if (hostMove != `none` && targetMove != `none`) {

                let winner;
                let outcomeDisplay;
                let msgResult;
                if (hostMove == "rock") {
                            if (targetMove == "rock") {
                              winner = 'draw';
                            } else if (targetMove == "paper") {
                              winner = 'target';
                            } else if (targetMove == "scissors") {
                              winner = 'host';
                            }
                  }
    
                    if (hostMove == "paper") {
                            if (targetMove == "rock") {
                              winner = 'host';
                            } else if (targetMove == "paper") {
                              winner = 'draw';
                            } else if (targetMove == "scissors") {
                              winner = 'target';
                            }
                    }

                      if (hostMove == "scissors") {
                            if (targetMove == "rock") {
                              winner = 'target';
                            } else if (targetMove == "paper") {
                              winner = 'host';
                            } else if (targetMove == "scissors") {
                              winner = 'draw';
                            }
                      }

                      if (winner == 'draw') {
                        outcomeDisplay = 'It is a draw';

                        if (imHosting) {

                            database.ref('chat').push({
                                time: moment().format('HH:mm:ss'),
                                color: nickcolor,
                                nickname: nickname,
                                message: `(${hostScore}) drew a game with <font color="${playerInfo.targetColor}">${playerInfo.targetNickname}</font> (${targetScore})`,
                                type: `message`
                                });

                        }

                      } else if (winner == 'host') {
                        hostScore++;
                            if (imHosting) {
                                outcomeDisplay = 'You win!';

                                database.ref('chat').push({
                                    time: moment().format('HH:mm:ss'),
                                    color: nickcolor,
                                    nickname: nickname,
                                    message: `(${hostScore}) beat <font color="${playerInfo.targetColor}">${playerInfo.targetNickname}</font> (${targetScore})`,
                                    type: `message`
                                    });

                            } else {
                                outcomeDisplay = 'You Lose!';
                            }                                          

                      } else if (winner == 'target') {
                        targetScore++;
                            if (imHosting) {
                                outcomeDisplay = 'You Lose!';
                            } else {
                                outcomeDisplay = 'You win!';

                                database.ref('chat').push({
                                    time: moment().format('HH:mm:ss'),
                                    color: nickcolor,
                                    nickname: nickname,
                                    message: `(${targetScore}) beat <font color="${playerInfo.hostColor}">${playerInfo.hostNickname} </font>(${hostScore})`,
                                    type: `message`
                                    });

                            }                             
                      }

                      $('#rps-content').html(``);

                      $('#rps-content').html(`
                            <font color="${playerInfo.hostColor}">${playerInfo.hostNickname}</font>: ${hostMove}<br>
                            <font color="${playerInfo.targetColor}">${playerInfo.targetNickname}</font>: ${targetMove}<br><br>
                            ${outcomeDisplay}<br><br>
                            <font color="${playerInfo.hostColor}">${playerInfo.hostNickname}</font>: ${hostScore}<br>
                            <font color="${playerInfo.targetColor}">${playerInfo.targetNickname}</font>: ${targetScore}<br><br>
                            <button class="btn btn-sm btn-dark" onClick="newGame()">New Game</button>
                            
                      `);

                      targetMove = `none`;
                      hostMove = `none`;

                      database.ref('games/' + gameKey).update({
                        time: moment().format('HH:mm:ss'),
                        status: `gameover`
                     })  


        }
        console.log(snapshot.val());
    });
}

function newGame() {
    targetMove = `none`;
    hostMove = `none`;
    console.log('new game');

     database.ref('games/' + gameKey).update({
        time: moment().format('HH:mm:ss'),
        status: `connected`,
        hostMove: `none`,
        targetMove: `none`
     })  
     RPS();
}

function myPick(move) {

    $('#rps-content').append(`<br><br>Waiting for opponent...`);

    if (imHosting) {
        database.ref('games/' + gameKey).update({
            hostMove: move
         })  
    }

    if (!imHosting) {
        database.ref('games/' + gameKey).update({
            targetMove: move
         })  
    }
}