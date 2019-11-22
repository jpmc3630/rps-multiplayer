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

  let nickname;
  let nickcolor;

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
        database.ref().push(
        `${moment().format('HH:MM:SS')} <font color="${nickcolor}">${nickname}</font> has joined the lobby.
        `);

        
});
  

database.ref().on("child_added", function(childSnapshot) {
    console.log(childSnapshot.val());

    $('#chat-text').append(childSnapshot.val() + '<br>');

    $('#chat-text').animate({scrollTop: $('#chat-text').prop("scrollHeight")}, 0);
    
});


$('#message-button').on("click", function(event) {
    event.preventDefault() 


    database.ref().push(
    `${moment().format('HH:MM:SS')} <font color="${nickcolor}">${nickname}</font> ${$('#message-text').val()}
    `);

    $('#message-text').val('');
    $('#message-text').select();

});