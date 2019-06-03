

import '././scss/main.scss';
import * as name from "./modules/base.js";
import $ from "jquery";
require('./views/audio/meow.mp3');



navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
navigator.getMedia({video: true, audio: false}, function(stream){


    let vendorUrl = window.URL || window.webkitURL;


    $('.chat__videoIcon').on('click', function(){

        // create new Peer Object

        // Create Code

        // push code to database

    });

    // Wenn callRequest einen zusätzlichen Eintrag bekommt,
    // und der Eintrag an den anderen User adressiert ist
    // wandle Code um und generiere den Accept Code.
    // Finally push Code as callAccepted to database

    // Wenn callAccept einen zusätzlichen Eintrag bekommt,
    // und der Eintrag an mich selbst referenziert ist
    // wandle Code um und verbinde.

    

        // localStorage.setItem('init', 'true');
        
       var Peer = require('simple-peer');
       var peer = new Peer({
       initiator: localStorage.getItem('init') === 'true',
       trickle: false,
       stream: stream
       });

       $('.chat__header').on('click', function(){
          localStorage.setItem('init', 'true');


       });



    peer.on('signal', function(data){
        console.log('scnd hit');
        alert(data);
        $('.myId').text(JSON.stringify(data));
    });


    $('.connect').on('click', function(){
        let data = $('.otherId').val();
        let otherId = JSON.parse(data);
        peer.signal(otherId);
    });

    $('.sendMessage').on('click', function(){
        let youreMessage = $('.messageText').val();
        console.log(youreMessage);
        peer.send(youreMessage);
    });

    peer.on('data', function(data){
        console.log('message recieved');
        let audio = new Audio('./res/meow.mp3');
        audio.play();
        $('.message').append(data + '\n');
    });

    peer.on('stream', function(stream){
            let video = document.createElement('video');
            $('.videochat__body').append(video);
            
            console.log(stream);

            video.srcObject = stream;
            video.play();
    });

}, function(err){
    console.log(err);
});