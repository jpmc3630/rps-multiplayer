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

  let nickname;
  let nickcolor;
//   let pinger;
  let terminator;

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
        nickname = "Anonymous";
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
  
window.addEventListener('beforeunload', function (e) {
    database.ref('users/' + myKey).remove();

});



// listen for new users
database.ref('users').on("child_added", function(childSnapshot) {
    //prepare the USER to be added to the list
    let userToAppend = $('<option>');
    userToAppend.attr('id', childSnapshot.ref.key);
    userToAppend.attr('value', childSnapshot.val().nickname);
    userToAppend.css('color', childSnapshot.val().nickcolor);
    
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
        console.log('it is our message')
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